import { Notification } from '../models/Notification.js';
import { Donor } from '../models/Donor.js';
import { Hospital } from '../models/Hospital.js';
import { AppError } from '../middlewares/errorMiddleware.js';

export const getUserNotifications = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { role } = req.query;

    const recipientIds = [String(user_id)];

    try {
      const [donor, hospital] = await Promise.all([
        Donor.findByUserId(user_id),
        Hospital.findByUserId(user_id),
      ]);
      if (donor?.id) recipientIds.push(String(donor.id));
      if (hospital?.id) recipientIds.push(String(hospital.id));
    } catch {
      
    }

    const notifications = await Notification.findByRecipient(recipientIds, role, 50);

    const formatted = notifications.map((n) => ({
      id: String(n.id),
      recipient_id: n.recipient_id,
      recipient_role: n.recipient_role,
      notification_type: n.notification_type,
      title: n.title,
      message: n.message,
      blood_group: n.blood_group,
      request_id: n.request_id,
      is_read: Boolean(n.is_read),
      created_at: n.created_at ? new Date(n.created_at).toISOString() : new Date().toISOString(),
    }));

    const unreadCount = formatted.filter((n) => !n.is_read).length;

    return res.status(200).json({
      unread_count: unreadCount,
      notifications: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { notification_id } = req.params;

    const notification = await Notification.markRead(notification_id);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    return res.status(200).json({
      message: 'Notification marked as read',
      id: String(notification.id),
      is_read: true,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const recipientIds = [String(user_id)];
    try {
      const [donor, hospital] = await Promise.all([
        Donor.findByUserId(user_id),
        Hospital.findByUserId(user_id),
      ]);
      if (donor?.id) recipientIds.push(String(donor.id));
      if (hospital?.id) recipientIds.push(String(hospital.id));
    } catch {
      
    }

    await Notification.markAllRead(recipientIds);

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { notification_id } = req.params;

    const deleted = await Notification.delete(notification_id);
    if (!deleted) {
      throw new AppError('Notification not found', 404);
    }

    return res.status(200).json({
      message: 'Notification removed',
      id: String(notification_id),
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { recipient_id, recipient_role, notification_type, title, message, blood_group, request_id } = req.body;

    if (!title || !message) {
      throw new AppError('Title and message are required', 400);
    }

    const item = await Notification.create({
      recipient_id: recipient_id || 'all',
      recipient_role: recipient_role || 'all',
      notification_type: notification_type || 'system_alert',
      title,
      message,
      blood_group: blood_group || null,
      request_id: request_id || null,
      is_read: false,
    });

    return res.status(201).json({
      id: String(item.id),
      recipient_id: item.recipient_id,
      recipient_role: item.recipient_role,
      notification_type: item.notification_type,
      title: item.title,
      message: item.message,
      blood_group: item.blood_group,
      request_id: item.request_id,
      is_read: Boolean(item.is_read),
      created_at: item.created_at ? new Date(item.created_at).toISOString() : new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
