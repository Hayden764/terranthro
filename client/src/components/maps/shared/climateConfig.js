/**
 * Climate Data Configuration
 * Color ramps, month names, layer definitions, and URL helpers
 * for PRISM climate normals and growing-season index visualization.
 */

// Titiler and COG server URLs
export const TITILER_URL = 'http://localhost:8000';
export const COG_SERVER_URL = 'http://localhost:8080';

// Docker-internal URL — Titiler fetches COGs server-side from inside Docker
const COG_DOCKER_URL = 'http://host.docker.internal:8080';

// If ports 8000/8080 are in use, try these alternative ports:
// export const TITILER_URL = 'http://localhost:8001';
// export const COG_SERVER_URL = 'http://localhost:8081';

// Month names for display
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Temperature color ramp (Celsius to color)
// Blue (cold) → Yellow → Orange → Red (hot)
export const TEMP_COLOR_RAMP = [
  [-20, '#1e3a8a'],  // Very cold - Dark blue
  [-10, '#3b82f6'],  // Cold - Blue
  [0, '#60a5fa'],    // Cool - Light blue
  [5, '#93c5fd'],    // Mild cool - Pale blue
  [10, '#fef3c7'],   // Mild - Pale yellow
  [15, '#fde047'],   // Warm - Yellow
  [20, '#fb923c'],   // Hot - Orange
  [25, '#f97316'],   // Very hot - Deep orange
  [30, '#dc2626'],   // Extreme - Red
  [35, '#991b1b']    // Very extreme - Dark red
];

// Default opacity for climate layer
export const CLIMATE_LAYER_OPACITY = 0.6;

// MapLibre source/layer IDs
export const CLIMATE_SOURCE_ID = 'prism-climate';
export const CLIMATE_LAYER_ID  = 'prism-climate-layer';
export const INDEX_SOURCE_ID   = 'index-climate';
export const INDEX_LAYER_ID    = 'index-climate-layer';

// Available vintage years for growing-season indices
export const INDEX_YEARS = [2025];

/**
 * Continuous color ramps available for user selection.
 * Each entry has:
 *   id       — Titiler colormap_name value
 *   label    — Display name
 *   gradient — CSS background for the swatch bar
 */
export const CONTINUOUS_COLORMAPS = [
  {
    id: 'plasma',
    label: 'Plasma',
    gradient: 'linear-gradient(to right, #0d0887, #5302a3, #8b0aa5, #b83289, #db5c68, #f48849, #febc2a, #f0f921)',
  },
  {
    id: 'viridis',
    label: 'Viridis',
    gradient: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde725)',
  },
  {
    id: 'inferno',
    label: 'Inferno',
    gradient: 'linear-gradient(to right, #000004, #420a68, #932667, #dd513a, #fca50a, #fcffa4)',
  },
  {
    id: 'magma',
    label: 'Magma',
    gradient: 'linear-gradient(to right, #000004, #3b0f70, #8c2981, #de4968, #fe9f6d, #fcfdbf)',
  },
  {
    id: 'rdylgn',
    label: 'Red → Green',
    gradient: 'linear-gradient(to right, #a50026, #f46d43, #fee08b, #d9ef8b, #006837)',
  },
  {
    id: 'blues',
    label: 'Blues',
    gradient: 'linear-gradient(to right, #f7fbff, #9ecae1, #2171b5, #08306b)',
  },
  {
    id: 'reds',
    label: 'Reds',
    gradient: 'linear-gradient(to right, #fff5f0, #fc9272, #cb181d, #67000d)',
  },
  {
    id: 'rdbu',
    label: 'Red ↔ Blue',
    gradient: 'linear-gradient(to right, #b2182b, #f4a582, #f7f7f7, #92c5de, #2166ac)',
  },
  {
    id: 'spectral',
    label: 'Spectral',
    gradient: 'linear-gradient(to right, #9e0142, #f46d43, #ffffbf, #66c2a5, #5e4fa2)',
  },
  {
    id: 'cool',
    label: 'Cool',
    gradient: 'linear-gradient(to right, #00ffff, #a020f0)',
  },
];

/**
 * PRISM monthly normal layer definitions.
 * These are month-based (slider) — national COG per variable per month.
 */
export const CLIMATE_LAYER_TYPES = {
  tdmean: {
    id: 'tdmean',
    label: 'Mean Temperature',
    unit: '°C',
    colormap: 'plasma',
    prismVar: 'tdmean',
    description: 'Average daily mean temperature',
    hasMonthSlider: true,
    isIndex: false,
    available: true,
  },
  tmax: {
    id: 'tmax',
    label: 'Max Temperature',
    unit: '°C',
    colormap: 'inferno',
    prismVar: 'tmax',
    description: 'Average daily maximum temperature',
    hasMonthSlider: true,
    isIndex: false,
    available: false,
  },
  tmin: {
    id: 'tmin',
    label: 'Min Temperature',
    unit: '°C',
    colormap: 'cool',
    prismVar: 'tmin',
    description: 'Average daily minimum temperature',
    hasMonthSlider: true,
    isIndex: false,
    available: false,
  },
  ppt: {
    id: 'ppt',
    label: 'Precipitation',
    unit: 'mm',
    colormap: 'blues',
    prismVar: 'ppt',
    description: 'Total monthly precipitation',
    hasMonthSlider: true,
    isIndex: false,
    available: false,
  },
};

