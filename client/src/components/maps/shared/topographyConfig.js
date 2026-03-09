/**
 * Topography Data Configuration
 * AVA availability registry, Titiler tile URLs, and legend configs
 * for slope, aspect, and elevation COG layers.
 *
 * COG source: data-pipeline/data/topography/{state}/{ava_folder}/
 * Served via http-server from /topography-data/
 */

import { TITILER_URL } from './climateConfig';

// Docker-internal URL — Titiler fetches COGs from inside Docker using host.docker.internal
// This is required because Titiler runs in a Docker container; it cannot use localhost:8080
export const TOPO_COG_DOCKER_URL = 'http://host.docker.internal:8080';

// ── Layer type definitions ─────────────────────────────────────────────
export const TOPO_LAYER_TYPES = {
  elevation: {
    id: 'elevation',
    label: 'Elevation',
    unit: 'm',
    colormap: 'terrain',
    description: 'Height above sea level',
    available: true,
    legend: {
      colors: ['#0B6623', '#90EE90', '#F5F5DC', '#D2B48C', '#8B4513', '#FFFFFF'],
      labels: ['0m', '200m', '500m', '1000m', '2000m', '3000m+']
    }
  },
  slope: {
    id: 'slope',
    label: 'Slope',
    unit: '°',
    colormap: 'rdylgn_r',
    description: 'Steepness of terrain',
    available: true,
    legend: {
      colors: ['#1A9850', '#91CF60', '#D9EF8B', '#FEE08B', '#FC8D59', '#D73027'],
      labels: ['0°', '5°', '10°', '20°', '35°', '45°+']
    }
  },
  aspect: {
    id: 'aspect',
    label: 'Aspect',
    unit: '°',
    colormap: 'hsv',
    description: 'Direction slope faces (0°=N, 90°=E, 180°=S, 270°=W)',
    available: true,
    legend: {
      colors: ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'],
      labels: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N']
    }
  }
};

// ── AVA name mapping ───────────────────────────────────────────────────
// Maps URL slug (from route params) → folder name in topography data
// Only AVAs with actual data files (aspect.tif, elevation.tif, slope.tif) are listed
export const AVA_TOPO_REGISTRY = {
  // Oregon AVAs
  'applegate-valley':       { state: 'OR', folder: 'applegate_valley' },
  'chehalem-mountains':     { state: 'OR', folder: 'chehalem_mountains' },
  'columbia-gorge':         { state: 'OR', folder: 'columbia_gorge' },
  'dundee-hills':           { state: 'OR', folder: 'dundee_hills' },
  'elkton-oregon':          { state: 'OR', folder: 'elkton_oregon' },
  'eola-amity-hills':       { state: 'OR', folder: 'eola_amity_hills' },
  'laurelwood-district':    { state: 'OR', folder: 'laurelwood_district' },
  'lower-long-tom':         { state: 'OR', folder: 'lower_long_tom' },
  'mcminnville':            { state: 'OR', folder: 'mcminnville' },
  'mount-pisgah':           { state: 'OR', folder: 'mount_pisgah__polk_county__oregon' },
  'red-hill-douglas-county':{ state: 'OR', folder: 'red_hill_douglas_county__oregon' },
  'ribbon-ridge':           { state: 'OR', folder: 'ribbon_ridge' },
  'the-rocks-district-of-milton-freewater': { state: 'OR', folder: 'the_rocks_district_of_milton_freewater' },
  'umpqua-valley':          { state: 'OR', folder: 'umpqua_valley' },
  'van-duzer-corridor':     { state: 'OR', folder: 'van_duzer_corridor' },
  'walla-walla-valley':     { state: 'OR', folder: 'walla_walla_valley' },
  'yamhill-carlton':        { state: 'OR', folder: 'yamhill_carlton' },
  
  // California AVAs
  'alisos-canyon':           { state: 'CA', folder: 'alisos_canyon' },
};

/**
 * Check if an AVA has topography data available
 * @param {string} avaSlug - URL slug for the AVA (e.g. "dundee-hills")
 * @returns {boolean}
 */
export const hasTopographyData = (avaSlug) => {
  return avaSlug in AVA_TOPO_REGISTRY;
};

/**
 * Get the COG file URL for a given AVA and layer type
 * @param {string} avaSlug - URL slug (e.g. "dundee-hills")
 * @param {string} layerType - 'elevation' | 'slope' | 'aspect'
 * @returns {string|null} URL to the COG file, or null if not available
 */
export const getTopoCogUrl = (avaSlug, layerType) => {
  const entry = AVA_TOPO_REGISTRY[avaSlug];
  if (!entry) return null;
  // Use host.docker.internal so Titiler (inside Docker) can reach http-server on the host
  return `${TOPO_COG_DOCKER_URL}/topography-data/${entry.state}/${entry.folder}/${layerType}.tif`;
};

/**
 * Get Titiler tile URL template for a topography layer
 * @param {string}      avaSlug   - URL slug
 * @param {string}      layerType - 'elevation' | 'slope' | 'aspect'
 * @param {string|null} rescale   - Optional "min,max" rescale string for dynamic range
 * @returns {string|null} Tile URL with {z}/{x}/{y} placeholders
 */
export const getTopoTileUrl = (avaSlug, layerType, rescale = null) => {
  const cogUrl = getTopoCogUrl(avaSlug, layerType);
  if (!cogUrl) return null;

  const config = TOPO_LAYER_TYPES[layerType];
  const encodedCogUrl = encodeURIComponent(cogUrl);

  const rescaleParam = rescale ? `&rescale=${rescale}` : '';
  return `${TITILER_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedCogUrl}${rescaleParam}&colormap_name=${config.colormap}`;
};

/**
 * Get Titiler statistics URL for a topography COG
 * Used to fetch min/max for dynamic scale bar
 * @param {string} avaSlug   - URL slug
 * @param {string} layerType - 'elevation' | 'slope' | 'aspect'
 * @returns {string|null}
 */
export const getTopoStatsUrl = (avaSlug, layerType) => {
  const cogUrl = getTopoCogUrl(avaSlug, layerType);
  if (!cogUrl) return null;
  const encodedCogUrl = encodeURIComponent(cogUrl);
  // Use percentile_2/98 over the full raster (no bbox) for true AVA-wide range
  return `${TITILER_URL}/cog/statistics?url=${encodedCogUrl}&max_size=512&resampling=bilinear`;
};

/**
 * Get Titiler info/metadata URL for a topography COG
 */
export const getTopoInfoUrl = (avaSlug, layerType) => {
  const cogUrl = getTopoCogUrl(avaSlug, layerType);
  if (!cogUrl) return null;
  const encodedCogUrl = encodeURIComponent(cogUrl);
  return `${TITILER_URL}/cog/info?url=${encodedCogUrl}`;
};

// MapLibre source/layer ID helpers
export const getTopoSourceId = (layerType) => `topo-${layerType}`;
export const getTopoLayerId = (layerType) => `topo-${layerType}-layer`;

// Default opacity
export const TOPO_LAYER_OPACITY = 0.65;
