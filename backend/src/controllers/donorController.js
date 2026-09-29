import { Donor } from '../models/Donor.js';
import { User } from '../models/User.js';
import { Hospital } from '../models/Hospital.js';
import { Notification } from '../models/Notification.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const createDonor = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { blood_group, phone, address, latitude, longitude, availability, last_donation_date } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'donor') {
      throw new AppError('User role is not donor', 400);
    }

    const existingDonor = await Donor.findByUserId(user_id);
    if (existingDonor) {
      throw new AppError('Donor profile already exists', 400);
    }

    const donor = await Donor.create({
      user_id,
      blood_group: blood_group ? blood_group.toUpperCase() : 'O+',
      phone: phone || '',
      address: address || '',
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      availability: availability !== undefined ? Boolean(availability) : true,
      last_donation_date: last_donation_date || null,
    });

    return res.status(200).json({
      message: 'Donor created successfully',
      donor_id: String(donor.id),
      user_id: String(user_id),
    });
  } catch (error) {
    next(error);
  }
};

export const getDonors = async (req, res, next) => {
  try {
    const donors = await Donor.findAll();

    const formatted = donors.map((d) => ({
      id: String(d.id),
      user_id: String(d.user_id),
      donor_name: d.donor_name || 'Registered Donor',
      email: d.email || '',
      blood_group: d.blood_group,
      phone: d.phone,
      address: d.address || '',
      latitude: Number(d.latitude) || 0,
      longitude: Number(d.longitude) || 0,
      availability: Boolean(d.availability),
      last_donation_date: d.last_donation_date || null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getDonorByUserId = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const donor = await Donor.findByUserId(user_id);
    if (!donor) {
      throw new AppError('Donor profile not found', 404);
    }

    return res.status(200).json({
      id: String(donor.id),
      user_id: String(donor.user_id),
      donor_name: donor.donor_name || 'Registered Donor',
      email: donor.email || '',
      blood_group: donor.blood_group,
      phone: donor.phone,
      address: donor.address || '',
      latitude: Number(donor.latitude) || 0,
      longitude: Number(donor.longitude) || 0,
      availability: Boolean(donor.availability),
      last_donation_date: donor.last_donation_date || null,
    });
  } catch (error) {
    next(error);
  }
};

export const getDonorById = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    const donor = await Donor.findById(donor_id);
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    return res.status(200).json({
      id: String(donor.id),
      user_id: String(donor.user_id),
      donor_name: donor.donor_name || 'Registered Donor',
      email: donor.email || '',
      blood_group: donor.blood_group,
      phone: donor.phone,
      address: donor.address || '',
      latitude: Number(donor.latitude) || 0,
      longitude: Number(donor.longitude) || 0,
      availability: Boolean(donor.availability),
      last_donation_date: donor.last_donation_date || null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDonor = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    const updates = { ...req.body };
    if (updates.blood_group) {
      updates.blood_group = updates.blood_group.toUpperCase();
    }

    const donor = await Donor.update(donor_id, updates);
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    return res.status(200).json({
      message: 'Donor updated successfully',
      donor: {
        id: String(donor.id),
        user_id: String(donor.user_id),
        blood_group: donor.blood_group,
        phone: donor.phone,
        address: donor.address || '',
        latitude: Number(donor.latitude) || 0,
        longitude: Number(donor.longitude) || 0,
        availability: Boolean(donor.availability),
        last_donation_date: donor.last_donation_date || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDonor = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    const deleted = await Donor.delete(donor_id);
    if (!deleted) {
      throw new AppError('Donor not found', 404);
    }

    return res.status(200).json({
      message: 'Donor deleted successfully',
      donor_id: String(donor_id),
    });
  } catch (error) {
    next(error);
  }
};

export const sendDirectDonorRequest = async (req, res, next) => {
  try {
    const { donor_id } = req.params;
    const { hospital_id, message } = req.body;

    const [donor, hospital] = await Promise.all([
      Donor.findById(donor_id),
      Hospital.findById(hospital_id),
    ]);

    if (!donor) throw new AppError('Donor not found', 404);
    if (!hospital) throw new AppError('Hospital not found', 404);

    const alertMessage =
      message ||
      `CLINICAL DIRECTIVE: ${hospital.hospital_name} is in critical need of your blood type (${donor.blood_group}). Please check your matching requests or contact the facility triage desk immediately at ${hospital.emergency_contact || hospital.phone}.`;

    const notification = await Notification.create({
      recipient_id: String(donor.user_id || donor.id),
      recipient_role: 'donor',
      notification_type: 'direct_urgent_request',
      title: `Emergency Clinical Directive from ${hospital.hospital_name}`,
      message: alertMessage,
      blood_group: donor.blood_group,
    });

    return res.status(200).json({
      message: `Emergency clinical directive dispatched to donor (${donor.blood_group})`,
      notification,
    });
  } catch (error) {
    next(error);
  }
};