/**
 * Winkler classification color map for Titiler.
 * Classes 1–8 mapped to wine-region-appropriate colors.
 * Passed as JSON to Titiler's colormap param.
 */
export const WINKLER_COLORMAP = {
  1: [59,  130, 246, 255],  // Blue      — Below Ia  (too cool)
  2: [96,  165, 250, 255],  // Lt Blue   — Region Ia
  3: [167, 243, 208, 255],  // Mint      — Region Ib
  4: [253, 224, 71,  255],  // Yellow    — Region II
  5: [251, 146, 60,  255],  // Orange    — Region III
  6: [239, 68,  68,  255],  // Red       — Region IV
  7: [185, 28,  28,  255],  // Dark Red  — Region V
  8: [91,  33,  182, 255],  // Purple    — Above V
};

export const WINKLER_LABELS = {
  1: 'Below Ia  (0–1499)',
  2: 'Region Ia  (1500–2000)',
  3: 'Region Ib  (2001–2500)',
  4: 'Region II  (2501–3000)',
  5: 'Region III (3001–3500)',
  6: 'Region IV  (3501–4000)',
  7: 'Region V   (4001–4900)',
  8: 'Above V    (4900+)',
};

/**
 * Huglin classification color map for Titiler.
 * Classes 1–8 from Too Cold → Very Hot.
 */
export const HUGLIN_COLORMAP = {
  1: [59,  130, 246, 255],  // Blue       — Too Cold     (<1000)
  2: [96,  165, 250, 255],  // Lt Blue    — Very Cool    (1000–1199)
  3: [167, 243, 208, 255],  // Mint       — Cool         (1200–1399)
  4: [253, 224, 71,  255],  // Yellow     — Temperate    (1400–1599)
  5: [251, 191, 36,  255],  // Amber      — Warm Temp    (1600–1799)
  6: [251, 146, 60,  255],  // Orange     — Warm         (1800–1999)
  7: [239, 68,  68,  255],  // Red        — Hot          (2000–2399)
  8: [185, 28,  28,  255],  // Dark Red   — Very Hot     (2400+)
};

export const HUGLIN_LABELS = {
  1: 'Too Cold    (<1000)',
  2: 'Very Cool   (1000–1199)',
  3: 'Cool        (1200–1399)',
  4: 'Temperate   (1400–1599)',
  5: 'Warm Temp   (1600–1799)',
  6: 'Warm        (1800–1999)',
  7: 'Hot         (2000–2399)',
  8: 'Very Hot    (2400+)',
};

/**
 * Growing-season index layer definitions.
 * These are year-based (year dropdown) — no month slider.
 * isClassified: true  → discrete color map, categorical legend
 * isClassified: false → continuous colormap, auto-scale
 */
export const INDEX_LAYER_TYPES = {
  gdd_winkler_accumulated: {
    id: 'gdd_winkler_accumulated',
    label: 'GDD Winkler',
    unit: 'GDD',
    colormap: 'plasma',
    fileSlug: 'gdd_winkler_accumulated',
    description: 'Growing degree days (Apr–Oct)',
    isIndex: true,
    isClassified: false,
    available: true,
    rescaleDefault: '0,5000',
  },
  gdd_winkler_classified: {
    id: 'gdd_winkler_classified',
    label: 'Winkler Regions',
    unit: '',
    colormap: null,                 // uses WINKLER_COLORMAP
    colormapData: 'winkler',
    fileSlug: 'gdd_winkler_classified',
    description: 'Winkler climate classification (I–V)',
    isIndex: true,
    isClassified: true,
    available: true,
    rescaleDefault: '1,8',
  },
  gst_smarthobday: {
    id: 'gst_smarthobday',
    label: 'Growing Season Temp',
    unit: '°C',
    colormap: 'plasma',
    fileSlug: 'gst_smarthobday',
    description: 'Mean temp Apr–Oct (Smart-Hobday)',
    isIndex: true,
    isClassified: false,
    available: true,
    rescaleDefault: '-5,30',
  },
  huglin: {
    id: 'huglin',
    label: 'Huglin Index',
    unit: 'HI',
    colormap: 'plasma',
    fileSlug: 'huglin',
    description: 'Huglin heliothermal index (Apr–Sep)',
    isIndex: true,
    isClassified: false,
    available: true,
    rescaleDefault: '0,4000',
  },
  huglin_classified: {
    id: 'huglin_classified',
    label: 'Huglin Classes',
    unit: '',
    colormap: null,                 // uses HUGLIN_COLORMAP
    colormapData: 'huglin',
    fileSlug: 'huglin_classified',
    description: 'Huglin climate classification',
    isIndex: true,
    isClassified: true,
    available: true,
    rescaleDefault: '1,8',
  },
};

/**
 * Get the national COG file URL for a given PRISM variable and month.
 * Points at the national raster — no per-AVA clipping needed.
 * Browser-facing URL (used by MapLibre tile requests via Titiler).
 */
