import { pool } from '../config/db.js';

export class Hospital {
  static async findById(id, connection = pool) {
    const [rows] = await connection.query(
      `SELECT h.*, u.name AS user_name, u.email
       FROM hospitals h
       JOIN users u ON h.user_id = u.id
       WHERE h.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT h.*, u.name AS user_name, u.email
       FROM hospitals h
       JOIN users u ON h.user_id = u.id
       WHERE h.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  static async findByPhone(phone, connection = pool) {
    const [rows] = await connection.query(
      `SELECT h.*, u.name AS user_name, u.email
       FROM hospitals h
       JOIN users u ON h.user_id = u.id
       WHERE h.phone = ?`,
      [phone.trim()]
    );
    return rows[0] || null;
  }

  static async findAll(connection = pool) {
    const [rows] = await connection.query(
      `SELECT h.*, u.name AS user_name, u.email
       FROM hospitals h
       JOIN users u ON h.user_id = u.id
       ORDER BY h.created_at DESC`
    );
    return rows;
  }

  static async create(
    {
      user_id,
      hospital_name,
      phone,
      emergency_contact,
      address,
      latitude = 0.0,
      longitude = 0.0,
    },
    connection = pool
  ) {
    const [rows] = await connection.query(
      `INSERT INTO hospitals
       (user_id, hospital_name, phone, emergency_contact, address, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        user_id,
        hospital_name.trim(),
        phone.trim(),
        emergency_contact.trim(),
        address.trim(),
        Number(latitude) || 0,
        Number(longitude) || 0,
      ]
    );
    return await this.findById(rows[0].id, connection);
  }

  static async update(id, fields, connection = pool) {
    const allowed = [
      'hospital_name',
      'phone',
      'emergency_contact',
      'address',
      'latitude',
      'longitude',
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return await this.findById(id, connection);

    values.push(id);
    await connection.query(`UPDATE hospitals SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.findById(id, connection);
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM hospitals WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async deleteByUserId(userId, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM hospitals WHERE user_id = ?', [userId]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM hospitals');
    return parseInt(rows[0]?.total || '0', 10);
  }
}

export default Hospital;
