// GET /api/climate/[slug]/stats?year=2025
// Vercel serverless function — replaces Express GET /:slug/stats

import { pool } from '../../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  const year = parseInt(req.query.year) || 2025;

  if (!slug) {
    return res.status(400).json({ error: 'Missing slug' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT cs.variable, cs.mean, cs.min, cs.max, cs.std_dev,
              cs.p10, cs.p90, cs.unit, cs.data_source, cs.computed_at
       FROM ava_climate_stats cs
       JOIN avas a ON a.id = cs.ava_id
       WHERE a.slug = $1
         AND cs.year  = $2
         AND cs.month IS NULL
       ORDER BY cs.variable`,
      [slug, year]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No climate stats found', slug, year });
    }

    const stats = {};
    for (const row of rows) {
      stats[row.variable] = {
        mean:        parseFloat(row.mean),
        min:         parseFloat(row.min),
        max:         parseFloat(row.max),
        std_dev:     parseFloat(row.std_dev),
        p10:         parseFloat(row.p10),
        p90:         parseFloat(row.p90),
        unit:        row.unit,
        data_source: row.data_source,
        computed_at: row.computed_at,
      };
    }

    res.json({ slug, year, stats });
  } catch (err) {
    console.error('Climate stats error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
