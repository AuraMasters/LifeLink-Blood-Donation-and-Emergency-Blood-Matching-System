import { pool } from '../config/db.js';

export const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class BloodInventory {
  static async findByHospitalId(hospitalId, connection = pool) {
    const [rows] = await connection.query(
      `SELECT id, hospital_id, blood_group, units, updated_at
       FROM blood_inventory
       WHERE hospital_id = ?
       ORDER BY ARRAY_POSITION(ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], blood_group)`,
      [hospitalId]
    );
    return rows;
  }

  static async findByHospitalAndGroup(hospitalId, bloodGroup, connection = pool) {
    const [rows] = await connection.query(
      `SELECT id, hospital_id, blood_group, units, updated_at
       FROM blood_inventory
       WHERE hospital_id = ? AND blood_group = ?`,
      [hospitalId, bloodGroup.toUpperCase()]
    );
    return rows[0] || null;
  }

  static async findAll(connection = pool) {
    const [rows] = await connection.query(
      'SELECT id, hospital_id, blood_group, units, updated_at FROM blood_inventory'
    );
    return rows;
  }

  static async upsert({ hospital_id, blood_group, units }, connection = pool) {
    await connection.query(
      `INSERT INTO blood_inventory (hospital_id, blood_group, units)
       VALUES (?, ?, ?)
       ON CONFLICT (hospital_id, blood_group)
       DO UPDATE SET units = EXCLUDED.units, updated_at = CURRENT_TIMESTAMP`,
      [hospital_id, blood_group.toUpperCase(), Math.max(0, Number(units) || 0)]
    );
    return await this.findByHospitalAndGroup(hospital_id, blood_group, connection);
  }

  static async incrementUnits(hospital_id, blood_group, delta = 1, connection = pool) {
    await connection.query(
      `INSERT INTO blood_inventory (hospital_id, blood_group, units)
       VALUES (?, ?, ?)
       ON CONFLICT (hospital_id, blood_group)
       DO UPDATE SET units = blood_inventory.units + EXCLUDED.units, updated_at = CURRENT_TIMESTAMP`,
      [hospital_id, blood_group.toUpperCase(), Math.max(1, Number(delta) || 1)]
    );
    return await this.findByHospitalAndGroup(hospital_id, blood_group, connection);
  }

  static async decrementUnits(hospital_id, blood_group, delta = 1, connection = pool) {
    await connection.query(
      `UPDATE blood_inventory
       SET units = GREATEST(0, units - ?), updated_at = CURRENT_TIMESTAMP
       WHERE hospital_id = ? AND blood_group = ?`,
      [Math.max(1, Number(delta) || 1), hospital_id, blood_group.toUpperCase()]
    );
    return await this.findByHospitalAndGroup(hospital_id, blood_group, connection);
  }

  static async deleteByHospitalId(hospitalId, connection = pool) {
    const [rows, result] = await connection.query(
      'DELETE FROM blood_inventory WHERE hospital_id = ?',
      [hospitalId]
    );
    return result?.rowCount || 0;
  }

  static async getAggregatedStock(connection = pool) {
    const [rows] = await connection.query(
      `SELECT blood_group, SUM(units) AS totalUnits
       FROM blood_inventory
       GROUP BY blood_group`
    );
    return rows;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM blood_inventory');
    return parseInt(rows[0]?.total || '0', 10);
  }
}

export default BloodInventory;
