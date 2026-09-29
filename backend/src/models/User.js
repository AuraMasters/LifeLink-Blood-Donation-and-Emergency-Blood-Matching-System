import { pool } from '../config/db.js';

export class User {
  static async findById(id, connection = pool) {
    const [rows] = await connection.query(
      'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email, connection = pool) {
    const [rows] = await connection.query(
      'SELECT id, name, email, password_hash, role, created_at, updated_at FROM users WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );
    return rows[0] || null;
  }

  static async findAll(connection = pool) {
    const [rows] = await connection.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async create({ name, email, password_hash, role = 'donor' }, connection = pool) {
    const [rows] = await connection.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role.toLowerCase().trim()]
    );
    return rows[0];
  }

  static async update(id, fields, connection = pool) {
    const allowed = ['name', 'email', 'password_hash', 'role'];
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
    await connection.query(`UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return await this.findById(id, connection);
  }

  static async delete(id, connection = pool) {
    const [rows, result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);
    return (result?.rowCount || 0) > 0;
  }

  static async count(connection = pool) {
    const [rows] = await connection.query('SELECT COUNT(*) AS total FROM users');
    return parseInt(rows[0]?.total || '0', 10);
  }
}

export default User;
