import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory, ALL_BLOOD_GROUPS } from '../models/BloodInventory.js';
import { DonationHistory } from '../models/DonationHistory.js';
import { DonationPledge } from '../models/DonationPledge.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      statusCounts,
      totalDonations,
      totalPledges,
      inventoryStock,
    ] = await Promise.all([
      User.count(),
      Donor.count(),
      Hospital.count(),
      BloodRequest.count(),
      BloodRequest.getStatusCounts(),
      DonationHistory.count(),
      DonationPledge.count(),
      BloodInventory.getAggregatedStock(),
    ]);

    let activeRequests = 0;
    let fulfilledRequests = 0;
    statusCounts.forEach((g) => {
      if (g.status === 'searching') activeRequests = Number(g.count);
      if (g.status === 'fulfilled' || g.status === 'completed') fulfilledRequests += Number(g.count);
    });

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
      totalUsers,
      totalDonors,
      totalHospitals,
      totalRequests,
      activeRequests,
      fulfilledRequests,
      totalDonations,
      totalPledges,
      totalStockUnits,
      stockByGroup,
    });
  } catch (error) {
    next(error);
  }
};
