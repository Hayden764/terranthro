import { useEffect, useRef } from 'react';
import {
  getTopoTileUrl,
  getTopoSourceId,
  getTopoLayerId,
  TOPO_LAYER_OPACITY,
  hasTopographyData,
} from './topographyConfig';

/**
 * TopographyLayer Component
 * Manages adding/removing topography raster tile layers on the MapLibre map.
 * Renders nothing visually — controls map sources/layers imperatively.
 *
 * @param {Object}      props
 * @param {Object}      props.map         - MapLibre map instance
 * @param {string}      props.avaSlug     - AVA URL slug (e.g. "dundee-hills")
 * @param {string|null} props.activeLayer - Active layer type: 'elevation'|'slope'|'aspect', or null
 * @param {string|null} props.rescale     - Titiler rescale string e.g. "12.5,850.0", or null for colormap default
 */
const TopographyLayer = ({ map, avaSlug, activeLayer, rescale = null }) => {
  const prevLayerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // ── Remove previous layer/source when switching layers ──────────────
    const prev = prevLayerRef.current;
    if (prev && prev !== activeLayer) {
      try {
        const lid = getTopoLayerId(prev);
        const sid = getTopoSourceId(prev);
        if (map.getLayer(lid)) map.removeLayer(lid);
        if (map.getSource(sid)) map.removeSource(sid);
      } catch (e) {
        console.warn('TopographyLayer: error removing previous layer', e);
      }
      prevLayerRef.current = null;
    }

    if (!activeLayer || !avaSlug) return;

    if (!hasTopographyData(avaSlug)) {
      console.warn(`TopographyLayer: no topo data registered for slug "${avaSlug}"`);
      return;
    }

    const tileUrl = getTopoTileUrl(avaSlug, activeLayer, rescale);
    if (!tileUrl) {
      console.warn(`TopographyLayer: could not build tile URL for "${avaSlug}" / "${activeLayer}"`);
      return;
    }

    const sourceId = getTopoSourceId(activeLayer);
    const layerId  = getTopoLayerId(activeLayer);

    console.log(`🗺️ TopographyLayer: loading ${activeLayer} for "${avaSlug}"`);
    console.log(`🗺️ TopographyLayer: tile URL → ${tileUrl}`);

    // Remove any stale source/layer with the same IDs (e.g. after hot-reload)
    try {
      if (map.getLayer(layerId))  map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    } catch (e) { /* ignore */ }

    // Add raster source
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 18,
    });

    // Insert below AVA boundary so it doesn't cover the outline
    let beforeLayerId;
    if (map.getLayer('ava-boundary-fill')) beforeLayerId = 'ava-boundary-fill';

    map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': TOPO_LAYER_OPACITY,
        'raster-fade-duration': 300,
      },
    }, beforeLayerId);

    prevLayerRef.current = activeLayer;

    // Cleanup on unmount
    return () => {
      if (!map) return;
      try {
        if (map.getLayer(layerId))  map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch (e) {
        // Map may already be removed/destroyed
      }
    };
  }, [map, avaSlug, activeLayer, rescale]);

  return null;
};

export default TopographyLayer;
