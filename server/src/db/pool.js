import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isNeon = process.env.DATABASE_URL?.includes('neon.tech');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon serverless requires SSL; harmless on local Docker
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

// Neon's default search_path omits public — set it on every new connection
if (isNeon) {
  pool.on('connect', (client) => {
    client.query('SET search_path TO public');
  });
}

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});
