// Shared Neon Postgres pool for Vercel serverless functions.
// Vercel reuses module instances across warm invocations, so the pool
// is created once and reused — exactly like a traditional server.

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Serverless-safe: small pool, short idle timeout
  max: 3,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('connect', (client) => {
  client.query('SET search_path TO public');
});

pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

export { pool };
