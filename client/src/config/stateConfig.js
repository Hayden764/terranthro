/**
 * State Configuration
 * Maps state names to their MapLibre camera settings and metadata
 * 
 * USAGE:
 * import { getStateConfig, getConfiguredStateNames } from '../config/stateConfig';
 * const config = getStateConfig('oregon');
 */

const STATE_CONFIGS = {
  // West Coast
  'california': {
    name: 'California',
    abbreviation: 'CA',
    center: [-119.4179, 36.7783],
    zoom: 5.5,
    avaCount: 154,
    avaFile: '/data/CA_avas.geojson'
  },
  'oregon': {
    name: 'Oregon',
    abbreviation: 'OR',
    center: [-120.5542, 43.8041],
    zoom: 6.5,
    avaCount: 23,
    avaFile: '/data/OR_avas.geojson'
  },
  'washington': {
    name: 'Washington',
    abbreviation: 'WA',
    center: [-120.7401, 47.7511],
    zoom: 6.5,
    avaCount: 20,
    avaFile: '/data/WA_avas.geojson'
  },
  'hawaii': {
    name: 'Hawaii',
    abbreviation: 'HI',
    center: [-157.5, 20.5],
    zoom: 6.5,
    avaCount: 1,
    avaFile: '/data/HI_avas.geojson'
  },

  // Mountain States
  'idaho': {
    name: 'Idaho',
    abbreviation: 'ID',
    center: [-114.7420, 44.0682],
    zoom: 6,
    avaCount: 3,
    avaFile: '/data/ID_avas.geojson'
  },
  'colorado': {
    name: 'Colorado',
    abbreviation: 'CO',
    center: [-105.7821, 39.5501],
    zoom: 6.5,
    avaCount: 2,
    avaFile: '/data/CO_avas.geojson'
  },
  'arizona': {
    name: 'Arizona',
    abbreviation: 'AZ',
    center: [-111.0937, 34.0489],
    zoom: 6.5,
    avaCount: 3,
    avaFile: '/data/AZ_avas.geojson'
  },
  'new-mexico': {
    name: 'New Mexico',
    abbreviation: 'NM',
    center: [-106.2371, 34.5199],
    zoom: 6.5,
    avaCount: 3,
    avaFile: '/data/NM_avas.geojson'
  },

  // South Central
  'texas': {
    name: 'Texas',
    abbreviation: 'TX',
    center: [-99.9018, 31.9686],
    zoom: 5.5,
    avaCount: 8,
    avaFile: '/data/TX_avas.geojson'
  },
  'oklahoma': {
    name: 'Oklahoma',
    abbreviation: 'OK',
    center: [-98.0, 35.5],
    zoom: 6.5,
    avaCount: 1
    // No GeoJSON file available yet
  },
  'arkansas': {
    name: 'Arkansas',
    abbreviation: 'AR',
    center: [-92.4426, 34.7465],
    zoom: 7,
    avaCount: 3,
    avaFile: '/data/AR_avas.geojson'
  },
  'missouri': {
    name: 'Missouri',
    abbreviation: 'MO',
    center: [-92.6032, 38.3566],
    zoom: 6.5,
    avaCount: 5,
    avaFile: '/data/MO_avas.geojson'
  },

  // Southeast
  'louisiana': {
    name: 'Louisiana',
    abbreviation: 'LA',
    center: [-92.3298, 30.9843],
    zoom: 7,
    avaCount: 1,
    avaFile: '/data/LA_avas.geojson'
  },
  'mississippi': {
    name: 'Mississippi',
    abbreviation: 'MS',
    center: [-89.6678, 32.3547],
    zoom: 7,
    avaCount: 1,
    avaFile: '/data/MS_avas.geojson'
  },
  'tennessee': {
    name: 'Tennessee',
    abbreviation: 'TN',
    center: [-86.5804, 35.5175],
    zoom: 6.5,
    avaCount: 2,
    avaFile: '/data/TN_avas.geojson'
  },
  'georgia': {
    name: 'Georgia',
    abbreviation: 'GA',
    center: [-83.4426, 32.1656],
    zoom: 6.5,
    avaCount: 2,
    avaFile: '/data/GA_avas.geojson'
  },
  'north-carolina': {
    name: 'North Carolina',
    abbreviation: 'NC',
    center: [-79.0193, 35.7596],
    zoom: 6.5,
    avaCount: 6,
    avaFile: '/data/NC_avas.geojson'
  },
  'virginia': {
    name: 'Virginia',
    abbreviation: 'VA',
    center: [-78.6569, 37.4316],
    zoom: 6.5,
    avaCount: 9,
    avaFile: '/data/VA_avas.geojson'
  },
  'west-virginia': {
    name: 'West Virginia',
    abbreviation: 'WV',
    center: [-80.4549, 38.5976],
    zoom: 7,
    avaCount: 3,
    avaFile: '/data/WV_avas.geojson'
  },

  // Midwest
  'illinois': {
    name: 'Illinois',
    abbreviation: 'IL',
    center: [-89.3985, 40.6331],
    zoom: 6.5,
    avaCount: 2,
    avaFile: '/data/IL_avas.geojson'
  },
  'indiana': {
    name: 'Indiana',
    abbreviation: 'IN',
    center: [-86.1349, 40.2672],
    zoom: 6.5,
    avaCount: 2,
    avaFile: '/data/IN_avas.geojson'
  },
  'iowa': {
    name: 'Iowa',
    abbreviation: 'IA',
    center: [-93.5000, 42.0000],
    zoom: 6.5,
    avaCount: 2,
    avaFile: '/data/IA_avas.geojson'
  },
  'wisconsin': {
    name: 'Wisconsin',
    abbreviation: 'WI',
    center: [-89.5, 44.5],
    zoom: 6.5,
    avaCount: 3,
    avaFile: '/data/WI_avas.geojson'
  },
  'minnesota': {
    name: 'Minnesota',
    abbreviation: 'MN',
    center: [-94.6859, 46.7296],
    zoom: 6,
    avaCount: 2,
    avaFile: '/data/MN_avas.geojson'
  },
  'ohio': {
    name: 'Ohio',
    abbreviation: 'OH',
    center: [-82.9071, 40.4173],
    zoom: 6.5,
    avaCount: 5,
    avaFile: '/data/OH_avas.geojson'
  },
  'michigan': {
    name: 'Michigan',
    abbreviation: 'MI',
    center: [-85.6024, 44.3148],
    zoom: 6,
    avaCount: 5,
    avaFile: '/data/MI_avas.geojson'
  },
  'kentucky': {
    name: 'Kentucky',
    abbreviation: 'KY',
    center: [-85.3, 37.8],
    zoom: 6.5,
    avaCount: 1,
    avaFile: '/data/KY_avas.geojson'
  },

  // Northeast
  'pennsylvania': {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    center: [-77.1945, 41.2033],
    zoom: 6.5,
    avaCount: 5,
    avaFile: '/data/PA_avas.geojson'
  },
  'new-york': {
    name: 'New York',
    abbreviation: 'NY',
    center: [-75.5268, 43.0000],
    zoom: 6.5,
    avaCount: 11,
    avaFile: '/data/NY_avas.geojson'
  },
  'maryland': {
    name: 'Maryland',
    abbreviation: 'MD',
    center: [-76.6413, 39.0458],
    zoom: 7.5,
    avaCount: 3,
    avaFile: '/data/MD_avas.geojson'
  },
  'new-jersey': {
    name: 'New Jersey',
    abbreviation: 'NJ',
    center: [-74.4057, 40.0583],
    zoom: 7.5,
    avaCount: 4,
    avaFile: '/data/NJ_avas.geojson'
  },
  'connecticut': {
    name: 'Connecticut',
    abbreviation: 'CT',
    center: [-72.6820, 41.6032],
    zoom: 8,
    avaCount: 3,
    avaFile: '/data/CT_avas.geojson'
  },
  'massachusetts': {
    name: 'Massachusetts',
    abbreviation: 'MA',
    center: [-71.3824, 42.4072],
    zoom: 7.5,
    avaCount: 2,
    avaFile: '/data/MA_avas.geojson'
  },
  'rhode-island': {
    name: 'Rhode Island',
    abbreviation: 'RI',
    center: [-71.4774, 41.5801],
    zoom: 9,
    avaCount: 1,
    avaFile: '/data/RI_avas.geojson'
  },
  'new-hampshire': {
    name: 'New Hampshire',
    abbreviation: 'NH',
    center: [-71.5724, 43.1939],
    zoom: 7.5,
    avaCount: 0
    // No GeoJSON file available yet
  }
};

