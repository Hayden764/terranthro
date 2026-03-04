import { useEffect, useState, useRef } from 'react';
import { 
  getTitilerTileUrl,
  getTitilerTileUrlWithRescale,
  getCogFileUrl,
  CLIMATE_SOURCE_ID,
  CLIMATE_LAYER_ID,
  CLIMATE_LAYER_OPACITY
} from './climateConfig';

/**
 * Climate Layer Component
 * Manages PRISM climate data visualization on MapLibre map via Titiler
 * 
 * @param {Object} props
 * @param {Object} props.map - MapLibre map instance
 * @param {string} props.avaName - AVA name (slug format, e.g., "dundee-hills")
 * @param {string} props.prismVar - PRISM variable id e.g. "tdmean", "ppt", "tmax", "tmin"
 * @param {string} props.colormap - Titiler colormap name e.g. "plasma", "blues"
 * @param {boolean} props.isVisible - Whether layer should be visible
 * @param {number} props.currentMonth - Current month (1-12)
 * @param {string|null} props.rescale - Titiler rescale string e.g. "3.5,14.2", or null for auto
 */
const ClimateLayer = ({ 
  map, 
  avaName, 
  prismVar = 'tdmean',
  colormap = 'plasma',
  isVisible = false, 
  currentMonth = 1,
  rescale = null
}) => {
  const [isSourceAdded, setIsSourceAdded] = useState(false);
  const mapRef = useRef(map);

  // Keep mapRef in sync
  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  // Add/remove climate source and layer
  useEffect(() => {
    if (!map || !avaName) return;

    console.log(`🌡️ ClimateLayer effect triggered - Month: ${currentMonth}, AVA: ${avaName}`);

    const addClimateLayer = () => {
      // Check if map is still valid
      if (!map || !map.getStyle || !map.getStyle()) return;

      // Remove existing source and layer if present
      try {
        if (map.getLayer(CLIMATE_LAYER_ID)) {
          map.removeLayer(CLIMATE_LAYER_ID);
          console.log('🗑️ Removed existing climate layer');
        }
        if (map.getSource(CLIMATE_SOURCE_ID)) {
          map.removeSource(CLIMATE_SOURCE_ID);
          console.log('🗑️ Removed existing climate source');
        }
      } catch (e) {
        console.warn('Error removing existing climate layer:', e);
      }

      // Build COG URL using the selected PRISM variable
      const year = 2020;
      const monthStr = String(currentMonth).padStart(2, '0');
      const cogUrl = `http://host.docker.internal:8080/climate-data/${avaName}/prism_${prismVar}_${avaName}_2020${monthStr}_cog.tif`;
      const encodedCogUrl = encodeURIComponent(cogUrl);

      const rescaleParam = rescale ? rescale : '-22,26';
      const tileUrl = `http://localhost:8000/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedCogUrl}&rescale=${rescaleParam}&colormap_name=${colormap}`;
      console.log('✅ Adding climate layer with Titiler URL:', tileUrl);

      try {
        // Add raster source using Titiler tiles
        map.addSource(CLIMATE_SOURCE_ID, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          attribution: 'PRISM Climate Data'
        });

        // Determine layer insertion point
        let beforeLayerId = undefined;
        if (map.getLayer('ava-boundary-fill')) {
          beforeLayerId = 'ava-boundary-fill';
        }

        // Add raster layer
        map.addLayer({
          id: CLIMATE_LAYER_ID,
          type: 'raster',
          source: CLIMATE_SOURCE_ID,
          paint: {
            'raster-opacity': isVisible ? CLIMATE_LAYER_OPACITY : 0,
            'raster-fade-duration': 300
          }
        }, beforeLayerId);

        setIsSourceAdded(true);
        console.log(`✅ Climate layer added for ${avaName}, month ${currentMonth}`);
      } catch (error) {
        console.error('Error adding climate layer:', error);
      }
    };

    // Wait for map to be loaded - use a small timeout to batch rapid changes
    const timeoutId = setTimeout(() => {
      if (map.loaded && map.loaded()) {
        addClimateLayer();
      } else {
        map.once('load', addClimateLayer);
      }
    }, 100); // 100ms debounce

    return () => {
      clearTimeout(timeoutId);
      // Don't remove the layer on cleanup during month changes
      // Only remove when component unmounts for real
    };
  }, [map, avaName, prismVar, colormap, currentMonth, isVisible, rescale]);

  // Update layer visibility
  useEffect(() => {
    if (!map || !isSourceAdded) return;

    try {
      if (map.getStyle && map.getStyle() && map.getLayer(CLIMATE_LAYER_ID)) {
        map.setPaintProperty(
          CLIMATE_LAYER_ID,
          'raster-opacity',
          isVisible ? CLIMATE_LAYER_OPACITY : 0
        );
      }
    } catch (e) {
      // Map may have been removed, ignore errors
    }
  }, [map, isVisible, isSourceAdded]);

  // This component doesn't render anything - it just manages map layers
  return null;
};

export default ClimateLayer;
