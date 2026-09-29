import { pool, withTransaction } from '../config/db.js';
import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory, ALL_BLOOD_GROUPS } from '../models/BloodInventory.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { DonationPledge } from '../models/DonationPledge.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const getAdminOverview = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      activeRequestsCount,
      totalDonations,
      totalPledges,
      inventoryStock,
      recentRequests,
      recentDonations,
      recentPledges,
    ] = await Promise.all([
      User.count(),
      Donor.count(),
      Hospital.count(),
      BloodRequest.count(),
      BloodRequest.count({ status: 'searching' }),
      DonationHistory.count(),
      DonationPledge.count(),
      BloodInventory.getAggregatedStock(),
      BloodRequest.findAll(),
      DonationHistory.findAll(),
      DonationPledge.findAll(),
    ]);

    const stockByGroup = {};
    let totalStockUnits = 0;
    ALL_BLOOD_GROUPS.forEach((bg) => {
      stockByGroup[bg] = 0;
    });

    inventoryStock.forEach((item) => {
      if (item.blood_group) {
        const units = Number(item.totalUnits) || 0;
        stockByGroup[item.blood_group] = units;
        totalStockUnits += units;
      }
    });

    return res.status(200).json({
      stats: {
        totalUsers,
        totalDonors,
        totalHospitals,
        totalRequests,
        activeRequests: activeRequestsCount,
        totalDonations,
        totalPledges,
        totalStockUnits,
        stockByGroup,
      },
      recentActivity: {
        requests: recentRequests.slice(0, 5).map((r) => ({
          id: String(r.id),
          hospital_name: r.hospital_name || 'Hospital',
          blood_group: r.blood_group,
          units_required: r.units_required,
          urgency: r.urgency,
          status: r.status,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        })),
        donations: recentDonations.slice(0, 5).map((d) => ({
          id: String(d.id),
          donor_name: d.donor_name,
          hospital_name: d.hospital_name,
          blood_group: d.blood_group,
          units: d.units,
          certificate_id: d.certificate_id,
          donation_date: d.donation_date ? new Date(d.donation_date).toISOString() : new Date().toISOString(),
        })),
        pledges: recentPledges.slice(0, 5).map((p) => ({
          id: String(p.id),
          donor_name: p.donor_name,
          blood_group: p.blood_group,
          status: p.status,
          estimated_arrival: p.estimated_arrival,
          created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
        })),
      },
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        dbStatus: 'connected',
        databaseEngine: 'PostgreSQL (Supabase, ACID Transactions & PL/pgSQL Triggers)',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const [
      usersCount,
      donorsCount,
      hospitalsCount,
      requestsCount,
      inventoryCount,
      historyCount,
      pledgesCount,
      notificationsCount,
    ] = await Promise.all([
      User.count(),
      Donor.count(),
      Hospital.count(),
      BloodRequest.count(),
      BloodInventory.count(),
      DonationHistory.count(),
      DonationPledge.count(),
      Notification.count(),
    ]);

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        state: 'connected',
        engine: 'PostgreSQL (Supabase)',
        databaseName: 'postgres',
        tables: {
          users: usersCount,
          donors: donorsCount,
          hospitals: hospitalsCount,
          blood_requests: requestsCount,
          blood_inventory: inventoryCount,
          donation_history: historyCount,
          donation_pledges: pledgesCount,
          notifications: notificationsCount,
        },
      },
      process: {
        uptime: `${Math.floor(process.uptime())}s`,
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        platform: process.platform,
        nodeVersion: process.version,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const [donors, hospitals] = await Promise.all([Donor.findAll(), Hospital.findAll()]);

    const donorMap = new Map(donors.map((d) => [String(d.user_id), d]));
    const hospitalMap = new Map(hospitals.map((h) => [String(h.user_id), h]));

    const formatted = users.map((u) => {
      const uId = String(u.id);
      const d = donorMap.get(uId);
      const h = hospitalMap.get(uId);

      return {
        id: uId,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
        blood_group: d ? d.blood_group : undefined,
        phone: d ? d.phone : h ? h.phone : undefined,
        emergency_contact: h ? h.emergency_contact : undefined,
        hospital_name: h ? h.hospital_name : undefined,
        address: d ? d.address : h ? h.address : undefined,
        availability: d ? Boolean(d.availability) : undefined,
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, role, blood_group, phone, address, emergency_contact, latitude, longitude } =
      req.body;

    if (!name || !email || !password || !role) {
      throw new AppError('Name, email, password, and role are required', 400);
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    let user = null;
    let profile = null;

    await withTransaction(async (conn) => {
      user = await User.create(
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password_hash: password.trim(),
          role: role.toLowerCase().trim(),
        },
        conn
      );

      if (role.toLowerCase() === 'donor') {
        profile = await Donor.create(
          {
            user_id: user.id,
            blood_group: blood_group ? blood_group.toUpperCase() : 'O+',
            phone: phone || '+1 (555) 000-0000',
            address: address || '',
            latitude: Number(latitude) || 0,
            longitude: Number(longitude) || 0,
            availability: true,
          },
          conn
        );
      } else if (role.toLowerCase() === 'hospital') {
        profile = await Hospital.create(
          {
            user_id: user.id,
            hospital_name: name.trim(),
            phone: phone || '+1 (555) 000-0000',
            emergency_contact: emergency_contact || phone || '+1 (555) 911-0000',
            address: address || 'Medical Center Drive',
            latitude: Number(latitude) || 0,
            longitude: Number(longitude) || 0,
          },
          conn
        );
        
      }
    });

    return res.status(201).json({
      message: 'Account created successfully by Administrator',
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        profile_id: profile ? String(profile.id) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updates = {};
    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = await User.findByEmail(email);
      if (existing && String(existing.id) !== String(user_id)) {
        throw new AppError('Email already exists on another account', 400);
      }
      updates.email = email.toLowerCase().trim();
    }

    if (name) updates.name = name.trim();
    if (password && password.trim()) updates.password_hash = password.trim();
    if (role && ['donor', 'hospital', 'admin'].includes(role.toLowerCase())) {
      updates.role = role.toLowerCase();
    }

    const updated = await User.update(user_id, updates);

    return res.status(200).json({
      message: 'User updated successfully',
      id: String(updated.id),
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await withTransaction(async (conn) => {
      
      await conn.query('DELETE FROM notifications WHERE recipient_id = ?', [String(user_id)]);
      
      await User.delete(user_id, conn);
    });

    return res.status(200).json({
      message: 'User account and all related records deleted successfully',
      user_id: String(user_id),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDonors = async (req, res, next) => {
  try {
    const donors = await Donor.findAll();

    const formatted = donors.map((d) => ({
      id: String(d.id),
      donor_id: String(d.id),
      user_id: String(d.user_id),
      name: d.donor_name || 'Registered Donor',
      email: d.email || '',
      blood_group: d.blood_group,
      phone: d.phone,
      address: d.address || '',
      latitude: Number(d.latitude) || 0,
      longitude: Number(d.longitude) || 0,
      availability: Boolean(d.availability),
      last_donation_date: d.last_donation_date || null,
      created_at: d.created_at ? new Date(d.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getAdminHospitals = async (req, res, next) => {
  try {
    const [hospitals, inventories] = await Promise.all([Hospital.findAll(), BloodInventory.findAll()]);

    const inventoryMap = new Map();
    inventories.forEach((inv) => {
      const hId = String(inv.hospital_id);
      if (!inventoryMap.has(hId)) inventoryMap.set(hId, {});
      inventoryMap.get(hId)[inv.blood_group] = inv.units;
    });

    const formatted = hospitals.map((h) => {
      const hId = String(h.id);
      const stock = inventoryMap.get(hId) || {};
      const totalUnits = Object.values(stock).reduce((sum, n) => sum + (n || 0), 0);

      return {
        id: hId,
        hospital_id: hId,
        hospital_name: h.hospital_name,
        name: h.hospital_name,
        email: h.email || '',
        phone: h.phone,
        emergency_contact: h.emergency_contact,
        address: h.address,
        latitude: Number(h.latitude) || 0,
        longitude: Number(h.longitude) || 0,
        total_units: totalUnits,
        stock_by_group: stock,
        created_at: h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getAdminRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.findAll();

    const formatted = requests.map((r) => ({
      id: String(r.id),
      hospital_id: String(r.hospital_id),
      hospital_name: r.hospital_name || 'Hospital Facility',
      name: r.hospital_name || 'Hospital Facility',
      phone: r.hospital_phone || '',
      emergency_contact: r.emergency_contact || '',
      address: r.hospital_address || '',
      blood_group: r.blood_group,
      units_required: r.units_required,
      initial_units_required: r.initial_units_required || r.units_required,
      urgency: r.urgency,
      patient_name: r.patient_name || '',
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getAdminCertificates = async (req, res, next) => {
  try {
    const history = await DonationHistory.findAll();

    const formatted = history.map((h) => ({
      id: String(h.id),
      certificate_id: h.certificate_id,
      name: `${h.donor_name} (Cert #${h.certificate_id})`,
      donor_name: h.donor_name,
      hospital_name: h.hospital_name,
      blood_group: h.blood_group,
      units: h.units,
      donation_date: h.donation_date ? new Date(h.donation_date).toISOString() : new Date().toISOString(),
      created_at: h.created_at ? new Date(h.created_at).toISOString() : new Date().toISOString(),
      remarks: h.remarks,
      status: h.status,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};
