/**
 * Color ramp definitions for data visualization
 * Using vibrant ColorBrewer-inspired schemes
 */
export const colorRamps = {
  temperature: {
    type: 'sequential',
    colors: [
      '#2166AC', // Cool blue
      '#4393C3',
      '#92C5DE',
      '#D1E5F0',
      '#FDDBC7',
      '#F4A582',
      '#D6604D',
      '#B2182B'  // Warm red
    ],
    domain: [40, 80], // °F
    unit: '°F'
  },
  
  precipitation: {
    type: 'sequential',
    colors: [
      '#F7FCF0',
      '#E0F3DB',
      '#CCEBC5',
      '#A8DDB5',
      '#7BCCC4',
      '#4EB3D3',
      '#2B8CBE',
      '#08589E'
    ],
    domain: [10, 60], // inches
    unit: 'in'
  },
  
  elevation: {
    type: 'sequential',
    colors: [
      '#006837',
      '#31A354',
      '#78C679',
      '#ADDD8E',
      '#D9F0A3',
      '#FFFFCC',
      '#FED976',
      '#FEB24C',
      '#FD8D3C',
      '#FC4E2A',
      '#E31A1C',
      '#B10026'
    ],
    domain: [0, 3000], // feet
    unit: 'ft'
  },
  
  gdd: {
    type: 'sequential',
    colors: [
      '#FFFFD4',
      '#FEE391',
      '#FEC44F',
      '#FE9929',
      '#EC7014',
      '#CC4C02',
      '#8C2D04'
    ],
    domain: [1500, 4000], // degree days
    unit: '°F days'
  },
  
  soil_drainage: {
    type: 'categorical',
    colors: {
      'Excessively drained': '#8C510A',
      'Somewhat excessively drained': '#BF812D',
      'Well drained': '#DFC27D',
      'Moderately well drained': '#F6E8C3',
      'Somewhat poorly drained': '#C7EAE5',
      'Poorly drained': '#80CDC1',
      'Very poorly drained': '#35978F'
    }
  }
};

/**
 * Get color for a value based on ramp
 */
export const getColorForValue = (value, rampName) => {
  const ramp = colorRamps[rampName];
  
  if (ramp.type === 'categorical') {
    return ramp.colors[value] || '#CCCCCC';
  }
  
  if (ramp.type === 'sequential') {
    const [min, max] = ramp.domain;
    const normalized = (value - min) / (max - min);
    const index = Math.floor(normalized * (ramp.colors.length - 1));
    const clampedIndex = Math.max(0, Math.min(index, ramp.colors.length - 1));
    return ramp.colors[clampedIndex];
  }
  
  return '#CCCCCC';
};
