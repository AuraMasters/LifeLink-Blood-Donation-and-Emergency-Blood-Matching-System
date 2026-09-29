import { DonationPledge } from '../models/DonationPledge.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { Hospital } from '../models/Hospital.js';
import { Donor } from '../models/Donor.js';
import { User } from '../models/User.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { Notification } from '../models/Notification.js';
import { withTransaction } from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';

function generateCertificateId() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LL-${year}-${randomChars}`;
}

export const createPledge = async (req, res, next) => {
  try {
    const { request_id, donor_id, estimated_arrival, notes } = req.body;

    if (!request_id) {
      throw new AppError('Valid request ID is required', 400);
    }
    if (!donor_id) {
      throw new AppError('Valid donor ID is required', 400);
    }

    const [bloodRequest, donor] = await Promise.all([
      BloodRequest.findById(request_id),
      Donor.findById(donor_id),
    ]);

    if (!bloodRequest) throw new AppError('Blood request not found', 404);
    if (!donor) throw new AppError('Donor not found', 404);

    const donorName = donor.donor_name || 'Volunteer Donor';
    const donorPhone = donor.phone || '';

    // Check if donor already has an active pledge for this request
    const existingPledge = await DonationPledge.findActive(request_id, donor_id);

    if (existingPledge) {
      return res.status(200).json({
        message: 'Active pledge already registered for this request',
        pledge: existingPledge,
      });
    }

    const pledge = await DonationPledge.create({
      request_id,
      hospital_id: bloodRequest.hospital_id,
      donor_id,
      donor_user_id: donor.user_id,
      donor_name: donorName,
      donor_phone: donorPhone,
      blood_group: donor.blood_group,
      status: 'pledged',
      estimated_arrival: estimated_arrival || 'Within 2 hours',
      notes: notes || '',
    });

    // Notify Hospital of the incoming pledge
    const hospital = await Hospital.findById(bloodRequest.hospital_id);
    if (hospital && hospital.user_id) {
      await Notification.create({
        recipient_id: String(hospital.user_id),
        recipient_role: 'hospital',
        notification_type: 'pledge_received',
        title: `Donor Pledge for ${bloodRequest.blood_group} Blood`,
        message: `${donorName} (${donor.blood_group}) has pledged to donate for your ${bloodRequest.blood_group} request. Estimated arrival: ${pledge.estimated_arrival}. Contact: ${donorPhone}`,
        blood_group: donor.blood_group,
        request_id: String(request_id),
      });
    }

    return res.status(201).json({
      message: 'Donation pledge recorded successfully',
      pledge,
    });
  } catch (error) {
    next(error);
  }
};

export const getPledgesByRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params;

    const pledges = await DonationPledge.findByRequestId(request_id);

    const formatted = pledges.map((p) => ({
      id: String(p.id),
      request_id: String(p.request_id),
      hospital_id: String(p.hospital_id),
      donor_id: String(p.donor_id),
      donor_user_id: String(p.donor_user_id),
      donor_name: p.donor_name,
      donor_phone: p.donor_phone,
      blood_group: p.blood_group,
      status: p.status,
      estimated_arrival: p.estimated_arrival,
      notes: p.notes,
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPledgesByHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const pledges = await DonationPledge.findByHospitalId(hospital_id);

    const formatted = pledges.map((p) => ({
      id: String(p.id),
      request_id: String(p.request_id),
      hospital_id: String(p.hospital_id),
      donor_id: String(p.donor_id),
      donor_user_id: String(p.donor_user_id),
      donor_name: p.donor_name,
      donor_phone: p.donor_phone,
      blood_group: p.blood_group,
      status: p.status,
      estimated_arrival: p.estimated_arrival,
      notes: p.notes,
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getPledgesByDonor = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    const pledges = await DonationPledge.findByDonorId(donor_id);

    const formatted = pledges.map((p) => ({
      id: String(p.id),
      request_id: String(p.request_id),
      hospital_id: String(p.hospital_id),
      hospital_name: p.hospital_name || 'Medical Center',
      hospital_phone: p.emergency_contact || p.hospital_phone || '',
      hospital_address: p.hospital_address || '',
      hospital_latitude: Number(p.hospital_latitude) || 0,
      hospital_longitude: Number(p.hospital_longitude) || 0,
      donor_id: String(p.donor_id),
      donor_name: p.donor_name,
      donor_phone: p.donor_phone,
      blood_group: p.blood_group,
      status: p.status,
      estimated_arrival: p.estimated_arrival,
      notes: p.notes,
      urgency: p.urgency || 'normal',
      patient_name: p.patient_name || null,
      created_at: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const updatePledgeStatus = async (req, res, next) => {
  try {
    const { pledge_id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['pledged', 'acknowledged', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status.toLowerCase())) {
      throw new AppError('Invalid status value', 400);
    }

    const updates = {};
    if (status) updates.status = status.toLowerCase();
    if (notes !== undefined) updates.notes = notes;

    const updated = await DonationPledge.update(pledge_id, updates);
    if (!updated) {
      throw new AppError('Pledge not found', 404);
    }

    return res.status(200).json({
      message: `Pledge status updated to ${updated.status}`,
      pledge: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const completePledgeAndVerifyDonation = async (req, res, next) => {
  try {
    const { pledge_id } = req.params;
    const { units = 1, remarks } = req.body;

    const unitsCount = Math.max(1, Number(units) || 1);

    const pledge = await DonationPledge.findById(pledge_id);
    if (!pledge) {
      throw new AppError('Pledge not found', 404);
    }

    const [hospital, donor, bloodRequest] = await Promise.all([
      Hospital.findById(pledge.hospital_id),
      Donor.findById(pledge.donor_id),
      BloodRequest.findById(pledge.request_id),
    ]);

    const donorName = donor ? donor.donor_name : pledge.donor_name;
    const hospitalName = hospital ? hospital.hospital_name : 'Hospital Facility';
    const hospitalAddress = hospital ? hospital.address : '';
    const certificateId = generateCertificateId();

    // Execute multi-table updates inside an explicit ACID Transaction
    let historyEntry = null;

    await withTransaction(async (conn) => {
      // 1. Mark pledge completed
      await DonationPledge.update(pledge_id, { status: 'completed' }, conn);

      // 2. Insert verified DonationHistory
      // NOTE: Trigger `trg_after_donation_history_insert` automatically updates:
      //  - blood_inventory (increments units)
      //  - donors.last_donation_date
      //  - blood_requests.units_required & status
      historyEntry = await DonationHistory.create(
        {
          donor_id: pledge.donor_id,
          hospital_id: pledge.hospital_id,
          blood_request_id: pledge.request_id,
          pledge_id: pledge.id,
          blood_group: pledge.blood_group,
          units: unitsCount,
          donation_date: new Date(),
          donor_name: donorName,
          hospital_name: hospitalName,
          hospital_address: hospitalAddress,
          certificate_id: certificateId,
          status: 'verified',
          remarks: remarks || `Emergency donation of ${unitsCount} unit(s) verified by ${hospitalName}.`,
        },
        conn
      );
    });

    // Send celebration & certificate Notification to Donor
    const donorRecipientId = donor ? String(donor.user_id || donor.id) : '';
    if (donorRecipientId) {
      await Notification.create({
        recipient_id: donorRecipientId,
        recipient_role: 'donor',
        notification_type: 'donation_verified',
        title: `Donation Verified! Certificate #${certificateId}`,
        message: `Thank you, ${donorName}! Your blood donation of ${unitsCount} unit(s) (${pledge.blood_group}) at ${hospitalName} has been verified. You saved up to ${unitsCount * 3} lives today! View your official certificate in Donation History.`,
        blood_group: pledge.blood_group,
        request_id: String(pledge.request_id),
      });
    }

    return res.status(200).json({
      message: 'Donation verified successfully! Blood inventory updated and digital certificate issued.',
      history: historyEntry,
      certificate_id: certificateId,
    });
  } catch (error) {
    next(error);
  }
};
