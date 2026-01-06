import express from 'express';

const router = express.Router();

// Mock climate time series data
const generateMockTimeSeries = (variable, startDate, endDate) => {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    const month = d.getMonth();
    let value;
    
    switch (variable) {
      case 'temperature':
        // Seasonal temperature variation
        value = 60 + 15 * Math.sin((month - 3) * Math.PI / 6) + (Math.random() - 0.5) * 5;
        break;
      case 'precipitation':
        // Seasonal precipitation variation (Mediterranean pattern)
        value = 2 + 3 * Math.cos((month - 6) * Math.PI / 6) + Math.random() * 2;
        break;
      case 'gdd':
        // Growing degree days
        value = Math.max(0, (60 + 15 * Math.sin((month - 3) * Math.PI / 6) - 50) * 30);
        break;
      default:
        value = Math.random() * 100;
    }
    
    data.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: Math.round(value * 10) / 10,
      min: Math.round((value - 5 - Math.random() * 3) * 10) / 10,
      max: Math.round((value + 5 + Math.random() * 3) * 10) / 10
    });
  }
  
  return data;
};

/**
 * GET /api/climate/:avaId/timeseries
 * Returns time series data for climate variables
 */
router.get('/:avaId/timeseries', (req, res) => {
  const avaId = parseInt(req.params.avaId);
  const variable = req.query.variable || 'temperature';
  const start = req.query.start || '2020-01';
  const end = req.query.end || '2023-12';
  
  const units = {
    temperature: '°F',
    precipitation: 'inches',
    gdd: '°F days'
  };
  
  const data = generateMockTimeSeries(variable, start, end);
  
  res.json({
    ava_id: avaId,
    variable,
    unit: units[variable] || 'units',
    data
  });
});

export default router;
