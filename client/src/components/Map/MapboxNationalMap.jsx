import { useCallback, useMemo, useState, useRef } from 'react';
import { Map, Source, Layer } from 'react-map-gl';
import { useNavigate } from 'react-router-dom';
import { feature } from 'topojson-client';
import { calculateSymbolSize } from '../../utils/symbolScale';
import { normalizeStateName, getStateConfig } from '../../config/stateConfig';
import usStatesTopo from '../../data/us-states-topo.json';
import wineStatesData from '../../data/wine-states-production.json';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Log token status for debugging
console.log('Mapbox token loaded:', MAPBOX_TOKEN ? MAPBOX_TOKEN.substring(0, 10) + '...' : 'MISSING');

// Animation configuration
const TRANSITION_DURATION = 2000; // ms - configurable for testing different timings

const MapboxNationalMap = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [hoveredStateId, setHoveredStateId] = useState(null);
  const [cursor, setCursor] = useState('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Create wine state names set for quick lookup
  const wineStateNames = useMemo(() => 
    new Set(wineStatesData.map(state => state.name)),
    []
  );

  // Convert TopoJSON to GeoJSON with wine state flag
  const statesGeoJSON = useMemo(() => {
    const states = feature(usStatesTopo, usStatesTopo.objects.states);
    // Add isWineState property to each feature
    states.features = states.features.map((feature, index) => ({
      ...feature,
      id: index,
      properties: {
        ...feature.properties,
        isWineState: wineStateNames.has(feature.properties.name)
      }
    }));
    console.log('Loaded', states.features.filter(f => f.properties.isWineState).length, 'wine states');
    return states;
  }, [wineStateNames]);

  // Create production symbols GeoJSON (points at centroids)
  const symbolsGeoJSON = useMemo(() => {
    const isMobile = window.innerWidth < 768;
    const mobileScale = isMobile ? 0.7 : 1;

    const features = wineStatesData.map(state => {
      const symbolSizes = calculateSymbolSize(state.tons_crushed, 'national');
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: state.centroid.coordinates
        },
        properties: {
          name: state.name,
          abbreviation: state.abbreviation,
          tons_crushed: state.tons_crushed,
          outerRadius: symbolSizes.outer * mobileScale,
          innerRadius: symbolSizes.inner * mobileScale
        }
      };
    });

    console.log('Created symbols for', features.length, 'wine states');
    return {
      type: 'FeatureCollection',
      features
    };
  }, []);

  // State fill layer - transparent for satellite basemap
  const stateFillLayer = {
    id: 'state-fills',
    type: 'fill',
    source: 'states',
    paint: {
      'fill-color': 'transparent',
      'fill-opacity': 0
    }
  };

  // State border layer (all states) - black borders
  const stateBorderLayer = {
    id: 'state-borders',
    type: 'line',
    source: 'states',
    paint: {
      'line-color': '#000000',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        2,
        ['case', ['get', 'isWineState'], 1, 0.5]
      ]
    }
  };

  // Outer circle layer for production symbols - white for satellite visibility
  // (Currently disabled - see render section)
  const outerCircleLayer = {
    id: 'symbol-outer-circles',
    type: 'circle',
    source: 'symbols',
    paint: {
      'circle-radius': ['get', 'outerRadius'],
      'circle-color': 'transparent',
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-width': 2.5
    }
  };

  // Inner circle layer for production symbols - white for satellite visibility
  // (Currently disabled - see render section)
  const innerCircleLayer = {
    id: 'symbol-inner-circles',
    type: 'circle',
    source: 'symbols',
    paint: {
      'circle-radius': ['get', 'innerRadius'],
      'circle-color': 'transparent',
      'circle-stroke-color': '#FFFFFF',
      'circle-stroke-width': 1.5
    }
  };

  // Handle hover on states
  const onMouseMove = useCallback((event) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ['state-fills']
    });

    if (features.length > 0) {
      const feature = features[0];
      const isWineState = feature.properties.isWineState;

      // Update cursor
      setCursor(isWineState ? 'pointer' : 'default');

      // Update hover state only for wine states
      if (isWineState) {
        if (hoveredStateId !== null && hoveredStateId !== feature.id) {
          map.setFeatureState(
            { source: 'states', id: hoveredStateId },
            { hover: false }
          );
        }
        map.setFeatureState(
          { source: 'states', id: feature.id },
          { hover: true }
        );
        setHoveredStateId(feature.id);
      } else {
        // Clear hover if not on wine state
        if (hoveredStateId !== null) {
          map.setFeatureState(
            { source: 'states', id: hoveredStateId },
            { hover: false }
          );
          setHoveredStateId(null);
        }
      }
    } else {
      // Mouse not on any state
      setCursor('default');
      if (hoveredStateId !== null) {
        map.setFeatureState(
          { source: 'states', id: hoveredStateId },
          { hover: false }
        );
        setHoveredStateId(null);
      }
    }
  }, [hoveredStateId]);

  // Handle mouse leave
  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    setCursor('default');
    if (hoveredStateId !== null) {
      map.setFeatureState(
        { source: 'states', id: hoveredStateId },
        { hover: false }
      );
      setHoveredStateId(null);
    }
  }, [hoveredStateId]);

  // Handle click on states with smooth transition
  const onClick = useCallback((event) => {
    const map = mapRef.current?.getMap();
    if (!map || isTransitioning) return;

    // Check symbols first (they're on top)
    const symbolFeatures = map.queryRenderedFeatures(event.point, {
      layers: ['symbol-outer-circles', 'symbol-inner-circles']
    });

    let stateName = null;

    if (symbolFeatures.length > 0) {
      stateName = symbolFeatures[0].properties.name;
      console.log('Clicked symbol:', stateName);
    } else {
      // Check state fills
      const stateFeatures = map.queryRenderedFeatures(event.point, {
        layers: ['state-fills']
      });

      if (stateFeatures.length > 0) {
        const feature = stateFeatures[0];
        if (feature.properties.isWineState) {
          stateName = feature.properties.name;
          console.log('Clicked state:', stateName);
        }
      }
    }

    // If we have a valid wine state, start transition
    if (stateName) {
      const normalizedName = normalizeStateName(stateName);
      const stateConfig = getStateConfig(normalizedName);
      
      if (!stateConfig) {
        console.error('No config found for state:', stateName);
        return;
      }

      // Set transitioning state
      setIsTransitioning(true);

      // Smooth flyTo animation to frame the state
      map.flyTo({
        center: [stateConfig.centerLng, stateConfig.centerLat],
        zoom: stateConfig.zoom || 6,
        pitch: 0,
        bearing: 0,
        duration: TRANSITION_DURATION,
        essential: true // Animation will complete even if user interrupts
      });

      // Navigate to state page after animation completes
      setTimeout(() => {
        navigate(`/states/${normalizedName}`);
      }, TRANSITION_DURATION);
    }
  }, [navigate, isTransitioning]);

  // Handle map load
  const onLoad = useCallback(() => {
    console.log('Map initialized successfully');
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-red-100">
        <p className="text-red-600">Error: Mapbox token not found. Please check your .env file.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading indicator during transition */}
      {isTransitioning && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            background: 'rgba(255, 254, 247, 0.9)',
            padding: '1rem 2rem',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            pointerEvents: 'none'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="animate-spin rounded-full h-5 w-5 border-b-2"
              style={{ borderColor: '#C41E3A' }}
            />
            <span style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: 'var(--text-charcoal)'
            }}>
              LOADING STATE...
            </span>
          </div>
        </div>
      )}
      
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -98,
          latitude: 39,
          zoom: 3.5
        }}
        minZoom={2}
        maxZoom={6}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        projection="globe"
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onLoad={onLoad}
        cursor={cursor}
        interactiveLayerIds={['state-fills']}
      >
        {/* States source and layers */}
        <Source id="states" type="geojson" data={statesGeoJSON}>
          <Layer {...stateFillLayer} />
          <Layer {...stateBorderLayer} />
        </Source>

        {/* Production symbols - disabled for satellite view
        <Source id="symbols" type="geojson" data={symbolsGeoJSON}>
          <Layer {...outerCircleLayer} />
          <Layer {...innerCircleLayer} />
        </Source>
        */}
      </Map>
    </div>
  );
};

export default MapboxNationalMap;
