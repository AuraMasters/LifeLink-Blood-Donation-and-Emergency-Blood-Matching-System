import { pool } from '../config/db.js';

export class DonationPledge {
  static async findById(id, connection = pool) {
    const [rows] = await connection.query(
      `SELECT p.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude,
              r.blood_group AS req_blood_group,
              r.urgency,
              r.patient_name
       FROM donation_pledges p
       JOIN hospitals h ON p.hospital_id = h.id
       JOIN blood_requests r ON p.request_id = r.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByRequestId(requestId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT p.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude
       FROM donation_pledges p
       JOIN hospitals h ON p.hospital_id = h.id
       WHERE p.request_id = ?
       ORDER BY p.created_at DESC`,
      [requestId]
    );
    return rows;
  }

  static async findByHospitalId(hospitalId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT p.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude
       FROM donation_pledges p
       JOIN hospitals h ON p.hospital_id = h.id
       WHERE p.hospital_id = ?
       ORDER BY p.created_at DESC`,
      [hospitalId]
    );
    return rows;
  }

  static async findByDonorId(donorId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT p.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact,
              h.address AS hospital_address,
              h.latitude AS hospital_latitude,
              h.longitude AS hospital_longitude,
              r.blood_group AS req_blood_group,
              r.urgency,
              r.patient_name
       FROM donation_pledges p
       JOIN hospitals h ON p.hospital_id = h.id
       JOIN blood_requests r ON p.request_id = r.id
       WHERE p.donor_id = ?
       ORDER BY p.created_at DESC`,
      [donorId]
    );
    return rows;
  }

  static async findActive(requestId, donorId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT * FROM donation_pledges
       WHERE request_id = ? AND donor_id = ? AND status IN ('pledged', 'acknowledged')`,
      [requestId, donorId]
    );
    return rows[0] || null;
  }

  static async findAll(connection = pool) {
    const [rows] = await connection.query(
      `SELECT p.*,
              h.hospital_name,
              h.phone AS hospital_phone,
              h.emergency_contact
       FROM donation_pledges p
       JOIN hospitals h ON p.hospital_id = h.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  }

  static async create(
    {
      request_id,
      hospital_id,
      donor_id,
      donor_user_id,
      donor_name,
      donor_phone,
      blood_group,
      status = 'pledged',
      estimated_arrival = 'Within 1 hour',
      notes = '',
    },
    connection = pool
  ) {
    const [rows] = await connection.query(
      `INSERT INTO donation_pledges
       (request_id, hospital_id, donor_id, donor_user_id, donor_name, donor_phone, blood_group, status, estimated_arrival, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        request_id,
        hospital_id,
        donor_id,
        donor_user_id,
        donor_name.trim(),
        donor_phone.trim(),
        blood_group.toUpperCase(),
        (status || 'pledged').toLowerCase(),
        estimated_arrival || 'Within 1 hour',
        notes || '',
      ]
    );
    return await this.findById(rows[0].id, connection);
  }

  static async update(id, fields, connection = pool) {
    const allowed = ['status', 'estimated_arrival', 'notes'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        if (key === 'status') values.push(value.toLowerCase());
        else values.push(value);
      }
    }

    if (updates.length === 0) return await this.findById(id, connection);

    values.push(id);
    await connection.query(`UPDATE donation_pledges SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.findById(id, connection);
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM donation_pledges WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM donation_pledges');
    return parseInt(rows[0]?.total || '0', 10);
  }
}

export default DonationPledge;
