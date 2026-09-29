import pg from 'pg';
import { config } from './env.js';

const { Pool } = pg;

const isLocal =
  config.databaseUrl.includes('127.0.0.1') ||
  config.databaseUrl.includes('localhost');

export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle client error on PostgreSQL pool:', err.message);
});

export const formatSql = (sql) => {
  if (!sql.includes('?')) return sql;
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
};

export const query = async (sql, params = []) => {
  const formatted = formatSql(sql);
  const result = await pool.query(formatted, params);
  return [result.rows, result];
};

export const withTransaction = async (workFn) => {
  const client = await pool.connect();
  const conn = {
    query: async (sql, params = []) => {
      const formatted = formatSql(sql);
      const res = await client.query(formatted, params);
      return [res.rows, res];
    },
  };

  try {
    await client.query('BEGIN');
    const result = await workFn(conn);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
    }
    throw error;
  } finally {
    client.release();
  }
};

let initPromise = null;

export const connectDB = async () => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const client = await pool.connect();
      const res = await client.query(
        'SELECT 1 + 1 AS health, current_database() AS db_name, version() AS pg_version'
      );
      const dbName = res.rows[0]?.db_name || 'postgres';
      console.log(`PostgreSQL (Supabase) Connected successfully to [${dbName}]`);
      client.release();
      return pool;
    } catch (error) {
      initPromise = null;
      console.error('PostgreSQL (Supabase) Connection Error:', error.message);
      throw error;
    }
  })();

  return initPromise;
};

export default pool;
