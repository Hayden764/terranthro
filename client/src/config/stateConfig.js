/**
 * Configuration for all 32 wine-producing states
 * States with AVA GeoJSON files will render AVA boundaries
 * States without AVA files will show just the state boundary
 */

export const STATE_CONFIG = {
  // WEST COAST - Full AVA data
  oregon: {
    name: 'Oregon',
    abbreviation: 'OR',
    avaFile: '/src/data/OR_avas.geojson',
    centerLng: -120.5,
    centerLat: 44.0,
    zoom: 6,
    intro: "Oregon's wine regions span from the cool, maritime-influenced Willamette Valley in the north to the warmer, drier appellations of Southern Oregon. The state is renowned for world-class Pinot Noir and Pinot Gris.",
  },
  california: {
    name: 'California',
    abbreviation: 'CA',
    avaFile: '/src/data/CA_avas.geojson',
    centerLng: -119.4,
    centerLat: 37.0,
    zoom: 5.5,
    intro: "California is the leading wine producer in the United States, responsible for over 80% of domestic wine. Home to world-renowned regions including Napa Valley, Sonoma County, Paso Robles, and Santa Barbara.",
  },
  washington: {
    name: 'Washington',
    abbreviation: 'WA',
    avaFile: '/src/data/WA_avas.geojson',
    centerLng: -120.0,
    centerLat: 47.0,
    zoom: 6,
    intro: "Washington State is the second-largest wine producer in the US, with diverse appellations ranging from the vast Columbia Valley to the maritime-influenced Puget Sound.",
  },

  // WESTERN STATES - No AVA files yet
  idaho: {
    name: 'Idaho',
    abbreviation: 'ID',
    avaFile: null,
    centerLng: -114.7,
    centerLat: 44.1,
    zoom: 6,
    intro: "Idaho's wine industry is centered in the Snake River Valley AVA, which straddles the Idaho-Oregon border. The high-elevation vineyards produce notable Riesling and Syrah.",
  },
  colorado: {
    name: 'Colorado',
    abbreviation: 'CO',
    avaFile: null,
    centerLng: -105.5,
    centerLat: 39.0,
    zoom: 6,
    intro: "Colorado's wine country is concentrated in the Grand Valley and West Elks AVAs, where high altitude and sunny days create ideal conditions for growing grapes.",
  },
  arizona: {
    name: 'Arizona',
    abbreviation: 'AZ',
    avaFile: null,
    centerLng: -111.9,
    centerLat: 34.3,
    zoom: 6,
    intro: "Arizona's wine regions are found at higher elevations where cooler temperatures prevail. The Sonoita, Willcox, and Verde Valley AVAs are the primary growing areas.",
  },
  newmexico: {
    name: 'New Mexico',
    abbreviation: 'NM',
    avaFile: null,
    centerLng: -106.0,
    centerLat: 34.5,
    zoom: 6,
    intro: "New Mexico has one of the oldest wine traditions in the US, dating to Spanish missionaries. The Mesilla Valley and Mimbres Valley AVAs anchor the industry.",
  },

  // SOUTHWEST / CENTRAL
  texas: {
    name: 'Texas',
    abbreviation: 'TX',
    avaFile: null,
    centerLng: -99.9,
    centerLat: 31.5,
    zoom: 5.5,
    intro: "Texas is one of the fastest-growing wine regions in the US, with the Texas Hill Country and Texas High Plains AVAs leading production of Tempranillo and other varieties.",
  },
  oklahoma: {
    name: 'Oklahoma',
    abbreviation: 'OK',
    avaFile: null,
    centerLng: -97.5,
    centerLat: 35.5,
    zoom: 6,
    intro: "Oklahoma's emerging wine industry spans several microclimates, from the Ozark Mountain region to the western plains.",
  },
  arkansas: {
    name: 'Arkansas',
    abbreviation: 'AR',
    avaFile: null,
    centerLng: -92.4,
    centerLat: 34.8,
    zoom: 6,
    intro: "Arkansas wine country is centered in the Ozark Mountain and Arkansas Mountain AVAs, with a tradition dating back to the 1870s.",
  },
  missouri: {
    name: 'Missouri',
    abbreviation: 'MO',
    avaFile: null,
    centerLng: -92.3,
    centerLat: 38.6,
    zoom: 6,
    intro: "Missouri was one of the leading wine-producing states before Prohibition. The Hermann, Augusta, and Ozark Highlands AVAs continue this heritage.",
  },
  louisiana: {
    name: 'Louisiana',
    abbreviation: 'LA',
    avaFile: null,
    centerLng: -91.8,
    centerLat: 31.0,
    zoom: 6,
    intro: "Louisiana's wine industry focuses on muscadine and hybrid grapes suited to its humid subtropical climate.",
  },
  mississippi: {
    name: 'Mississippi',
    abbreviation: 'MS',
    avaFile: null,
    centerLng: -89.7,
    centerLat: 32.8,
    zoom: 6,
    intro: "Mississippi's Delta and hill country regions produce wines primarily from muscadine grapes and French-American hybrids.",
  },

  // MIDWEST
  iowa: {
    name: 'Iowa',
    abbreviation: 'IA',
    avaFile: null,
    centerLng: -93.5,
    centerLat: 42.0,
    zoom: 6,
    intro: "Iowa's wine industry has grown significantly, with cold-hardy hybrid grapes like Marquette and Frontenac thriving in the continental climate.",
  },
  illinois: {
    name: 'Illinois',
    abbreviation: 'IL',
    avaFile: null,
    centerLng: -89.4,
    centerLat: 40.0,
    zoom: 6,
    intro: "Illinois wine production is centered in the Shawnee Hills AVA in the southern part of the state, with both traditional and hybrid varieties.",
  },
  indiana: {
    name: 'Indiana',
    abbreviation: 'IN',
    avaFile: null,
    centerLng: -86.3,
    centerLat: 39.8,
    zoom: 6,
    intro: "Indiana's wine trail spans from the Ohio River Valley to the glaciated northern regions, with over 100 wineries across the state.",
  },
  wisconsin: {
    name: 'Wisconsin',
    abbreviation: 'WI',
    avaFile: null,
    centerLng: -89.8,
    centerLat: 44.5,
    zoom: 6,
    intro: "Wisconsin wine country benefits from lake-moderated climates along Lake Michigan, with cold-hardy varieties and fruit wines.",
  },
  minnesota: {
    name: 'Minnesota',
    abbreviation: 'MN',
    avaFile: null,
    centerLng: -94.3,
    centerLat: 46.0,
    zoom: 6,
    intro: "Minnesota is a leader in cold-hardy grape breeding, with the University of Minnesota developing Frontenac, Marquette, and other winter-hardy varieties.",
  },
  michigan: {
    name: 'Michigan',
    abbreviation: 'MI',
    avaFile: null,
    centerLng: -85.6,
    centerLat: 44.3,
    zoom: 6,
    intro: "Michigan's wine regions benefit from the moderating influence of the Great Lakes. The Leelanau and Old Mission peninsulas are renowned for Riesling and ice wine.",
  },
  ohio: {
    name: 'Ohio',
    abbreviation: 'OH',
    avaFile: null,
    centerLng: -82.8,
    centerLat: 40.3,
    zoom: 6,
    intro: "Ohio has the longest continuous winemaking tradition in the US, with the Lake Erie shore and Ohio River Valley AVAs leading production.",
  },
  kentucky: {
    name: 'Kentucky',
    abbreviation: 'KY',
    avaFile: null,
    centerLng: -85.3,
    centerLat: 37.8,
    zoom: 6,
    intro: "Kentucky's wine industry has revived since 1990, with wineries across the Bluegrass region and Ohio River Valley.",
  },
  tennessee: {
    name: 'Tennessee',
    abbreviation: 'TN',
    avaFile: null,
    centerLng: -86.3,
    centerLat: 35.8,
    zoom: 6,
    intro: "Tennessee wine country spans from the Appalachian foothills to the Mississippi River bluffs, with both traditional and muscadine varieties.",
  },

  // EASTERN STATES
  newyork: {
    name: 'New York',
    abbreviation: 'NY',
    avaFile: null,
    centerLng: -76.0,
    centerLat: 43.0,
    zoom: 6,
    intro: "New York is the third-largest wine producer in the US, with the Finger Lakes renowned for Riesling and Long Island known for Merlot and Chardonnay.",
  },
  pennsylvania: {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    avaFile: null,
    centerLng: -77.2,
    centerLat: 41.2,
    zoom: 6,
    intro: "Pennsylvania's wine industry spans from Lake Erie in the northwest to the Lancaster and Lehigh valleys, with over 300 wineries statewide.",
  },
  newjersey: {
    name: 'New Jersey',
    abbreviation: 'NJ',
    avaFile: null,
    centerLng: -74.7,
    centerLat: 40.1,
    zoom: 7,
    intro: "New Jersey's wine country is centered in the Outer Coastal Plain AVA, where maritime influences create ideal conditions for Chambourcin and other varieties.",
  },
  maryland: {
    name: 'Maryland',
    abbreviation: 'MD',
    avaFile: null,
    centerLng: -76.8,
    centerLat: 39.0,
    zoom: 7,
    intro: "Maryland's wine industry spans from the Chesapeake Bay to the Catoctin Mountains, with European varieties and hybrids thriving in diverse microclimates.",
  },
  virginia: {
    name: 'Virginia',
    abbreviation: 'VA',
    avaFile: null,
    centerLng: -78.7,
    centerLat: 37.5,
    zoom: 6,
    intro: "Virginia is one of the top wine-producing states on the East Coast, with the Monticello, Shenandoah Valley, and Virginia's Eastern Shore AVAs leading production.",
  },
  northcarolina: {
    name: 'North Carolina',
    abbreviation: 'NC',
    avaFile: null,
    centerLng: -79.0,
    centerLat: 35.8,
    zoom: 6,
    intro: "North Carolina's wine industry includes the Yadkin Valley AVA in the Piedmont and muscadine production in the coastal plain.",
  },
  georgia: {
    name: 'Georgia',
    abbreviation: 'GA',
    avaFile: null,
    centerLng: -83.1,
    centerLat: 32.4,
    zoom: 6,
    intro: "Georgia's wine industry spans from the Blue Ridge Mountains to the coastal plains, with both muscadine and European varieties.",
  },

  // NEW ENGLAND
  connecticut: {
    name: 'Connecticut',
    abbreviation: 'CT',
    avaFile: null,
    centerLng: -72.7,
    centerLat: 41.6,
    zoom: 8,
    intro: "Connecticut's wine industry benefits from Long Island Sound's moderating influence, with the Western Connecticut Highlands and Southeastern New England AVAs.",
  },
  massachusetts: {
    name: 'Massachusetts',
    abbreviation: 'MA',
    avaFile: null,
    centerLng: -71.8,
    centerLat: 42.2,
    zoom: 7,
    intro: "Massachusetts wine country includes Martha's Vineyard and the Southeastern New England AVA, with cold-hardy hybrids and European varieties.",
  },
  rhodeisland: {
    name: 'Rhode Island',
    abbreviation: 'RI',
    avaFile: null,
    centerLng: -71.5,
    centerLat: 41.6,
    zoom: 9,
    intro: "Rhode Island's small but growing wine industry is part of the Southeastern New England AVA, benefiting from maritime climate moderation.",
  },
  newhampshire: {
    name: 'New Hampshire',
    abbreviation: 'NH',
    avaFile: null,
    centerLng: -71.5,
    centerLat: 43.5,
    zoom: 7,
    intro: "New Hampshire's wine industry focuses on cold-hardy hybrid grapes and fruit wines suited to the short growing season.",
  },
};

