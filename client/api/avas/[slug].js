// GET /api/avas/[slug]
// Vercel serverless function — replaces Express GET /api/avas/:slug
// Also handles sub-routes: ?sub=children | parents | state/:abbrev

import { pool } from '../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Missing slug' });
  }

  try {
    // Main AVA row
    const avaResult = await pool.query(
      `SELECT a.*,
              ST_AsGeoJSON(a.geometry)::json AS geometry_json,
              ST_AsGeoJSON(a.centroid)::json  AS centroid_json
       FROM avas a
       WHERE a.slug = $1`,
      [slug]
    );

    if (avaResult.rows.length === 0) {
      return res.status(404).json({ error: `AVA not found: ${slug}` });
    }

    const ava = avaResult.rows[0];

    // Run related queries in parallel
    const [statesResult, countiesResult, parentsResult, childrenResult] =
      await Promise.all([
        pool.query(
          `SELECT s.abbreviation, s.name
           FROM states s
           JOIN ava_states av ON s.id = av.state_id
           WHERE av.ava_id = $1
           ORDER BY s.abbreviation`,
          [ava.id]
        ),
        pool.query(
          `SELECT c.name, s.abbreviation AS state
           FROM counties c
           JOIN ava_counties ac ON c.id = ac.county_id
           JOIN states s ON c.state_id = s.id
           WHERE ac.ava_id = $1
           ORDER BY s.abbreviation, c.name`,
          [ava.id]
        ),
        pool.query(
          `SELECT a.slug, a.name
           FROM avas a
           JOIN ava_hierarchy h ON a.id = h.parent_id
           WHERE h.child_id = $1
           ORDER BY a.name`,
          [ava.id]
        ),
        pool.query(
          `SELECT a.slug, a.name
           FROM avas a
           JOIN ava_hierarchy h ON a.id = h.child_id
           WHERE h.parent_id = $1
           ORDER BY a.name`,
          [ava.id]
        ),
      ]);

    res.json({
      type: 'Feature',
      properties: {
        id:                    ava.id,
        slug:                  ava.slug,
        ava_id:                ava.ava_id,
        name:                  ava.name,
        aka:                   ava.aka,
        created:               ava.created,
        removed:               ava.removed,
        petitioner:            ava.petitioner,
        cfr_author:            ava.cfr_author,
        cfr_index:             ava.cfr_index,
        cfr_revision_history:  ava.cfr_revision_history,
        approved_maps:         ava.approved_maps,
        boundary_description:  ava.boundary_description,
        used_maps:             ava.used_maps,
        valid_start:           ava.valid_start,
        valid_end:             ava.valid_end,
        lcsh:                  ava.lcsh,
        sameas:                ava.sameas,
        states:                statesResult.rows,
        counties:              countiesResult.rows,
        parents:               parentsResult.rows,
        children:              childrenResult.rows,
      },
      geometry: ava.geometry_json,
    });
  } catch (err) {
    console.error('AVA lookup error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