/**
 * Get configuration for a specific state
 * @param {string} stateName - State name or slug (e.g., 'oregon' or 'Oregon')
 * @returns {Object|null} - State configuration or null if not found
 */
export function getStateConfig(stateName) {
  if (!stateName) return null;
  
  // Normalize to lowercase and replace spaces with hyphens
  const slug = stateName.toLowerCase().replace(/\s+/g, '-');
  return STATE_CONFIGS[slug] || null;
}

/**
 * Get list of all configured state names (full names, not slugs)
 * @returns {string[]} - Array of state names
 */
export function getConfiguredStateNames() {
  return Object.values(STATE_CONFIGS).map(config => config.name);
}

/**
 * Get list of all configured state abbreviations
 * @returns {string[]} - Array of state abbreviations
 */
export function getConfiguredStateAbbreviations() {
  return Object.values(STATE_CONFIGS).map(config => config.abbreviation);
}

/**
 * Get all state configurations
 * @returns {Object} - All state configs
 */
export function getAllStateConfigs() {
  return STATE_CONFIGS;
}

/**
 * Convert state slug to full name
 * @param {string} slug - State slug (e.g., 'new-york')
 * @returns {string|null} - Full state name or null
 */
export function slugToStateName(slug) {
  const config = getStateConfig(slug);
  return config ? config.name : null;
}

/**
 * Convert state name to slug
 * @param {string} name - State name (e.g., 'New York')
 * @returns {string} - State slug (e.g., 'new-york')
 */
export function stateNameToSlug(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export default STATE_CONFIGS;
