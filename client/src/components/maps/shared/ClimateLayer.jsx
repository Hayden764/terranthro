import { useEffect, useState, useRef } from 'react';
import { 
  getTitilerTileUrl,
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
 * @param {boolean} props.isVisible - Whether layer should be visible
 * @param {number} props.currentMonth - Current month (1-12)
 */
const ClimateLayer = ({ 
  map, 
  avaName, 
  isVisible = false, 
  currentMonth = 1 
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

      // Get Titiler tile URL for current month (national PRISM COG)
      const year = 2020;
      const monthStr = String(currentMonth).padStart(2, '0');
      const cogUrl = `http://host.docker.internal:8080/climate-data/dundee-hills/prism_tdmean_us_30s_${year}${monthStr}_avg_30y_cog.tif`;
      const encodedCogUrl = encodeURIComponent(cogUrl);
      const tileUrl = `http://localhost:8000/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedCogUrl}&rescale=-22,26&colormap_name=plasma`;
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
  }, [map, avaName, currentMonth, isVisible]);

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