export const getCogFileUrl = (prismVar, month) => {
  const monthStr = String(month).padStart(2, '0');
  return `${COG_SERVER_URL}/climate-data/national/prism_${prismVar}_us_30s_2020${monthStr}_avg_30y_cog.tif`;
};

/**
 * Get Titiler tile URL template for MapLibre
 * Returns a URL with {z}/{x}/{y} placeholders that MapLibre can use
 * 
 * Using plasma colormap (purple → pink → orange → yellow)
 * Good for temperature visualization
 */
export const getTitilerTileUrl = (avaName, month) => {
  const cogUrl = getCogFileUrl(avaName, month);
  const encodedCogUrl = encodeURIComponent(cogUrl);
  
  // Standard Titiler tiles endpoint with PNG format
  // Let Titiler auto-detect the data range instead of forcing rescale
  return `${TITILER_URL}/cog/tiles/{z}/{x}/{y}.png?url=${encodedCogUrl}&colormap_name=plasma`;
};

/**
 * Get Titiler tile URL with an explicit rescale range
 * Used by the adaptive scale system to re-tile with viewport-derived bounds
 */
export const getTitilerTileUrlWithRescale = (cogUrl, rescaleMin, rescaleMax) => {
  const encodedCogUrl = encodeURIComponent(cogUrl);
  return `${TITILER_URL}/cog/tiles/{z}/{x}/{y}.png?url=${encodedCogUrl}&rescale=${rescaleMin},${rescaleMax}&colormap_name=plasma`;
};

/**
 * Get Titiler statistics URL for a bounding box.
 * Uses the national COG — Titiler reads only the bbox window server-side.
 * IMPORTANT: url param uses host.docker.internal — Titiler fetches COG
 * from inside Docker, so localhost won't reach the host http-server.
 */
export const getTitilerStatsUrl = (prismVar, month, bbox) => {
  const monthStr = String(month).padStart(2, '0');
  const cogUrl = `http://host.docker.internal:8080/climate-data/national/prism_${prismVar}_us_30s_2020${monthStr}_avg_30y_cog.tif`;
  const params = new URLSearchParams({
    url: cogUrl,
    bbox: bbox,
    max_size: '256',
    resampling: 'bilinear',
    coord_crs: 'epsg:4326'
  });
  return `${TITILER_URL}/cog/statistics?${params.toString()}`;
};

/**
 * Get Titiler point-query URL for a specific lng/lat.
 * Returns the raw pixel value at that coordinate from the national COG.
 * IMPORTANT: url uses host.docker.internal for Docker-side fetch.
 */
export const getTitilerPointUrl = (prismVar, month, lng, lat) => {
  const monthStr = String(month).padStart(2, '0');
  const cogUrl = `http://host.docker.internal:8080/climate-data/national/prism_${prismVar}_us_30s_2020${monthStr}_avg_30y_cog.tif`;
  const encodedCogUrl = encodeURIComponent(cogUrl);
  return `${TITILER_URL}/cog/point/${lng}/${lat}?url=${encodedCogUrl}`;
};

/**
 * Get the index COG file URL (browser-facing via http-server).
 * e.g. gdd_winkler_accumulated_2025_cog.tif
 */
export const getIndexCogFileUrl = (fileSlug, year) => {
  return `${COG_SERVER_URL}/climate-data/indices/${fileSlug}_${year}_cog.tif`;
};

/**
 * Get Titiler stats URL for an index COG (Docker-facing URL).
 */
export const getIndexTitilerStatsUrl = (fileSlug, year, bbox) => {
  const cogUrl = `${COG_DOCKER_URL}/climate-data/indices/${fileSlug}_${year}_cog.tif`;
  const params = new URLSearchParams({
    url: cogUrl,
    bbox: bbox,
    max_size: '256',
    resampling: 'bilinear',
    coord_crs: 'epsg:4326',
  });
  return `${TITILER_URL}/cog/statistics?${params.toString()}`;
};

/**
 * Get Titiler point-query URL for an index COG.
 */
export const getIndexTitilerPointUrl = (fileSlug, year, lng, lat) => {
  const cogUrl = `${COG_DOCKER_URL}/climate-data/indices/${fileSlug}_${year}_cog.tif`;
  const encodedCogUrl = encodeURIComponent(cogUrl);
  return `${TITILER_URL}/cog/point/${lng}/${lat}?url=${encodedCogUrl}`;
};

/**
 * Get Titiler metadata/info URL for a COG
 */
export const getTitilerInfoUrl = (avaName, month) => {
  const cogUrl = getCogFileUrl(avaName, month);
  const encodedCogUrl = encodeURIComponent(cogUrl);
  return `${TITILER_URL}/cog/info?url=${encodedCogUrl}`;
};

// Legacy function name for backwards compatibility
export const getClimateDataPath = getTitilerTileUrl;

// Legend configuration
export const LEGEND_TEMPS = [-10, 0, 10, 20, 30];  // Temperature stops for legend
export const LEGEND_COLORS = ['#3b82f6', '#60a5fa', '#fde047', '#fb923c', '#dc2626'];
