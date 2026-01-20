/**
 * AVA File Mapping Configuration
 * Maps state slugs to their AVA GeoJSON file names from UC Davis repository
 * Files should be placed in public/data/
 * 
 * Source: https://github.com/UCDavisLibrary/ava/tree/master/avas_by_state
 */

export const AVA_FILE_MAP = {
  'california': 'CA_avas.geojson',
  'oregon': 'OR_avas.geojson',
  'washington': 'WA_avas.geojson',
  'new-york': 'NY_avas.geojson',
  'texas': 'TX_avas.geojson',
  'virginia': 'VA_avas.geojson',
  'pennsylvania': 'PA_avas.geojson',
  'ohio': 'OH_avas.geojson',
  'michigan': 'MI_avas.geojson',
  'missouri': 'MO_avas.geojson',
  'north-carolina': 'NC_avas.geojson',
  'new-jersey': 'NJ_avas.geojson',
  'illinois': 'IL_avas.geojson',
  'indiana': 'IN_avas.geojson',
  'colorado': 'CO_avas.geojson',
  'arizona': 'AZ_avas.geojson',
  'new-mexico': 'NM_avas.geojson',
  'georgia': 'GA_avas.geojson',
  'idaho': 'ID_avas.geojson',
  'maryland': 'MD_avas.geojson',
  'connecticut': 'CT_avas.geojson',
  'massachusetts': 'MA_avas.geojson',
  'rhode-island': 'RI_avas.geojson',
  'vermont': 'VT_avas.geojson',
  'new-hampshire': 'NH_avas.geojson',
  'maine': 'ME_avas.geojson',
  'wisconsin': 'WI_avas.geojson',
  'minnesota': 'MN_avas.geojson',
  'iowa': 'IA_avas.geojson',
  'kentucky': 'KY_avas.geojson',
  'tennessee': 'TN_avas.geojson',
  'arkansas': 'AR_avas.geojson'
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
