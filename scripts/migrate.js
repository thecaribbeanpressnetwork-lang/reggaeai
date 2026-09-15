import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required. No migration was attempted.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false },
  max: 1
});

async function sqlFiles() {
  const files = [{ name: '000_schema.sql', fullPath: path.join(process.cwd(), 'db', 'schema.sql') }];
  const migrationDir = path.join(process.cwd(), 'db', 'migrations');
  const names = (await fs.readdir(migrationDir)).filter((name) => name.endsWith('.sql')).sort();
  for (const name of names) files.push({ name, fullPath: path.join(migrationDir, name) });
  return files;
}

try {
  await pool.query(`create table if not exists schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`);

  for (const file of await sqlFiles()) {
    const applied = await pool.query('select 1 from schema_migrations where name = $1', [file.name]);
    if (applied.rowCount) continue;
    const sql = await fs.readFile(file.fullPath, 'utf8');
    const client = await pool.connect();
    try {
      await client.query('begin');
      await client.query(sql);
      await client.query('insert into schema_migrations (name) values ($1)', [file.name]);
      await client.query('commit');
      console.log(`applied ${file.name}`);
    } catch (error) {
      await client.query('rollback');
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
