import { pool } from '../config/db.js';

export class BloodRequest {
  static async findById(id, connection = pool) {
    const [rows] = await connection.query(
      `SELECT r.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       WHERE r.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByHospitalId(hospitalId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT r.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       WHERE r.hospital_id = ?
       ORDER BY r.created_at DESC`,
      [hospitalId]
    );
    return rows;
  }

  static async findAll(filters = {}, connection = pool) {
    const conditions = [];
    const values = [];

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        conditions.push(`r.status IN (${filters.status.map(() => '?').join(',')})`);
        values.push(...filters.status);
      } else {
        conditions.push('r.status = ?');
        values.push(filters.status);
      }
    }

    if (filters.blood_group) {
      if (Array.isArray(filters.blood_group)) {
        conditions.push(`r.blood_group IN (${filters.blood_group.map(() => '?').join(',')})`);
        values.push(...filters.blood_group);
      } else {
        conditions.push('r.blood_group = ?');
        values.push(filters.blood_group);
      }
    }

    if (filters.hospital_id) {
      conditions.push('r.hospital_id = ?');
      values.push(filters.hospital_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await connection.query(
      `SELECT r.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude
       FROM blood_requests r
       JOIN hospitals h ON r.hospital_id = h.id
       ${whereClause}
       ORDER BY r.created_at DESC`,
      values
    );
    return rows;
  }

  static async create(
    {
      hospital_id,
      blood_group,
      units_required,
      initial_units_required,
      urgency = 'normal',
      patient_name = null,
      required_by = null,
      status = 'searching',
    },
    connection = pool
  ) {
    const units = Math.max(1, Number(units_required) || 1);
    const initialUnits = Math.max(1, Number(initial_units_required) || units);

    const [rows] = await connection.query(
      `INSERT INTO blood_requests
       (hospital_id, blood_group, units_required, initial_units_required, urgency, patient_name, required_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        hospital_id,
        blood_group.toUpperCase(),
        units,
        initialUnits,
        (urgency || 'normal').toLowerCase(),
        patient_name || null,
        required_by || null,
        (status || 'searching').toLowerCase(),
      ]
    );

    return await this.findById(rows[0].id, connection);
  }

  static async update(id, fields, connection = pool) {
    const allowed = [
      'blood_group',
      'units_required',
      'initial_units_required',
      'urgency',
      'patient_name',
      'required_by',
      'status',
    ];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        if (key === 'blood_group') values.push(value.toUpperCase());
        else if (key === 'urgency' || key === 'status') values.push(value.toLowerCase());
        else values.push(value);
      }
    }

    if (updates.length === 0) return await this.findById(id, connection);

    values.push(id);
    await connection.query(`UPDATE blood_requests SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.findById(id, connection);
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM blood_requests WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(filters = {}, connection = pool) {
    const conditions = [];
    const values = [];

    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM blood_requests ${whereClause}`, values);
    return parseInt(rows[0]?.total || '0', 10);
  }

  static async getStatusCounts(connection = pool) {
    const [rows] = await connection.query(
      'SELECT status, COUNT(*) AS count FROM blood_requests GROUP BY status'
    );
    return rows;
  }
}

export default BloodRequest;
