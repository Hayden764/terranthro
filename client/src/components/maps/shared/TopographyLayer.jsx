import { useEffect, useRef } from 'react';
import {
  getTopoTileUrl,
  getTopoSourceId,
  getTopoLayerId,
  TOPO_LAYER_OPACITY
} from './topographyConfig';

/**
 * TopographyLayer Component
 * Manages adding/removing topography raster tile layers on the MapLibre map.
 * Renders nothing visually — controls map sources/layers imperatively.
 *
 * @param {Object} props
 * @param {Object} props.map - MapLibre map instance
 * @param {string} props.avaSlug - AVA URL slug (e.g. "dundee-hills")
 * @param {string|null} props.activeLayer - Currently active layer type ('elevation'|'slope'|'aspect') or null
 */
const TopographyLayer = ({ map, avaSlug, activeLayer }) => {
  const prevLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !activeLayer || !avaSlug) return;

    const sourceId = `topo-${activeLayer}-source`;
    const layerId = `topo-${activeLayer}-layer`;

    // Remove existing layer/source if present
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    // Determine which file and colormap to use
    let layerFile = '';
    let colormap = 'terrain';

    if (activeLayer === 'elevation') {
      layerFile = 'elevation.tif';
      colormap = 'terrain';
    } else if (activeLayer === 'slope') {
      layerFile = 'slope.tif';
      colormap = 'viridis';
    } else if (activeLayer === 'aspect') {
      layerFile = 'aspect.tif';
      colormap = 'twilight';
    }

    // Determine state from AVA slug (for now, hardcode to OR for Oregon AVAs)
    // TODO: Add state mapping or pass state as prop
    const state = 'OR';

    // Generate the COG URL based on the layer type
    // Use your Mac's local IP address (10.0.0.204) so Titiler in Docker can reach http-server
    // NOTE: Update this IP if your network changes
    const cogUrl = `http://10.0.0.204:8080/topography-data/${state}/${avaSlug}/${layerFile}`;
    console.log(`🗺️ TopographyLayer: Loading ${activeLayer} for AVA slug: "${avaSlug}"`);
    console.log(`🗺️ TopographyLayer: COG URL: ${cogUrl}`);

    // Generate the Titiler tile URL
    const tileUrl = `http://localhost:8000/cog/tiles/{z}/{x}/{y}.png?url=${encodeURIComponent(cogUrl)}&colormap_name=${colormap}`;
    console.log(`🗺️ TopographyLayer: Tile URL: ${tileUrl}`);

    // Add the raster source
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 18
    });

    // Add the raster layer
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': 0.7
      }
    });

    prevLayerRef.current = activeLayer;

    // Cleanup on unmount
    return () => {
      if (!map) return;
      const current = prevLayerRef.current;
      if (current) {
        try {
          const lid = getTopoLayerId(current);
          const sid = getTopoSourceId(current);
          if (map.getLayer(lid)) map.removeLayer(lid);
          if (map.getSource(sid)) map.removeSource(sid);
        } catch (e) {
          // Map may already be removed
        }
      }
    };
  }, [map, avaSlug, activeLayer]);

  return null; // This component manages map layers imperatively
};

export default TopographyLayer;
