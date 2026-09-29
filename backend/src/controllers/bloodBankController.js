import { Hospital } from '../models/Hospital.js';
import { BloodInventory, ALL_BLOOD_GROUPS } from '../models/BloodInventory.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const getBloodBank = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;

    const inventory = await BloodInventory.findByHospitalId(hospital_id);

    const inventoryMap = {};
    inventory.forEach((item) => {
      inventoryMap[item.blood_group] = item.units;
    });

    const response = ALL_BLOOD_GROUPS.map((group) => ({
      blood_group: group,
      units: inventoryMap[group] !== undefined ? inventoryMap[group] : 0,
    }));

    return res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateBloodBank = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;
    let { blood_group, units } = req.body;

    const hospital = await Hospital.findById(hospital_id);
    if (!hospital) {
      throw new AppError('Hospital not found', 404);
    }

    if (!blood_group) {
      throw new AppError('Blood group is required', 400);
    }

    blood_group = blood_group.toUpperCase().trim();

    if (!ALL_BLOOD_GROUPS.includes(blood_group)) {
      throw new AppError('Invalid blood group', 400);
    }

    const unitCount = Number(units);
    if (isNaN(unitCount) || unitCount < 0) {
      throw new AppError('Units cannot be negative', 400);
    }

    await BloodInventory.upsert({
      hospital_id: hospital.id,
      blood_group,
      units: unitCount,
    });

    return res.status(200).json({
      message: 'Blood inventory updated successfully',
      blood_group,
      units: unitCount,
    });
  } catch (error) {
    next(error);
  }
};
