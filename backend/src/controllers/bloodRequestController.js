import { BloodRequest } from '../models/BloodRequest.js';
import { Hospital } from '../models/Hospital.js';
import { Donor } from '../models/Donor.js';
import { Notification } from '../models/Notification.js';
import { getCompatibleDonorGroups, getCompatibleRecipientGroups } from '../utils/bloodMatchingEngine.js';
import { AppError } from '../middlewares/errorMiddleware.js';

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const VALID_URGENCIES = ['normal', 'urgent', 'emergency'];
const VALID_STATUSES = ['searching', 'fulfilled', 'cancelled', 'completed'];

export const createBloodRequest = async (req, res, next) => {
  try {
    const { hospital_id, blood_group, units_required, urgency, patient_name, required_by } = req.body;

    if (!hospital_id) {
      throw new AppError('Hospital ID is required', 400);
    }

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    const group = blood_group ? blood_group.toUpperCase().trim() : '';
    if (!VALID_BLOOD_GROUPS.includes(group)) {
      throw new AppError('Invalid blood group', 400);
    }

    const units = Number(units_required);
    if (isNaN(units) || units <= 0) {
      throw new AppError('Units required must be greater than 0', 400);
    }

    const urg = (urgency || 'normal').toLowerCase().trim();
    if (!VALID_URGENCIES.includes(urg)) {
      throw new AppError('Urgency must be normal, urgent, or emergency', 400);
    }

    const newRequest = await BloodRequest.create({
      hospital_id,
      blood_group: group,
      units_required: units,
      initial_units_required: units,
      urgency: urg,
      patient_name: patient_name || null,
      required_by: required_by || null,
      status: 'searching',
    });

    // Notify all medically compatible available donors
    try {
      const compatibleGroups = getCompatibleDonorGroups(group, 'rbc');
      const matchingDonors = await Donor.findByGroups(compatibleGroups, true);
      for (const d of matchingDonors) {
        const isExact = d.blood_group === group;
        await Notification.create({
          recipient_id: String(d.user_id || d.id),
          recipient_role: 'donor',
          notification_type: 'emergency_alert',
          title: isExact
            ? `Exact Blood Match: ${units} Unit(s) of ${group}`
            : `Compatible Blood Need: ${units} Unit(s) of ${group} (You: ${d.blood_group})`,
          message: `${hospital.hospital_name} has broadcasted an urgent requirement for ${group} blood. Your blood group (${d.blood_group}) is medically compatible. Please check details to pledge.`,
          blood_group: group,
          request_id: String(newRequest.id),
        });
      }
    } catch {
      // Non-blocking notification dispatch
    }

    return res.status(200).json({
      id: String(newRequest.id),
      hospital_id: String(newRequest.hospital_id),
      blood_group: newRequest.blood_group,
      units_required: newRequest.units_required,
      initial_units_required: newRequest.initial_units_required || newRequest.units_required,
      urgency: newRequest.urgency,
      patient_name: newRequest.patient_name,
      required_by: newRequest.required_by,
      status: newRequest.status,
      created_at: newRequest.created_at ? new Date(newRequest.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBloodRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.findAll();

    const formatted = requests.map((r) => {
      const isSatisfied = (r.units_required <= 0) || r.status === 'fulfilled' || r.status === 'completed';
      return {
        id: String(r.id),
        hospital_id: String(r.hospital_id),
        hospital_name: r.hospital_name || 'Medical Center',
        hospital_phone: r.hospital_phone || '',
        emergency_contact: r.emergency_contact || '',
        hospital_address: r.hospital_address || '',
        hospital_latitude: Number(r.hospital_latitude) || 0,
        hospital_longitude: Number(r.hospital_longitude) || 0,
        blood_group: r.blood_group,
        units_required: r.units_required,
        initial_units_required: r.initial_units_required || r.units_required,
        urgency: r.urgency,
        patient_name: r.patient_name || null,
        required_by: r.required_by || null,
        status: isSatisfied && r.status === 'searching' ? 'fulfilled' : r.status,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getHospitalBloodRequests = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const requests = await BloodRequest.findByHospitalId(hospital_id);

    const formatted = requests.map((r) => {
      const isSatisfied = (r.units_required <= 0) || r.status === 'fulfilled' || r.status === 'completed';
      return {
        id: String(r.id),
        hospital_id: String(r.hospital_id),
        blood_group: r.blood_group,
        units_required: r.units_required,
        initial_units_required: r.initial_units_required || r.units_required,
        urgency: r.urgency,
        patient_name: r.patient_name || null,
        required_by: r.required_by || null,
        status: isSatisfied && r.status === 'searching' ? 'fulfilled' : r.status,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getDonorBloodRequests = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    const donor = await Donor.findById(donor_id);
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    const donorBloodGroup = donor.blood_group;
    if (!donorBloodGroup) {
      throw new AppError('Donor blood group not found', 400);
    }

    // Find all recipient blood groups that this donor is medically compatible to donate to
    const compatibleRecipientGroups = getCompatibleRecipientGroups(donorBloodGroup);

    const requests = await BloodRequest.findAll({
      blood_group: compatibleRecipientGroups,
      status: 'searching',
    });

    const formatted = requests.map((r) => ({
      id: String(r.id),
      hospital_id: String(r.hospital_id),
      hospital_name: r.hospital_name || 'Medical Center',
      hospital_phone: r.hospital_phone || '',
      emergency_contact: r.emergency_contact || '',
      hospital_address: r.hospital_address || '',
      hospital_latitude: Number(r.hospital_latitude) || 0,
      hospital_longitude: Number(r.hospital_longitude) || 0,
      blood_group: r.blood_group,
      units_required: r.units_required,
      initial_units_required: r.initial_units_required || r.units_required,
      urgency: r.urgency,
      patient_name: r.patient_name || null,
      required_by: r.required_by || null,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getBloodRequestById = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    const r = await BloodRequest.findById(request_id);
    if (!r) {
      throw new AppError('Blood request not found', 404);
    }

    const isSatisfied = (r.units_required <= 0) || r.status === 'fulfilled' || r.status === 'completed';
    return res.status(200).json({
      id: String(r.id),
      hospital_id: String(r.hospital_id),
      hospital_name: r.hospital_name || 'Medical Center',
      hospital_phone: r.hospital_phone || '',
      emergency_contact: r.emergency_contact || '',
      hospital_address: r.hospital_address || '',
      hospital_latitude: Number(r.hospital_latitude) || 0,
      hospital_longitude: Number(r.hospital_longitude) || 0,
      blood_group: r.blood_group,
      units_required: r.units_required,
      initial_units_required: r.initial_units_required || r.units_required,
      urgency: r.urgency,
      patient_name: r.patient_name || null,
      required_by: r.required_by || null,
      status: isSatisfied && r.status === 'searching' ? 'fulfilled' : r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;
    const { blood_group, units_required, urgency, patient_name, required_by, status } = req.body;

    const existingRequest = await BloodRequest.findById(request_id);
    if (!existingRequest) {
      throw new AppError('Blood request not found', 404);
    }

    // Terminal State Lock
    if (existingRequest.status === 'fulfilled' || existingRequest.status === 'completed') {
      if (status && status !== existingRequest.status) {
        throw new AppError(
          `This blood request is already ${existingRequest.status} and locked. Fulfilled or completed requests cannot be reverted to searching or modified.`,
          400
        );
      }
    }

    const updates = {};
    if (blood_group) {
      const group = blood_group.toUpperCase().trim();
      if (!VALID_BLOOD_GROUPS.includes(group)) {
        throw new AppError('Invalid blood group', 400);
      }
      updates.blood_group = group;
    }

    if (units_required !== undefined) {
      const units = Number(units_required);
      if (isNaN(units) || units < 0) {
        throw new AppError('Units required must be 0 or greater', 400);
      }
      updates.units_required = units;
    }

    if (urgency) {
      const urg = urgency.toLowerCase().trim();
      if (!VALID_URGENCIES.includes(urg)) {
        throw new AppError('Invalid urgency', 400);
      }
      updates.urgency = urg;
    }

    if (patient_name !== undefined) updates.patient_name = patient_name;
    if (required_by !== undefined) updates.required_by = required_by;

    if (status !== undefined) {
      const st = status.toLowerCase().trim();
      if (!VALID_STATUSES.includes(st)) {
        throw new AppError('Invalid request status', 400);
      }
      if (existingRequest.status === 'fulfilled' || existingRequest.status === 'completed') {
        updates.status = existingRequest.status;
      } else {
        updates.status = st;
      }
    }

    const updated = await BloodRequest.update(request_id, updates);

    return res.status(200).json({
      id: String(updated.id),
      hospital_id: String(updated.hospital_id),
      blood_group: updated.blood_group,
      units_required: updated.units_required,
      urgency: updated.urgency,
      patient_name: updated.patient_name || null,
      required_by: updated.required_by || null,
      status: updated.status,
      created_at: updated.created_at ? new Date(updated.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBloodRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    const deleted = await BloodRequest.delete(request_id);
    if (!deleted) {
      throw new AppError('Blood request not found', 404);
    }

    return res.status(200).json({
      message: 'Blood request deleted successfully',
      id: String(request_id),
    });
  } catch (error) {
    next(error);
  }
};
