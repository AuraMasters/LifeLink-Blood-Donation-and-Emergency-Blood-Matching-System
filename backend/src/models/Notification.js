import { pool } from '../config/db.js';

export class Notification {
  static async findByRecipient(recipientIds, role = null, limit = 50, connection = pool) {
    if (!Array.isArray(recipientIds)) {
      recipientIds = [String(recipientIds)];
    }

    const idPlaceholders = recipientIds.map(() => '?').join(',');
    const params = [...recipientIds];

    let sql = `SELECT * FROM notifications
               WHERE (recipient_id IN (${idPlaceholders}) OR recipient_role = 'all'`;

    if (role) {
      sql += ' OR recipient_role = ?';
      params.push(role);
    }

    sql += ') ORDER BY created_at DESC LIMIT ?';
    params.push(Number(limit) || 50);

    const [rows] = await connection.query(sql, params);
    return rows;
  }

  static async findById(id, connection = pool) {
    const [rows] = await connection.query('SELECT * FROM notifications WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(
    {
      recipient_id,
      recipient_role = 'all',
      notification_type = 'emergency_alert',
      title,
      message,
      blood_group = null,
      request_id = null,
      is_read = false,
    },
    connection = pool
  ) {
    const [rows] = await connection.query(
      `INSERT INTO notifications
       (recipient_id, recipient_role, notification_type, title, message, blood_group, request_id, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        String(recipient_id || 'all'),
        (recipient_role || 'all').toLowerCase(),
        notification_type || 'emergency_alert',
        title.trim(),
        message.trim(),
        blood_group ? blood_group.toUpperCase() : null,
        request_id ? String(request_id) : null,
        Boolean(is_read),
      ]
    );
    return rows[0];
  }

  static async markRead(id, connection = pool) {
    const [rows] = await connection.query(
      'UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *',
      [id]
    );
    return rows[0] || null;
  }

  static async markAllRead(recipientIds, connection = pool) {
    if (!Array.isArray(recipientIds)) {
      recipientIds = [String(recipientIds)];
    }
    const placeholders = recipientIds.map(() => '?').join(',');
    const [rows, result] = await connection.query(
      `UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE recipient_id IN (${placeholders}) AND is_read = FALSE`,
      recipientIds
    );
    return result?.rowCount || 0;
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM notifications WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM notifications');
    return parseInt(rows[0]?.total || '0', 10);
  }
}

export default Notification;
