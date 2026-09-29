import { User } from '../models/User.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { withTransaction } from '../config/db.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password_hash, password, role } = req.body;
    const pwd = password_hash || password;

    if (!name || !email || !pwd || !role) {
      throw new AppError('Name, email, password, and role are required', 400);
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already exists', 400);
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: pwd,
      role: role.toLowerCase().trim(),
    });

    return res.status(200).json({
      message: 'User created successfully',
      user_id: String(user.id),
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    const formatted = users.map((u) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      role: u.role,
      created_at: u.created_at ? new Date(u.created_at).toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { name, email, password, password_hash } = req.body;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updates = {};

    if (email && email.toLowerCase().trim() !== user.email.toLowerCase()) {
      const existing = await User.findByEmail(email);
      if (existing && String(existing.id) !== String(user_id)) {
        throw new AppError('Email is already registered by another user', 400);
      }
      updates.email = email.toLowerCase().trim();
    }

    if (name && name.trim()) {
      updates.name = name.trim();
    }

    const pwd = password_hash || password;
    if (pwd && pwd.trim()) {
      updates.password_hash = pwd.trim();
    }

    await withTransaction(async (conn) => {
      await User.update(user_id, updates, conn);
      if (name && name.trim() && user.role === 'hospital') {
        const hospital = await Hospital.findByUserId(user_id, conn);
        if (hospital) {
          await Hospital.update(hospital.id, { hospital_name: name.trim() }, conn);
        }
      }
    });

    const updatedUser = await User.findById(user_id);

    let profileId = null;
    let bloodGroup = null;

    if (updatedUser.role === 'donor') {
      const donor = await Donor.findByUserId(user_id);
      if (donor) {
        profileId = String(donor.id);
        bloodGroup = donor.blood_group;
      }
    } else if (updatedUser.role === 'hospital') {
      const hospital = await Hospital.findByUserId(user_id);
      if (hospital) {
        profileId = String(hospital.id);
      }
    }

    return res.status(200).json({
      message: 'User profile updated successfully',
      id: String(updatedUser.id),
      user_id: String(updatedUser.id),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profile_id: profileId,
      blood_group: bloodGroup,
      user: {
        id: String(updatedUser.id),
        user_id: String(updatedUser.id),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile_id: profileId,
        blood_group: bloodGroup,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const user = await User.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    
    let donorDeleted = false;
    let hospitalDeleted = false;

    await withTransaction(async (conn) => {
      const donor = await Donor.findByUserId(user_id, conn);
      if (donor) donorDeleted = true;

      const hospital = await Hospital.findByUserId(user_id, conn);
      if (hospital) hospitalDeleted = true;

      
      await User.delete(user_id, conn);
    });

    return res.status(200).json({
      message: 'User and related profiles deleted successfully',
      user_id,
      donor_deleted: donorDeleted,
      hospital_deleted: hospitalDeleted,
    });
  } catch (error) {
    next(error);
  }
};
