/**
 * Climate Data Configuration
 * Color ramps, month names, and settings for PRISM climate visualization
 */

// Titiler and COG server URLs
export const TITILER_URL = 'http://localhost:8000';
// COG server - use localhost for Titiler to access from Docker
export const COG_SERVER_URL = 'http://localhost:8080';

/**
 * Base URL for climate data COG files served by http-server
 * Titiler runs inside Docker, so it needs host.docker.internal
 * to reach the http-server running on the host at port 8080
 */
const COG_BASE_URL = 'http://host.docker.internal:8080';

// If ports 8000/8080 are in use, try these alternative ports:
// export const TITILER_URL = 'http://localhost:8001';
// export const COG_SERVER_URL = 'http://host.docker.internal:8081';
// Then run:
// npx http-server ./public -p 8081 --cors
// docker run -p 8001:8000 developmentseed/titiler

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

// Layer IDs
export const CLIMATE_SOURCE_ID = 'prism-climate';
export const CLIMATE_LAYER_ID = 'prism-climate-layer';

/**
 * Get the COG file URL for a given AVA and month
 * http-server is running from project root, serving /climate-data/ directory
 */
export const getCogFileUrl = (avaName, month) => {
  const monthStr = String(month).padStart(2, '0');
  // Correct path: /climate-data/{avaName}/prism_tdmean_{avaName}_2020{month}_cog.tif
  return `${COG_SERVER_URL}/climate-data/${avaName}/prism_tdmean_${avaName}_2020${monthStr}_cog.tif`;
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
