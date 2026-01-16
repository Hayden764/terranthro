import { useCallback, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Source, Layer } from 'react-map-gl';
import { feature } from 'topojson-client';
import usStatesTopo from '../../data/us-states-topo.json';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Dynamic State Map Component
 * Renders any US state with optional AVA boundaries
 * 
 * @param {object} stateConfig - State configuration from stateConfig.js
 * @param {object|null} avaData - GeoJSON FeatureCollection of AVAs (or null)
 */
const MapboxStateMap = ({ stateConfig, avaData }) => {
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [hoveredAVAId, setHoveredAVAId] = useState(null);
  const [hoveredAVAName, setHoveredAVAName] = useState(null);
  const [cursor, setCursor] = useState('default');

  // Helper function to generate URL-friendly slug from AVA name
  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Process AVA data - sort by size (largest first) and add IDs
  const processedAvaData = useMemo(() => {
    if (!avaData || !avaData.features) return null;

    const sortedFeatures = avaData.features
      .map((feature, index) => {
        // Calculate approximate area from bounds
        let minLng = Infinity, maxLng = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;
        
        // Handle different geometry types
        const extractCoords = (geometry) => {
          if (geometry.type === 'Polygon') {
            return geometry.coordinates[0];
          } else if (geometry.type === 'MultiPolygon') {
            return geometry.coordinates.flat(2);
          }
          return [];
        };
        
        const coords = extractCoords(feature.geometry);
        coords.forEach(coord => {
          if (Array.isArray(coord) && coord.length >= 2) {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          }
        });
        
        const area = (maxLng - minLng) * (maxLat - minLat);
        
        return {
          ...feature,
          id: index,
          properties: {
            ...feature.properties,
            _area: area
          }
        };
      })
      .sort((a, b) => b.properties._area - a.properties._area); // Largest first

    return {
      type: 'FeatureCollection',
      features: sortedFeatures
    };
  }, [avaData]);

  // Get state boundary from TopoJSON
  const stateBoundary = useMemo(() => {
    if (!stateConfig) return null;
    
    const states = feature(usStatesTopo, usStatesTopo.objects.states);
    const stateFeature = states.features.find(f => f.properties.name === stateConfig.name);
    
    if (stateFeature) {
      return {
        type: 'FeatureCollection',
        features: [stateFeature]
      };
    }
    return null;
  }, [stateConfig]);

  // Calculate state bounds for fitBounds
  const stateBounds = useMemo(() => {
    if (!stateBoundary) return null;
    
    const geometry = stateBoundary.features[0].geometry;
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;
    
    // Handle different geometry types
    const processCoords = (coords) => {
      if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
        // This is an array of [lng, lat] pairs
        coords.forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      } else {
        // Nested arrays, recurse
        coords.forEach(c => processCoords(c));
      }
    };
    
    processCoords(geometry.coordinates);
    
    if (!isFinite(minLng)) {
      // Fallback to config center
      return [
        [stateConfig.centerLng - 5, stateConfig.centerLat - 3],
        [stateConfig.centerLng + 5, stateConfig.centerLat + 3]
      ];
    }
    
    return [[minLng, minLat], [maxLng, maxLat]];
  }, [stateBoundary, stateConfig]);

  // Initialize map when loaded
  const onLoad = useCallback(() => {
    console.log(`${stateConfig?.name} map initialized successfully`);
    // Note: We don't call fitBounds here to preserve the view from the globe transition
    // The initialViewState already positions the map correctly
  }, [stateConfig]);

  // AVA fill layer - transparent with subtle white tint on hover
  const avaFillLayer = {
    id: 'ava-fills',
    type: 'fill',
    source: 'avas',
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'rgba(255, 255, 255, 0.2)',
        'transparent'
      ],
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        1,
        0
      ]
    }
  };

  // AVA border layer - white for satellite visibility
  const avaBorderLayer = {
    id: 'ava-borders',
    type: 'line',
    source: 'avas',
    paint: {
      'line-color': '#FFFFFF',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2.5,
        1.5
      ]
    }
  };

  // State boundary layer (on top) - white for satellite
  const stateBoundaryLayer = {
    id: 'state-boundary',
    type: 'line',
    source: 'state-boundary',
    paint: {
      'line-color': '#FFFFFF',
      'line-width': 3
    }
  };

  // State fill layer (background) - transparent for satellite
  const stateFillLayer = {
    id: 'state-fill',
    type: 'fill',
    source: 'state-fill-source',
    paint: {
      'fill-color': 'transparent',
      'fill-opacity': 0
    }
  };

  // Handle hover on AVAs
  const onMouseMove = useCallback((event) => {
    const map = mapRef.current?.getMap();
    if (!map || !processedAvaData) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ['ava-fills']
    });

    if (features.length > 0) {
      const feature = features[0];
      setCursor('pointer');

      // Update hover state
      if (hoveredAVAId !== null && hoveredAVAId !== feature.id) {
        map.setFeatureState(
          { source: 'avas', id: hoveredAVAId },
          { hover: false }
        );
      }
      map.setFeatureState(
        { source: 'avas', id: feature.id },
        { hover: true }
      );
      setHoveredAVAId(feature.id);
      
      // Set AVA name for overlay display
      const avaName = feature.properties.name || feature.properties.ava_name || feature.properties.ava_id || 'Unknown AVA';
      setHoveredAVAName(avaName);
    } else {
      setCursor('default');
      if (hoveredAVAId !== null) {
        map.setFeatureState(
          { source: 'avas', id: hoveredAVAId },
          { hover: false }
        );
        setHoveredAVAId(null);
        setHoveredAVAName(null);
      }
    }
  }, [hoveredAVAId, processedAvaData]);

  // Handle mouse leave
  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    setCursor('default');
    if (hoveredAVAId !== null) {
      map.setFeatureState(
        { source: 'avas', id: hoveredAVAId },
        { hover: false }
      );
      setHoveredAVAId(null);
      setHoveredAVAName(null);
    }
  }, [hoveredAVAId]);

  // Handle click on AVAs - navigate to AVA detail page
  const onClick = useCallback((event) => {
    const map = mapRef.current?.getMap();
    if (!map || !processedAvaData) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ['ava-fills']
    });

    if (features.length > 0) {
      const feature = features[0];
      const avaName = feature.properties.name || feature.properties.ava_name || feature.properties.ava_id;
      
      console.log('Clicked feature properties:', feature.properties);
      
      if (avaName && stateConfig) {
        const avaSlug = generateSlug(avaName);
        const stateName = stateConfig.name.toLowerCase();
        console.log(`Navigation details:
  AVA Name: "${avaName}"
  Generated Slug: "${avaSlug}"
  State: "${stateName}"
  Full URL: /states/${stateName}/avas/${avaSlug}`);
        navigate(`/states/${stateName}/avas/${avaSlug}`);
      } else {
        console.error('Missing avaName or stateConfig:', { avaName, stateConfig });
      }
    }
  }, [processedAvaData, stateConfig, navigate]);

  // Error states
  if (!MAPBOX_TOKEN) {
    return (
      <div className="map-error">
        <p>Error: Mapbox token not found. Please check your .env file.</p>
      </div>
    );
  }

  if (!stateConfig) {
    return (
      <div className="map-error">
        <p>No state configuration provided.</p>
      </div>
    );
  }

  return (
    <div className="mapbox-state-map" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: stateConfig.centerLng,
          latitude: stateConfig.centerLat,
          zoom: stateConfig.zoom || 6
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        projection="globe"
        onMouseMove={processedAvaData ? onMouseMove : undefined}
        onMouseLeave={processedAvaData ? onMouseLeave : undefined}
        onClick={processedAvaData ? onClick : undefined}
        onLoad={onLoad}
        cursor={cursor}
        interactiveLayerIds={processedAvaData ? ['ava-fills'] : []}
      >
        {/* State fill (background) - only if no AVAs */}
        {stateBoundary && !processedAvaData && (
          <Source id="state-fill-source" type="geojson" data={stateBoundary}>
            <Layer {...stateFillLayer} />
          </Source>
        )}

        {/* AVA source and layers */}
        {processedAvaData && (
          <Source id="avas" type="geojson" data={processedAvaData}>
            <Layer {...avaFillLayer} />
            <Layer {...avaBorderLayer} />
          </Source>
        )}

        {/* State boundary (on top) */}
        {stateBoundary && (
          <Source id="state-boundary" type="geojson" data={stateBoundary}>
            <Layer {...stateBoundaryLayer} />
          </Source>
        )}
      </Map>
      
      {/* AVA Name Overlay */}
      {hoveredAVAName && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '4px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '16px',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          {hoveredAVAName}
        </div>
      )}
    </div>
  );
};

export default MapboxStateMap;
