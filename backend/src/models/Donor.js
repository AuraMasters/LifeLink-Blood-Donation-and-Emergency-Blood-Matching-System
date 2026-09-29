import { pool } from '../config/db.js';

export class Donor {
  static async findById(id, connection = pool) {
    const [rows] = await connection.query(
      `SELECT d.*, u.name AS donor_name, u.email, u.created_at AS user_created_at
       FROM donors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT d.*, u.name AS donor_name, u.email, u.created_at AS user_created_at
       FROM donors d
       JOIN users u ON d.user_id = u.id
       WHERE d.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  }

  static async findAll(connection = pool) {
    const [rows] = await connection.query(
      `SELECT d.*, u.name AS donor_name, u.email, u.created_at AS user_created_at
       FROM donors d
       JOIN users u ON d.user_id = u.id
       ORDER BY d.created_at DESC`
    );
    return rows;
  }

  static async findByGroups(bloodGroups, onlyAvailable = false, connection = pool) {
    if (!bloodGroups || bloodGroups.length === 0) return [];
    const placeholders = bloodGroups.map(() => '?').join(',');
    const params = [...bloodGroups];

    let sql = `SELECT d.*, u.name AS donor_name, u.email
               FROM donors d
               JOIN users u ON d.user_id = u.id
               WHERE d.blood_group IN (${placeholders})`;

    if (onlyAvailable) {
      sql += ' AND d.availability = TRUE';
    }

    sql += ' ORDER BY d.created_at DESC';

    const [rows] = await connection.query(sql, params);
    return rows;
  }

  static async create(
    {
      user_id,
      blood_group,
      phone,
      address = '',
      latitude = 0.0,
      longitude = 0.0,
      availability = true,
      last_donation_date = null,
    },
    connection = pool
  ) {
    const [rows] = await connection.query(
      `INSERT INTO donors
       (user_id, blood_group, phone, address, latitude, longitude, availability, last_donation_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        user_id,
        blood_group.toUpperCase(),
        phone.trim(),
        address.trim(),
        Number(latitude) || 0,
        Number(longitude) || 0,
        Boolean(availability),
        last_donation_date || null,
      ]
    );
    return await this.findById(rows[0].id, connection);
  }

  static async update(id, fields, connection = pool) {
    const allowed = [
      'blood_group',
      'phone',
      'address',
      'latitude',
      'longitude',
      'availability',
      'last_donation_date',
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        if (key === 'blood_group') {
          values.push(value.toUpperCase());
        } else if (key === 'availability') {
          values.push(Boolean(value));
        } else {
          values.push(value);
        }
      }
    }

    if (updates.length === 0) return await this.findById(id, connection);

    values.push(id);
    await connection.query(`UPDATE donors SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.findById(id, connection);
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM donors WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async deleteByUserId(userId, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM donors WHERE user_id = ?', [userId]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM donors');
    return parseInt(rows[0]?.total || '0', 10);
  }
}

export default Donor;