/**
 * Helper function to get state config from various name formats
 * @param {string} name - State name in any format (e.g., "California", "california", "CA")
 * @returns {object|null} State configuration or null if not found
 */
export const getStateConfig = (name) => {
  if (!name) return null;
  
  const normalized = name.toLowerCase().replace(/\s+/g, '');
  
  // Direct lookup
  if (STATE_CONFIG[normalized]) {
    return STATE_CONFIG[normalized];
  }
  
  // Try abbreviation lookup
  const byAbbr = Object.values(STATE_CONFIG).find(
    s => s.abbreviation.toLowerCase() === normalized
  );
  if (byAbbr) return byAbbr;
  
  // Try full name lookup
  const byName = Object.values(STATE_CONFIG).find(
    s => s.name.toLowerCase() === normalized
  );
  if (byName) return byName;
  
  return null;
};

/**
 * Convert state name to URL-friendly format
 * @param {string} name - State name (e.g., "New York", "California")
 * @returns {string} URL-friendly name (e.g., "newyork", "california")
 */
export const normalizeStateName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '');
};

/**
 * Get all state keys that have AVA files
 * @returns {string[]} Array of state keys with AVA data
 */
export const getStatesWithAVAs = () => {
  return Object.entries(STATE_CONFIG)
    .filter(([_, config]) => config.avaFile !== null)
    .map(([key, _]) => key);
};

export default STATE_CONFIG;
