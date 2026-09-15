import pg from 'pg';

const { Pool } = pg;

let pool;

export function databaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }
  return pool;
}

export async function query(text, params = []) {
  const db = getPool();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  return db.query(text, params);
}
