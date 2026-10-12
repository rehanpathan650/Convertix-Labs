import crypto from 'node:crypto';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import './env.js';

async function createPool() {
  // PG_MEM=1 → in-memory Postgres for local smoke tests only (never set in production)
  if (process.env.PG_MEM) {
    const { newDb } = await import('pg-mem');
    const mem = newDb();
    mem.public.registerFunction({ name: 'gen_random_uuid', returns: 'uuid', implementation: () => crypto.randomUUID(), impure: true });
    return new (mem.adapters.createPg().Pool)();
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set (use your Neon connection string).');
  const p = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 30000 });
  p.on('error', e => console.error('Idle DB client error (Neon may have suspended the connection):', e.message));
  return p;
}

export const pool = await createPool();

export async function migrate() {
  await pool.query(`create table if not exists leads(
    id uuid primary key default gen_random_uuid(),
    name text not null, company text not null, email text not null, phone text,
    answers jsonb not null default '{}',
    status text not null default 'new', stage text not null default 'review',
    notes text not null default '', created_at timestamptz not null default now())`);
  await pool.query(`create table if not exists users(
    id uuid primary key default gen_random_uuid(),
    email text not null unique, password_hash text not null, role text not null default 'client',
    lead_id uuid references leads(id), created_at timestamptz not null default now())`);
  await pool.query(`create table if not exists invites(
    token_hash text primary key, lead_id uuid not null references leads(id),
    expires_at timestamptz not null, used_at timestamptz)`);

  const { ADMIN_EMAIL: email, ADMIN_PASSWORD: pw } = process.env;
  if (email && pw) {
    const { rowCount } = await pool.query('select 1 from users where email=$1', [email.toLowerCase()]);
    if (!rowCount) {
      await pool.query(`insert into users(email,password_hash,role) values($1,$2,'admin')`, [email.toLowerCase(), await bcrypt.hash(pw, 12)]);
      console.log(`Seeded admin user ${email}`);
    }
  }
}
