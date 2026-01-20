/**
 * State Configuration
 * Center coordinates, zoom levels, and data paths for all US wine-producing states
 */

import { getAVAFilePath } from './avaFileMap';

const STATE_CONFIG = {
  'california': {
    name: 'California',
    center: [-119.4, 36.7],
    zoom: 5.5,
    bounds: [[-124.4, 32.5], [-114.1, 42.0]],
    avaFile: getAVAFilePath('california')
  },
  'oregon': {
    name: 'Oregon',
    center: [-120.5, 44.0],
    zoom: 6.5,
    bounds: [[-124.6, 41.9], [-116.5, 46.3]],
    avaFile: getAVAFilePath('oregon')
  },
  'washington': {
    name: 'Washington',
    center: [-120.5, 47.5],
    zoom: 6,
    bounds: [[-124.8, 45.5], [-116.9, 49.0]],
    avaFile: getAVAFilePath('washington')
  },
  'new-york': {
    name: 'New York',
    center: [-75.5, 42.6],
    zoom: 6.5,
    bounds: [[-79.8, 40.5], [-71.9, 45.0]],
    avaFile: getAVAFilePath('new-york')
  },
  'texas': {
    name: 'Texas',
    center: [-99.9, 31.5],
    zoom: 5.5,
    bounds: [[-106.6, 25.8], [-93.5, 36.5]],
    avaFile: getAVAFilePath('texas')
  },
  'virginia': {
    name: 'Virginia',
    center: [-78.6, 37.5],
    zoom: 7,
    bounds: [[-83.7, 36.5], [-75.2, 39.5]],
    avaFile: getAVAFilePath('virginia')
  },
  'pennsylvania': {
    name: 'Pennsylvania',
    center: [-77.8, 40.9],
    zoom: 7,
    bounds: [[-80.5, 39.7], [-74.7, 42.3]],
    avaFile: getAVAFilePath('pennsylvania')
  },
  'ohio': {
    name: 'Ohio',
    center: [-82.9, 40.4],
    zoom: 7,
    bounds: [[-84.8, 38.4], [-80.5, 42.3]],
    avaFile: getAVAFilePath('ohio')
  },
  'michigan': {
    name: 'Michigan',
    center: [-85.0, 44.3],
    zoom: 6,
    bounds: [[-90.4, 41.7], [-82.4, 48.3]],
    avaFile: getAVAFilePath('michigan')
  },
  'missouri': {
    name: 'Missouri',
    center: [-92.5, 38.3],
    zoom: 6.5,
    bounds: [[-95.8, 36.0], [-89.1, 40.6]],
    avaFile: getAVAFilePath('missouri')
  },
  'north-carolina': {
    name: 'North Carolina',
    center: [-79.0, 35.6],
    zoom: 6.5,
    bounds: [[-84.3, 33.8], [-75.4, 36.6]],
    avaFile: getAVAFilePath('north-carolina')
  },
  'new-jersey': {
    name: 'New Jersey',
    center: [-74.5, 40.0],
    zoom: 8,
    bounds: [[-75.6, 38.9], [-73.9, 41.4]],
    avaFile: getAVAFilePath('new-jersey')
  },
  'illinois': {
    name: 'Illinois',
    center: [-89.4, 40.0],
    zoom: 6.5,
    bounds: [[-91.5, 37.0], [-87.5, 42.5]],
    avaFile: getAVAFilePath('illinois')
  },
  'indiana': {
    name: 'Indiana',
    center: [-86.1, 40.0],
    zoom: 7,
    bounds: [[-88.1, 37.8], [-84.8, 41.8]],
    avaFile: getAVAFilePath('indiana')
  },
  'colorado': {
    name: 'Colorado',
    center: [-105.5, 39.0],
    zoom: 6.5,
    bounds: [[-109.1, 37.0], [-102.0, 41.0]],
    avaFile: getAVAFilePath('colorado')
  },
  'arizona': {
    name: 'Arizona',
    center: [-111.7, 34.3],
    zoom: 6.5,
    bounds: [[-114.8, 31.3], [-109.0, 37.0]],
    avaFile: getAVAFilePath('arizona')
  },
  'new-mexico': {
    name: 'New Mexico',
    center: [-106.0, 34.5],
    zoom: 6.5,
    bounds: [[-109.0, 31.3], [-103.0, 37.0]],
    avaFile: getAVAFilePath('new-mexico')
  },
  'georgia': {
    name: 'Georgia',
    center: [-83.4, 32.6],
    zoom: 7,
    bounds: [[-85.6, 30.4], [-80.8, 35.0]],
    avaFile: getAVAFilePath('georgia')
  },
  'idaho': {
    name: 'Idaho',
    center: [-114.7, 44.0],
    zoom: 6,
    bounds: [[-117.2, 42.0], [-111.0, 49.0]],
    avaFile: getAVAFilePath('idaho')
  },
  'maryland': {
    name: 'Maryland',
    center: [-76.6, 39.0],
    zoom: 8,
    bounds: [[-79.5, 37.9], [-75.0, 39.7]],
    avaFile: getAVAFilePath('maryland')
  },
  'connecticut': {
    name: 'Connecticut',
    center: [-72.7, 41.6],
    zoom: 9,
    bounds: [[-73.7, 40.9], [-71.8, 42.0]],
    avaFile: getAVAFilePath('connecticut')
  },
  'massachusetts': {
    name: 'Massachusetts',
    center: [-71.8, 42.3],
    zoom: 8,
    bounds: [[-73.5, 41.2], [-69.9, 42.9]],
    avaFile: getAVAFilePath('massachusetts')
  },
  'rhode-island': {
    name: 'Rhode Island',
    center: [-71.5, 41.7],
    zoom: 10,
    bounds: [[-71.9, 41.1], [-71.1, 42.0]],
    avaFile: getAVAFilePath('rhode-island')
  },
  'vermont': {
    name: 'Vermont',
    center: [-72.6, 44.0],
    zoom: 8,
    bounds: [[-73.4, 42.7], [-71.5, 45.0]],
    avaFile: getAVAFilePath('vermont')
  },
  'new-hampshire': {
    name: 'New Hampshire',
    center: [-71.5, 43.7],
    zoom: 8,
    bounds: [[-72.6, 42.7], [-70.6, 45.3]],
    avaFile: getAVAFilePath('new-hampshire')
  },
  'maine': {
    name: 'Maine',
    center: [-69.0, 45.3],
    zoom: 7,
    bounds: [[-71.1, 43.0], [-66.9, 47.5]],
    avaFile: getAVAFilePath('maine')
  },
  'wisconsin': {
    name: 'Wisconsin',
    center: [-89.6, 44.5],
    zoom: 6.5,
    bounds: [[-92.9, 42.5], [-86.8, 47.1]],
    avaFile: getAVAFilePath('wisconsin')
  },
  'minnesota': {
    name: 'Minnesota',
    center: [-94.2, 46.0],
    zoom: 6,
    bounds: [[-97.2, 43.5], [-89.5, 49.4]],
    avaFile: getAVAFilePath('minnesota')
  },
  'iowa': {
    name: 'Iowa',
    center: [-93.5, 42.0],
    zoom: 7,
    bounds: [[-96.6, 40.4], [-90.1, 43.5]],
    avaFile: getAVAFilePath('iowa')
  },
  'kentucky': {
    name: 'Kentucky',
    center: [-85.3, 37.8],
    zoom: 7,
    bounds: [[-89.6, 36.5], [-81.9, 39.1]],
    avaFile: getAVAFilePath('kentucky')
  },
  'tennessee': {
    name: 'Tennessee',
    center: [-86.3, 35.8],
    zoom: 7,
    bounds: [[-90.3, 35.0], [-81.6, 36.7]],
    avaFile: getAVAFilePath('tennessee')
  },
  'arkansas': {
    name: 'Arkansas',
    center: [-92.4, 34.9],
    zoom: 7,
    bounds: [[-94.6, 33.0], [-89.6, 36.5]],
    avaFile: getAVAFilePath('arkansas')
  }
};

/**
 * Get state configuration by slug
 * @param {string} stateSlug - URL-friendly state name (lowercase, hyphenated)
 * @returns {object|null} State configuration object or null if not found
 */
export const getStateConfig = (stateSlug) => {
  if (!stateSlug) return null;
  const slug = stateSlug.toLowerCase();
  return STATE_CONFIG[slug] || null;
};

/**
 * Get all state configurations
 * @returns {object} All state configurations
 */
export const getAllStateConfigs = () => {
  return STATE_CONFIG;
};

/**
 * Check if a state has AVA data available
 * @param {string} stateSlug - URL-friendly state name
 * @returns {boolean} True if state has AVA data
 */
export const hasAVAData = (stateSlug) => {
  const config = getStateConfig(stateSlug);
  return config && config.avaFile !== null;
};

/**
 * Get list of all configured state names
 * @returns {string[]} Array of state names
 */
export const getConfiguredStateNames = () => {
  return Object.values(STATE_CONFIG).map(config => config.name);
};

/**
 * Get total count of configured wine states
 * @returns {number} Total number of wine states (32)
 */
export const getWineStateCount = () => {
  return Object.keys(STATE_CONFIG).length;
};

export default STATE_CONFIG;
