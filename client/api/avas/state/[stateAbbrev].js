// GET /api/avas/state/[stateAbbrev]?geometry=true|false
// Vercel serverless function — replaces Express GET /api/avas/state/:stateAbbrev

import { pool } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const abbrev = (req.query.stateAbbrev || '').toUpperCase();
  const includeGeometry = req.query.geometry !== 'false';

  if (!abbrev) {
    return res.status(400).json({ error: 'Missing stateAbbrev' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         a.id,
         a.slug,
         a.ava_id,
         a.name,
         a.aka,
         a.created,
         a.removed,
         a.cfr_index,
         a.valid_start,
         a.valid_end,
         ${includeGeometry ? 'ST_AsGeoJSON(a.geometry)::json AS geometry,' : ''}
         ST_AsGeoJSON(a.centroid)::json AS centroid,
         array_agg(DISTINCT s.abbreviation ORDER BY s.abbreviation) AS states,
         (
           SELECT string_agg(parent.name, '|' ORDER BY parent.name)
           FROM ava_hierarchy h
           JOIN avas parent ON h.parent_id = parent.id
           WHERE h.child_id = a.id
         ) AS within
       FROM avas a
       JOIN ava_states av ON a.id = av.ava_id
       JOIN states s ON av.state_id = s.id
       WHERE a.id IN (
         SELECT av2.ava_id
         FROM ava_states av2
         JOIN states s2 ON av2.state_id = s2.id
         WHERE s2.abbreviation = $1
       )
       GROUP BY a.id
       ORDER BY a.name`,
      [abbrev]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: `No AVAs found for state: ${abbrev}` });
    }

    const featureCollection = {
      type: 'FeatureCollection',
      features: rows.map((row) => ({
        type: 'Feature',
        properties: {
          id:         row.id,
          slug:       row.slug,
          ava_id:     row.ava_id,
          name:       row.name,
          aka:        row.aka,
          created:    row.created,
          removed:    row.removed,
          cfr_index:  row.cfr_index,
          valid_start: row.valid_start,
          valid_end:  row.valid_end,
          states:     row.states,
          within:     row.within,
          centroid:   row.centroid,
        },
        geometry: includeGeometry ? row.geometry : null,
      })),
    };

    res.json(featureCollection);
  } catch (err) {
    console.error('State AVAs error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
