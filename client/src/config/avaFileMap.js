/**
 * AVA File Mapping Configuration
 * Maps state slugs to their AVA GeoJSON file names from UC Davis repository
 * Files are in public/data/
 *
 * Source: https://github.com/UCDavisLibrary/ava/tree/master/avas_by_state
 *
 * NOTE: Only states with actual GeoJSON files in public/data/ are listed here.
 * Oklahoma, New Hampshire, Vermont, Maine have no file yet.
 */

export const AVA_FILE_MAP = {
  // West Coast
  'california':     'CA_avas.geojson',
  'oregon':         'OR_avas.geojson',
  'washington':     'WA_avas.geojson',
  'hawaii':         'HI_avas.geojson',

  // Mountain
  'idaho':          'ID_avas.geojson',
  'colorado':       'CO_avas.geojson',
  'arizona':        'AZ_avas.geojson',
  'new-mexico':     'NM_avas.geojson',

  // South Central
  'texas':          'TX_avas.geojson',
  'arkansas':       'AR_avas.geojson',
  'missouri':       'MO_avas.geojson',
  'louisiana':      'LA_avas.geojson',
  'mississippi':    'MS_avas.geojson',

  // Southeast
  'tennessee':      'TN_avas.geojson',
  'georgia':        'GA_avas.geojson',
  'north-carolina': 'NC_avas.geojson',
  'virginia':       'VA_avas.geojson',
  'west-virginia':  'WV_avas.geojson',

  // Midwest
  'illinois':       'IL_avas.geojson',
  'indiana':        'IN_avas.geojson',
  'iowa':           'IA_avas.geojson',
  'wisconsin':      'WI_avas.geojson',
  'minnesota':      'MN_avas.geojson',
  'ohio':           'OH_avas.geojson',
  'michigan':       'MI_avas.geojson',
  'kentucky':       'KY_avas.geojson',

  // Northeast
  'pennsylvania':   'PA_avas.geojson',
  'new-york':       'NY_avas.geojson',
  'maryland':       'MD_avas.geojson',
  'new-jersey':     'NJ_avas.geojson',
  'connecticut':    'CT_avas.geojson',
  'massachusetts':  'MA_avas.geojson',
  'rhode-island':   'RI_avas.geojson'
};

/**
 * Get AVA file path for a state
 * @param {string} stateSlug - URL-friendly state name (lowercase, hyphenated)
 * @returns {string|null} Path to AVA file or null if not available
 */
export const getAVAFilePath = (stateSlug) => {
  const fileName = AVA_FILE_MAP[stateSlug];
  return fileName ? `/data/${fileName}` : null;
};

/**
 * Check if a state has AVA data available
 * @param {string} stateSlug - URL-friendly state name
 * @returns {boolean} True if AVA data exists
 */
export const hasAVAData = (stateSlug) => {
  return stateSlug in AVA_FILE_MAP;
};

/**
 * Get total count of states with AVA data
 * @returns {number} Total number of wine states with AVA data
 */
export const getAVAStateCount = () => {
  return Object.keys(AVA_FILE_MAP).length;
};

export default AVA_FILE_MAP;
