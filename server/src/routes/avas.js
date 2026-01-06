import express from 'express';

const router = express.Router();

// Mock AVA geometry data
const mockAVAGeometry = {
  15: { // Napa Valley
    type: 'Feature',
    properties: {
      id: 15,
      name: 'Napa Valley',
      ttb_id: 'AVA00002',
      area_acres: 45000
    },
    geometry: {
      type: 'MultiPolygon',
      coordinates: [[
        [[-122.5, 38.2], [-122.0, 38.2], [-122.0, 38.8], [-122.5, 38.8], [-122.5, 38.2]]
      ]]
    }
  }
};

/**
 * GET /api/avas/:avaId/geometry
 * Returns detailed AVA boundary geometry
 */
router.get('/:avaId/geometry', (req, res) => {
  const avaId = parseInt(req.params.avaId);
  
  const geometry = mockAVAGeometry[avaId];
  if (!geometry) {
    return res.status(404).json({ error: 'AVA geometry not found' });
  }
  
  res.json(geometry);
});

export default router;
