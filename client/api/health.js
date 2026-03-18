// GET /api/health
import { pool } from './lib/db.js';

export default async function handler(req, res) {
  let dbOk = false;
  try {
    await pool.query('SELECT 1');
    dbOk = true;
  } catch {
    // db not reachable
  }

  res.status(dbOk ? 200 : 503).json({
    status:    dbOk ? 'OK' : 'DEGRADED',
    db:        dbOk ? 'connected' : 'unavailable',
    timestamp: new Date().toISOString(),
    service:   'terranthro-api',
  });
}
