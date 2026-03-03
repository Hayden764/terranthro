import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import TerrainControlsPanel from "./shared/TerrainControls";
import ClimateLayer from "./shared/ClimateLayer";
import TopographyLayer from "./shared/TopographyLayer";
import DataLayerPanel from "./shared/DataLayerPanel";

/**
 * MapLibre AVA Viewer Component
 * Displays AVA detail map with 3D terrain and interactive controls
 */
const MapLibreAVAViewer = ({ avaData }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const boundsRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const location = useLocation();
  const { avaSlug } = useParams();
  
  // Terrain controls state
  const [terrainEnabled, setTerrainEnabled] = useState(true);
  const [currentPitch, setCurrentPitch] = useState(60);
  const [currentBearing, setCurrentBearing] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Climate layer state
  const [climateVisible, setClimateVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // Topography layer state
  const [activeTopoLayer, setActiveTopoLayer] = useState(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!avaData) {
      console.warn('MapLibreAVAViewer: No avaData provided');
      return;
    }

    // Handle both full GeoJSON FeatureCollection and single Feature
    const geometry = avaData.geometry || (avaData.features && avaData.features[0]?.geometry);
    if (!geometry) {
      console.warn('MapLibreAVAViewer: No geometry found in avaData', avaData);
      return;
    }

    // Create a proper GeoJSON object for the source
    const geoJsonData = avaData.type === 'Feature' 
      ? avaData 
      : { type: 'Feature', properties: avaData.properties || {}, geometry };

    // Calculate initial center and bounds from geometry
    let initialCenter = [-120, 38];
    const bounds = new maplibregl.LngLatBounds();
    
    try {
      const processCoords = (coords) => {
        coords.forEach(coord => bounds.extend(coord));
      };
      
      if (geometry.type === 'Polygon') {
        processCoords(geometry.coordinates[0]);
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => processCoords(polygon[0]));
      }
      
      if (!bounds.isEmpty()) {
        initialCenter = bounds.getCenter().toArray();
        boundsRef.current = bounds;
      }
    } catch (e) {
      console.warn('Could not calculate bounds:', e);
    }

    // Initialize map with MapTiler hybrid basemap
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://api.maptiler.com/maps/hybrid-v4/style.json?key=MxVkcANRbOpQXn3scb8K',
      center: initialCenter,
      zoom: 10,
      pitch: 0,
      bearing: 0,
      minPitch: 0,
      maxPitch: 85
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('Map loaded, adding AVA layer');
      setMapLoaded(true);

      // Add terrain source for 3D terrain
      map.addSource('terrainSource', {
        type: 'raster-dem',
        tiles: [
          'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
        ],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15
      });

      // Enable terrain by default with 60° pitch
      map.setTerrain({ source: 'terrainSource', exaggeration: 2.0 });
      map.setPitch(60);

      // Add AVA boundary
      map.addSource('ava-boundary', {
        type: 'geojson',
        data: geoJsonData
      });

      // AVA boundary fill — faint warm tint (frosted pane)
      map.addLayer({
        id: 'ava-boundary-fill',
        type: 'fill',
        source: 'ava-boundary',
        paint: {
          'fill-color': '#FFB81C',
          'fill-opacity': 0.05
        }
      });

      // AVA boundary — outer glow pass (wide, soft, warm)
      map.addLayer({
        id: 'ava-boundary-glow',
        type: 'line',
        source: 'ava-boundary',
        paint: {
          'line-color': '#FFD97A',
          'line-width': 14,
          'line-opacity': 0.15,
          'line-blur': 7
        }
      });

      // AVA boundary — crisp warm ivory line on top
      map.addLayer({
        id: 'ava-boundary-line',
        type: 'line',
        source: 'ava-boundary',
        paint: {
          'line-color': '#FFE8A0',
          'line-width': 2.5,
          'line-opacity': 0.85
        }
      });

      // Fit to AVA bounds
      if (boundsRef.current && !boundsRef.current.isEmpty()) {
        map.fitBounds(boundsRef.current, {
          padding: 80,
          duration: 1000
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [avaData]);

  // Handler: Zoom in
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 300 });
    }
  };

  // Handler: Zoom out
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 300 });
    }
  };

  // Handler: Reset view to initial state
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 800
      });
      setCurrentPitch(0);
      setCurrentBearing(0);

      // Fit to AVA bounds
      if (boundsRef.current && !boundsRef.current.isEmpty()) {
        setTimeout(() => {
          mapRef.current.fitBounds(boundsRef.current, {
            padding: 80,
            duration: 1000
          });
        }, 100);
      }
    }
  };

  // Handler: Toggle 3D terrain
  const handleToggleTerrain = (enabled) => {
    const map = mapRef.current;
    if (!map) return;

    if (enabled) {
      // First, ensure terrain source exists
      if (!map.getSource('terrainSource')) {
        map.addSource('terrainSource', {
          type: 'raster-dem',
          tiles: [
            'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
          ],
          encoding: 'terrarium',
          tileSize: 256,
          maxzoom: 15
        });
      }

      // Enable terrain with exaggeration
      map.setTerrain({
        source: 'terrainSource',
        exaggeration: 2.0
      });
    } else {
      // Disable terrain
      map.setTerrain(null);

      // Reset pitch to 0 when disabling
      map.easeTo({ pitch: 0, duration: 500 });
      setCurrentPitch(0);
    }

    setTerrainEnabled(enabled);
  };

  // Handler: Change camera bearing
  const handleBearingChange = (bearing) => {
    if (mapRef.current) {
      mapRef.current.setBearing(bearing);
      setCurrentBearing(bearing);
    }
  };

  // Handler: Change camera pitch
  const handlePitchChange = (pitch) => {
    if (mapRef.current) {
      mapRef.current.setPitch(pitch);
      setCurrentPitch(pitch);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }} 
      />

      {/* Loading indicator during transition */}
      {isTransitioning && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '8px',
            zIndex: 1000,
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            pointerEvents: 'none',
            animation: 'fadeInOut 2s ease-in-out'
          }}
        >
          Zooming to AVA...
        </div>
      )}

      {/* Climate Layer - manages PRISM data on map */}
      {mapLoaded && mapRef.current && (
        <ClimateLayer
          map={mapRef.current}
          avaName="dundee-hills"
          isVisible={climateVisible}
          currentMonth={currentMonth}
        />
      )}

      {/* Topography Layer - manages slope/aspect/elevation on map */}
      {mapLoaded && mapRef.current && (
        <TopographyLayer
          map={mapRef.current}
          avaSlug={avaSlug}
          activeLayer={activeTopoLayer}
        />
      )}

      {/* Terrain Controls Panel - top right */}
      <div style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <TerrainControlsPanel
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={handleResetView}
          onToggleTerrain={handleToggleTerrain}
          onBearingChange={handleBearingChange}
          onPitchChange={handlePitchChange}
          terrainEnabled={terrainEnabled}
          currentBearing={currentBearing}
          currentPitch={currentPitch}
        />
      </div>

      {/* Unified Data Layer Panel - bottom left */}
      <DataLayerPanel
        climateVisible={climateVisible}
        onClimateToggle={setClimateVisible}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        activeTopoLayer={activeTopoLayer}
        onTopoLayerChange={setActiveTopoLayer}
        avaSlug={avaSlug || ''}
      />

      {/* CSS for fade animation */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MapLibreAVAViewer;
