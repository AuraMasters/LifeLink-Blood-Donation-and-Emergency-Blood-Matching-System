import { DonationHistory } from '../models/DonationHistory.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { Notification } from '../models/Notification.js';
import { withTransaction } from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';

function generateCertificateId() {
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `LL-${year}-${randomChars}`;
}

export const getAllDonationHistory = async (req, res, next) => {
  try {
    const history = await DonationHistory.findAll();

    const formatted = history.map((item) => ({
      id: String(item.id),
      donor_id: String(item.donor_id),
      hospital_id: String(item.hospital_id),
      blood_request_id: item.blood_request_id ? String(item.blood_request_id) : null,
      pledge_id: item.pledge_id ? String(item.pledge_id) : null,
      blood_group: item.blood_group,
      units: item.units,
      donation_date: item.donation_date ? new Date(item.donation_date).toISOString() : new Date().toISOString(),
      donor_name: item.donor_name,
      hospital_name: item.hospital_name,
      hospital_address: item.hospital_address || '',
      certificate_id: item.certificate_id,
      status: item.status,
      remarks: item.remarks,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getDonorHistory = async (req, res, next) => {
  try {
    const { donor_id } = req.params;

    const donor = await Donor.findById(donor_id);
    if (!donor) {
      throw new AppError('Donor not found', 404);
    }

    const history = await DonationHistory.findByDonorId(donor_id);

    const formattedHistory = history.map((item) => ({
      id: String(item.id),
      donor_id: String(item.donor_id),
      hospital_id: String(item.hospital_id),
      blood_request_id: item.blood_request_id ? String(item.blood_request_id) : null,
      pledge_id: item.pledge_id ? String(item.pledge_id) : null,
      blood_group: item.blood_group,
      units: item.units,
      donation_date: item.donation_date ? new Date(item.donation_date).toISOString() : new Date().toISOString(),
      donor_name: item.donor_name,
      hospital_name: item.hospital_name,
      hospital_address: item.hospital_address || '',
      certificate_id: item.certificate_id,
      status: item.status,
      remarks: item.remarks,
    }));

    
    const totalDonations = formattedHistory.length;
    const totalUnits = formattedHistory.reduce((sum, item) => sum + (item.units || 1), 0);
    const livesSaved = totalUnits * 3;

    let daysSinceLastDonation = null;
    if (donor.last_donation_date) {
      const lastDate = new Date(donor.last_donation_date);
      if (!isNaN(lastDate.getTime())) {
        const diffTime = new Date().getTime() - lastDate.getTime();
        daysSinceLastDonation = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      }
    }

    let heroTier = 'New Lifesaver';
    if (totalDonations >= 10) heroTier = 'Platinum Hero';
    else if (totalDonations >= 5) heroTier = 'Gold Guardian';
    else if (totalDonations >= 3) heroTier = 'Silver Savior';
    else if (totalDonations >= 1) heroTier = 'Bronze Champion';

    return res.status(200).json({
      donor_id: String(donor_id),
      blood_group: donor.blood_group,
      availability: Boolean(donor.availability),
      last_donation_date: donor.last_donation_date || null,
      days_since_last_donation: daysSinceLastDonation,
      total_donations: totalDonations,
      total_units: totalUnits,
      lives_saved: livesSaved,
      hero_tier: heroTier,
      history: formattedHistory,
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalHistory = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const history = await DonationHistory.findByHospitalId(hospital_id);

    const formatted = history.map((item) => ({
      id: String(item.id),
      donor_id: String(item.donor_id),
      hospital_id: String(item.hospital_id),
      blood_request_id: item.blood_request_id ? String(item.blood_request_id) : null,
      pledge_id: item.pledge_id ? String(item.pledge_id) : null,
      blood_group: item.blood_group,
      units: item.units,
      donation_date: item.donation_date ? new Date(item.donation_date).toISOString() : new Date().toISOString(),
      donor_name: item.donor_name,
      hospital_name: item.hospital_name,
      hospital_address: item.hospital_address || '',
      certificate_id: item.certificate_id,
      status: item.status,
      remarks: item.remarks,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const createDirectDonation = async (req, res, next) => {
  try {
    const { donor_id, hospital_id, blood_group, units = 1, remarks, blood_request_id } = req.body;

    if (!donor_id) {
      throw new AppError('Invalid donor ID', 400);
    }
    if (!hospital_id) {
      throw new AppError('Invalid hospital ID', 400);
    }

    const [donor, hospital, bloodRequest] = await Promise.all([
      Donor.findById(donor_id),
      Hospital.findById(hospital_id),
      blood_request_id ? BloodRequest.findById(blood_request_id) : null,
    ]);

    if (!donor) throw new AppError('Donor not found', 404);
    if (!hospital) throw new AppError('Hospital not found', 404);

    const donorName = donor.donor_name || 'Verified Donor';
    const group = blood_group ? blood_group.toUpperCase() : donor.blood_group;
    const unitsCount = Math.max(1, Number(units) || 1);
    const certificateId = generateCertificateId();

    let historyEntry = null;

    
    await withTransaction(async (conn) => {
      
      
      
      
      historyEntry = await DonationHistory.create(
        {
          donor_id,
          hospital_id,
          blood_request_id: bloodRequest ? bloodRequest.id : (blood_request_id || null),
          blood_group: group,
          units: unitsCount,
          donation_date: new Date(),
          donor_name: donorName,
          hospital_name: hospital.hospital_name,
          hospital_address: hospital.address || '',
          certificate_id: certificateId,
          status: 'verified',
          remarks: remarks || `Clinical donation of ${unitsCount} unit(s) verified by ${hospital.hospital_name}`,
        },
        conn
      );
    });

    if (donor.user_id) {
      await Notification.create({
        recipient_id: String(donor.user_id),
        recipient_role: 'donor',
        notification_type: 'donation_verified',
        title: `Donation Verified - Certificate #${certificateId}`,
        message: `Thank you, ${donorName}! Your blood donation of ${unitsCount} unit(s) (${group}) at ${hospital.hospital_name} has been verified. Certificate #${certificateId} is now available in your Donation History.`,
        blood_group: group,
      });
    }

    return res.status(201).json({
      message: 'Donation successfully verified and recorded.',
      history: historyEntry,
      certificate_id: certificateId,
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateById = async (req, res, next) => {
  try {
    const { certificate_id } = req.params;

    const record = await DonationHistory.findByCertificateId(certificate_id);
    if (!record) {
      throw new AppError('Certificate not found or invalid certificate ID', 404);
    }

    return res.status(200).json({
      id: String(record.id),
      certificate_id: record.certificate_id,
      donor_name: record.donor_name,
      hospital_name: record.hospital_name,
      hospital_address: record.hospital_address,
      blood_group: record.blood_group,
      units: record.units,
      donation_date: record.donation_date ? new Date(record.donation_date).toISOString() : '',
      status: record.status,
      remarks: record.remarks,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDonationHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await DonationHistory.delete(id);
    if (!deleted) {
      throw new AppError('Donation record not found', 404);
    }

    return res.status(200).json({
      message: 'Donation history record deleted',
      id: String(id),
    });
  } catch (error) {
    next(error);
  }
};
