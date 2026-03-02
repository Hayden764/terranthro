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
    avaCount: 147, // Update with actual count
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

  // Mountain States
  'idaho': {
    name: 'Idaho',
    abbreviation: 'ID',
    center: [-114.7420, 44.0682],
    zoom: 6,
    avaCount: 3
  },
  'colorado': {
    name: 'Colorado',
    abbreviation: 'CO',
    center: [-105.7821, 39.5501],
    zoom: 6.5,
    avaCount: 2
  },
  'arizona': {
    name: 'Arizona',
    abbreviation: 'AZ',
    center: [-111.0937, 34.0489],
    zoom: 6.5,
    avaCount: 3
  },
  'new-mexico': {
    name: 'New Mexico',
    abbreviation: 'NM',
    center: [-106.2371, 34.5199],
    zoom: 6.5,
    avaCount: 3
  },

  // South Central
  'texas': {
    name: 'Texas',
    abbreviation: 'TX',
    center: [-99.9018, 31.9686],
    zoom: 5.5,
    avaCount: 9
  },
  'oklahoma': {
    name: 'Oklahoma',
    abbreviation: 'OK',
    center: [-98.0, 35.5],
    zoom: 6.5,
    avaCount: 1
  },
  'arkansas': {
    name: 'Arkansas',
    abbreviation: 'AR',
    center: [-92.4426, 34.7465],
    zoom: 7,
    avaCount: 3
  },
  'missouri': {
    name: 'Missouri',
    abbreviation: 'MO',
    center: [-92.6032, 38.3566],
    zoom: 6.5,
    avaCount: 4
  },

  // Southeast
  'louisiana': {
    name: 'Louisiana',
    abbreviation: 'LA',
    center: [-92.3298, 30.9843],
    zoom: 7,
    avaCount: 1
  },
  'mississippi': {
    name: 'Mississippi',
    abbreviation: 'MS',
    center: [-89.6678, 32.3547],
    zoom: 7,
    avaCount: 1
  },
  'tennessee': {
    name: 'Tennessee',
    abbreviation: 'TN',
    center: [-86.5804, 35.5175],
    zoom: 6.5,
    avaCount: 1
  },
  'georgia': {
    name: 'Georgia',
    abbreviation: 'GA',
    center: [-83.4426, 32.1656],
    zoom: 6.5,
    avaCount: 1
  },
  'north-carolina': {
    name: 'North Carolina',
    abbreviation: 'NC',
    center: [-79.0193, 35.7596],
    zoom: 6.5,
    avaCount: 2
  },
  'virginia': {
    name: 'Virginia',
    abbreviation: 'VA',
    center: [-78.6569, 37.4316],
    zoom: 6.5,
    avaCount: 7
  },

  // Midwest
  'illinois': {
    name: 'Illinois',
    abbreviation: 'IL',
    center: [-89.3985, 40.6331],
    zoom: 6.5,
    avaCount: 2
  },
  'indiana': {
    name: 'Indiana',
    abbreviation: 'IN',
    center: [-86.1349, 40.2672],
    zoom: 6.5,
    avaCount: 1
  },
  'iowa': {
    name: 'Iowa',
    abbreviation: 'IA',
    center: [-93.5000, 42.0000],
    zoom: 6.5,
    avaCount: 1
  },
  'wisconsin': {
    name: 'Wisconsin',
    abbreviation: 'WI',
    center: [-89.5, 44.5],
    zoom: 6.5,
    avaCount: 1
  },
  'minnesota': {
    name: 'Minnesota',
    abbreviation: 'MN',
    center: [-94.6859, 46.7296],
    zoom: 6,
    avaCount: 1
  },
  'ohio': {
    name: 'Ohio',
    abbreviation: 'OH',
    center: [-82.9071, 40.4173],
    zoom: 6.5,
    avaCount: 5
  },
  'michigan': {
    name: 'Michigan',
    abbreviation: 'MI',
    center: [-85.6024, 44.3148],
    zoom: 6,
    avaCount: 5
  },
  'kentucky': {
    name: 'Kentucky',
    abbreviation: 'KY',
    center: [-85.3, 37.8],
    zoom: 6.5,
    avaCount: 0
  },

  // Northeast
  'pennsylvania': {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    center: [-77.1945, 41.2033],
    zoom: 6.5,
    avaCount: 4
  },
  'new-york': {
    name: 'New York',
    abbreviation: 'NY',
    center: [-75.5268, 43.0000],
    zoom: 6.5,
    avaCount: 11
  },
  'maryland': {
    name: 'Maryland',
    abbreviation: 'MD',
    center: [-76.6413, 39.0458],
    zoom: 7.5,
    avaCount: 2
  },
  'new-jersey': {
    name: 'New Jersey',
    abbreviation: 'NJ',
    center: [-74.4057, 40.0583],
    zoom: 7.5,
    avaCount: 2
  },
  'connecticut': {
    name: 'Connecticut',
    abbreviation: 'CT',
    center: [-72.6820, 41.6032],
    zoom: 8,
    avaCount: 2
  },
  'massachusetts': {
    name: 'Massachusetts',
    abbreviation: 'MA',
    center: [-71.3824, 42.4072],
    zoom: 7.5,
    avaCount: 1
  },
  'rhode-island': {
    name: 'Rhode Island',
    abbreviation: 'RI',
    center: [-71.4774, 41.5801],
    zoom: 9,
    avaCount: 1
  },
  'new-hampshire': {
    name: 'New Hampshire',
    abbreviation: 'NH',
    center: [-71.5724, 43.1939],
    zoom: 7.5,
    avaCount: 0
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
