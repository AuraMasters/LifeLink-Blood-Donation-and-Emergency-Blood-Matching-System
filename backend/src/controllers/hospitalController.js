import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { BloodInventory, ALL_BLOOD_GROUPS } from '../models/BloodInventory.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { withTransaction } from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const createHospital = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { hospital_name, phone, emergency_contact, latitude, longitude, address } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'hospital') {
      throw new AppError('User role is not hospital', 400);
    }

    const existingHospital = await Hospital.findByUserId(user_id);
    if (existingHospital) {
      throw new AppError('Hospital profile already exists', 400);
    }

    if (phone) {
      const existingPhone = await Hospital.findByPhone(phone);
      if (existingPhone) {
        throw new AppError('Hospital phone already exists', 400);
      }
    }

    
    const hospital = await Hospital.create({
      user_id,
      hospital_name: hospital_name?.trim(),
      phone: phone?.trim(),
      emergency_contact: emergency_contact?.trim(),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      address: address?.trim(),
    });

    return res.status(200).json({
      message: 'Hospital created successfully',
      hospital_id: String(hospital.id),
      user_id: String(user_id),
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.findAll();

    const formatted = hospitals.map((h) => ({
      id: String(h.id),
      user_id: String(h.user_id),
      hospital_name: h.hospital_name,
      phone: h.phone,
      emergency_contact: h.emergency_contact,
      latitude: Number(h.latitude) || 0,
      longitude: Number(h.longitude) || 0,
      address: h.address,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPublicHospitalsMap = async (req, res, next) => {
  try {
    const [hospitals, inventories, activeRequests] = await Promise.all([
      Hospital.findAll(),
      BloodInventory.findAll(),
      BloodRequest.findAll({ status: 'searching' }),
    ]);

    
    const inventoryMap = {};
    inventories.forEach((item) => {
      const hId = String(item.hospital_id);
      if (!inventoryMap[hId]) inventoryMap[hId] = {};
      inventoryMap[hId][item.blood_group] = item.units;
    });

    
    const requestMap = {};
    activeRequests.forEach((reqItem) => {
      const hId = String(reqItem.hospital_id);
      if (!requestMap[hId]) requestMap[hId] = [];
      requestMap[hId].push(reqItem.blood_group);
    });

    const response = hospitals.map((h) => {
      const hId = String(h.id);
      const hospitalStock = inventoryMap[hId] || {};
      const stockByGroup = {};
      let totalUnits = 0;

      ALL_BLOOD_GROUPS.forEach((bg) => {
        const units = hospitalStock[bg] || 0;
        stockByGroup[bg] = units;
        totalUnits += units;
      });

      const neededGroups = requestMap[hId] || [];

      return {
        id: hId,
        hospital_name: h.hospital_name,
        phone: h.phone,
        emergency_contact: h.emergency_contact,
        latitude: Number(h.latitude) || 0,
        longitude: Number(h.longitude) || 0,
        address: h.address,
        total_units: totalUnits,
        stock_by_group: stockByGroup,
        searching_requests_count: neededGroups.length,
        needed_groups: neededGroups,
      };
    });

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getHospitalByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const hospital = await Hospital.findByUserId(user_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      id: String(hospital.id),
      user_id: String(hospital.user_id),
      hospital_name: hospital.hospital_name,
      phone: hospital.phone,
      emergency_contact: hospital.emergency_contact,
      latitude: Number(hospital.latitude) || 0,
      longitude: Number(hospital.longitude) || 0,
      address: hospital.address,
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalById = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      id: String(hospital.id),
      user_id: String(hospital.user_id),
      hospital_name: hospital.hospital_name,
      phone: hospital.phone,
      emergency_contact: hospital.emergency_contact,
      latitude: Number(hospital.latitude) || 0,
      longitude: Number(hospital.longitude) || 0,
      address: hospital.address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const updates = { ...req.body };
    const hospital = await Hospital.update(hospital_id, updates);

    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      message: 'Hospital updated successfully',
      hospital: {
        id: String(hospital.id),
        user_id: String(hospital.user_id),
        hospital_name: hospital.hospital_name,
        phone: hospital.phone,
        emergency_contact: hospital.emergency_contact,
        latitude: Number(hospital.latitude) || 0,
        longitude: Number(hospital.longitude) || 0,
        address: hospital.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const deleted = await Hospital.delete(hospital_id);
    if (!deleted) {
      throw new AppError('Hospital not found', 404);
    }

    return res.status(200).json({
      message: 'Hospital deleted successfully',
      hospital_id: String(hospital_id),
    });
  } catch (error) {
    next(error);
  }
};
