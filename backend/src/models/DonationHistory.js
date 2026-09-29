import { pool } from '../config/db.js';

export class DonationHistory {
  static async findById(id, connection = pool) {
    const [rows] = await connection.query(
      `SELECT h.*,
              d.user_id AS donor_user_id,
              d.phone AS donor_phone
       FROM donation_history h
       JOIN donors d ON h.donor_id = d.id
       WHERE h.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByCertificateId(certificateId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT h.*,
              d.user_id AS donor_user_id,
              d.phone AS donor_phone
       FROM donation_history h
       JOIN donors d ON h.donor_id = d.id
       WHERE h.certificate_id = ?`,
      [certificateId.trim()]
    );
    return rows[0] || null;
  }

  static async findByDonorId(donorId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT * FROM donation_history
       WHERE donor_id = ?
       ORDER BY donation_date DESC`,
      [donorId]
    );
    return rows;
  }

  static async findByHospitalId(hospitalId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT * FROM donation_history
       WHERE hospital_id = ?
       ORDER BY donation_date DESC`,
      [hospitalId]
    );
    return rows;
  }

  static async findAll(connection = pool) {
    const [rows] = await connection.query(
      `SELECT * FROM donation_history
       ORDER BY donation_date DESC`
    );
    return rows;
  }

  static async create(
    {
      donor_id,
      hospital_id,
      blood_request_id = null,
      pledge_id = null,
      blood_group,
      units = 1,
      donation_date = new Date(),
      donor_name,
      hospital_name,
      hospital_address = '',
      certificate_id,
      status = 'verified',
      remarks = null,
    },
    connection = pool
  ) {
    const unitsCount = Math.max(1, Number(units) || 1);
    const dateVal = donation_date instanceof Date ? donation_date : new Date(donation_date);

    const [rows] = await connection.query(
      `INSERT INTO donation_history
       (donor_id, hospital_id, blood_request_id, pledge_id, blood_group, units, donation_date, donor_name, hospital_name, hospital_address, certificate_id, status, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING *`,
      [
        donor_id,
        hospital_id,
        blood_request_id || null,
        pledge_id || null,
        blood_group.toUpperCase(),
        unitsCount,
        dateVal,
        donor_name.trim(),
        hospital_name.trim(),
        hospital_address ? hospital_address.trim() : '',
        certificate_id.trim(),
        (status || 'verified').toLowerCase(),
        remarks || null,
      ]
    );
    return await this.findById(rows[0].id, connection);
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM donation_history WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM donation_history');
    return parseInt(rows[0]?.total || '0', 10);
  }

  static async getUnitsByRequest(requestId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT SUM(units) AS totalUnits
       FROM donation_history
       WHERE blood_request_id = ? AND status IN ('verified', 'completed')`,
      [requestId]
    );
    return Number(rows[0]?.totalunits) || 0;
  }
}

export default DonationHistory;
