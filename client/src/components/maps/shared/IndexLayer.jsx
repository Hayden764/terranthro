import { useEffect, useState } from 'react';
import {
  TITILER_URL,
  COG_SERVER_URL,
  INDEX_SOURCE_ID,
  INDEX_LAYER_ID,
  CLIMATE_LAYER_OPACITY,
  WINKLER_COLORMAP,
  HUGLIN_COLORMAP,
} from './climateConfig';

/**
 * IndexLayer
 * Renders a growing-season index COG on the MapLibre map via Titiler.
 * Handles both continuous (plasma colormap + rescale) and
 * classified (discrete JSON colormap, no rescale) layers.
 *
 * @param {Object}      props
 * @param {Object}      props.map          - MapLibre map instance
 * @param {string}      props.fileSlug     - COG slug e.g. "gdd_winkler_accumulated"
 * @param {number}      props.year         - Vintage year e.g. 2025
 * @param {boolean}     props.isClassified - True = discrete colormap
 * @param {string|null} props.colormapData - "winkler" | "huglin" | null
 * @param {string}      props.colormap     - Titiler named colormap (continuous only)
 * @param {string}      props.rescaleDefault - Fallback rescale e.g. "0,5000"
 * @param {string|null} props.rescale      - Auto-adjusted rescale string
 * @param {boolean}     props.isVisible    - Layer visibility
 */
const IndexLayer = ({
  map,
  fileSlug,
  year = 2025,
  isClassified = false,
  colormapData = null,
  colormap = 'plasma',
  rescaleDefault = '0,5000',
  rescale = null,
  isVisible = false,
}) => {
  const [isSourceAdded, setIsSourceAdded] = useState(false);

  useEffect(() => {
    if (!map || !fileSlug) return;

    const addLayer = () => {
      if (!map || !map.getStyle || !map.getStyle()) return;

      // Clean up existing
      try {
        if (map.getLayer(INDEX_LAYER_ID)) map.removeLayer(INDEX_LAYER_ID);
        if (map.getSource(INDEX_SOURCE_ID)) map.removeSource(INDEX_SOURCE_ID);
      } catch (e) {
        console.warn('IndexLayer: cleanup error', e);
      }

      // Docker-internal COG URL for Titiler
      const cogUrl = `https://cogs.terranthro.com/climate-data/indices/${fileSlug}_${year}_cog.tif`;
      const encodedCogUrl = encodeURIComponent(cogUrl);

      let tileUrl;

      if (isClassified && colormapData) {
        // Discrete colormap — pass as JSON, no rescale
        const cmapObj = colormapData === 'winkler' ? WINKLER_COLORMAP : HUGLIN_COLORMAP;
        const encodedCmap = encodeURIComponent(JSON.stringify(cmapObj));
        tileUrl = `${TITILER_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedCogUrl}&colormap=${encodedCmap}`;
      } else {
        // Continuous colormap with rescale
        const rescaleParam = rescale || rescaleDefault;
        tileUrl = `${TITILER_URL}/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedCogUrl}&rescale=${rescaleParam}&colormap_name=${colormap}`;
      }

      console.log(`🌱 IndexLayer: adding ${fileSlug} ${year}`, tileUrl);

      try {
        map.addSource(INDEX_SOURCE_ID, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          attribution: 'PRISM Climate Data / Terranthro',
        });

        let beforeLayerId;
        if (map.getLayer('ava-boundary-fill')) beforeLayerId = 'ava-boundary-fill';

        map.addLayer({
          id: INDEX_LAYER_ID,
          type: 'raster',
          source: INDEX_SOURCE_ID,
          paint: {
            'raster-opacity': isVisible ? CLIMATE_LAYER_OPACITY : 0,
            'raster-fade-duration': 300,
          },
        }, beforeLayerId);

        setIsSourceAdded(true);
        console.log(`✅ IndexLayer added: ${fileSlug} ${year}`);
      } catch (err) {
        console.error('IndexLayer: add error', err);
      }
    };

    const timeoutId = setTimeout(() => {
      if (map.loaded && map.loaded()) addLayer();
      else map.once('load', addLayer);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [map, fileSlug, year, isClassified, colormapData, colormap, rescale, rescaleDefault, isVisible]);

  // Sync visibility without re-adding the layer
  useEffect(() => {
    if (!map || !isSourceAdded) return;
    try {
      if (map.getStyle && map.getStyle() && map.getLayer(INDEX_LAYER_ID)) {
        map.setPaintProperty(INDEX_LAYER_ID, 'raster-opacity', isVisible ? CLIMATE_LAYER_OPACITY : 0);
      }
    } catch (e) { /* map removed */ }
  }, [map, isVisible, isSourceAdded]);

  return null;
};

export default IndexLayer;
