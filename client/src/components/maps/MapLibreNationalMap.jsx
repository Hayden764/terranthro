import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { useMapContext } from '../../context/MapContext';
import usStatesGeoJson from "../../data/us-states.json";
import { getConfiguredStateNames, getAllStateConfigs } from '../../config/stateConfig';
import StateListPanel from '../layers/StateListPanel';

/**
 * MapLibre National Map Component
 * Displays a globe view of the United States with wine-producing states
 * Uses MapLibre GL JS v4+ with globe projection and ESRI satellite basemap
 */
const MapLibreNationalMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const hoveredStateIdRef = useRef(null);
  const isTouchRef = useRef(false);
  const panelHoverHandlerRef = useRef(null);
  const [hoveredStateName, setHoveredStateName] = useState(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Draw diagonal hatch pattern on a canvas and return the format MapLibre expects
  const createHatchPattern = () => {
    const size = 12;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255, 184, 28, 0.35)'; // gold, low opacity
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 2, 0);
    ctx.lineTo(0, size * 2);
    ctx.stroke();
    // MapLibre addImage needs { width, height, data: Uint8ClampedArray }
    const imageData = ctx.getImageData(0, 0, size, size);
    return { width: size, height: size, data: imageData.data };
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with globe projection and Esri satellite basemap
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        projection: {
          type: 'globe'
        },
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 22
          }
        ],
        light: {
          anchor: 'map',
          position: [1.5, 90, 80],
          color: 'white',
          intensity: 0.4
        }
      },
      center: [-98, 39],
      zoom: isMobile ? 2.8 : 3.5,
      minZoom: 1.5,
      maxZoom: 18
    });

    mapRef.current = map;

    map.on('load', () => {
      // Register hatch pattern image for non-wine states
      const hatch = createHatchPattern();
      map.addImage('hatch-pattern', { width: hatch.width, height: hatch.height, data: hatch.data });

      // Add states source with generateId for feature-state
      map.addSource('us-states', {
        type: 'geojson',
        data: usStatesGeoJson,
        generateId: true
      });

      // Only highlight/allow clicks on states that have AVA data
      const wineStates = Object.values(getAllStateConfigs())
        .filter(cfg => cfg.avaFile)
        .map(cfg => cfg.name);

      // Non-wine states: hatch fill pattern
      map.addLayer({
        id: 'states-hatch',
        type: 'fill',
        source: 'us-states',
        paint: {
          'fill-pattern': 'hatch-pattern',
          'fill-opacity': 0.9
        },
        filter: ['!', ['in', ['get', 'name'], ['literal', wineStates]]]
      });

      // States fill layer — transparent click target only
      map.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'us-states',
        paint: {
          'fill-color': '#FFFFFF',
          'fill-opacity': 0
        }
      });

      // Wine states: faint warm tint — "frosted pane" over terrain
      map.addLayer({
        id: 'states-fill-tint',
        type: 'fill',
        source: 'us-states',
        paint: {
          'fill-color': '#FFB81C',
          'fill-opacity': 0.04
        },
        filter: ['in', ['get', 'name'], ['literal', wineStates]]
      });

      // States fill hover — warm accent tint on hovered wine state
      map.addLayer({
        id: 'states-fill-hover',
        type: 'fill',
        source: 'us-states',
        paint: {
          'fill-color': '#38bdf8',
          'fill-opacity': 0.08
        },
        filter: ['==', ['id'], -1]
      });

      // Non-wine state borders — dimmer, thinner
      map.addLayer({
        id: 'states-outline-inactive',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 0.5,
          'line-opacity': 0.2
        },
        filter: ['!', ['in', ['get', 'name'], ['literal', wineStates]]]
      });

      // Wine state borders — glow pass (wide, soft, low opacity)
      map.addLayer({
        id: 'states-outline-glow',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#FFD97A',
          'line-width': 8,
          'line-opacity': 0.12,
          'line-blur': 4
        },
        filter: ['in', ['get', 'name'], ['literal', wineStates]]
      });

      // Wine state borders — crisp warm ivory top line
      map.addLayer({
        id: 'states-outline',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#FFE8A0',
          'line-width': 1.2,
          'line-opacity': 0.75
        },
        filter: ['in', ['get', 'name'], ['literal', wineStates]]
      });

      // Hover glow pass — soft accent blue bloom
      map.addLayer({
        id: 'states-outline-hover-glow',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 10,
          'line-opacity': 0.2,
          'line-blur': 5
        },
        filter: ['==', ['id'], -1]
      });

      // Hover crisp line — accent blue on top
      map.addLayer({
        id: 'states-outline-hover',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-opacity': 0.95
        },
        filter: ['==', ['id'], -1]
      });

      // Detect touch device
      map.getCanvas().addEventListener('touchstart', () => { isTouchRef.current = true; }, { once: true });

      const clearHover = () => {
        map.setFilter('states-outline-hover', ['==', ['id'], -1]);
        map.setFilter('states-outline-hover-glow', ['==', ['id'], -1]);
        map.setFilter('states-fill-hover', ['==', ['id'], -1]);
        hoveredStateIdRef.current = null;
        map.getCanvas().style.cursor = '';
        setHoveredStateName(null);
      };

      // Hover interaction — pure setFilter, no feature-state
      map.on('mousemove', 'states-fill', (e) => {
        if (isTouchRef.current) return;
        if (e.features.length > 0) {
          const stateName = e.features[0].properties.name;
          const currentFeatureId = e.features[0].id;

          if (!wineStates.includes(stateName)) {
            if (hoveredStateIdRef.current !== null) clearHover();
            map.getCanvas().style.cursor = 'default';
            return;
          }

          if (hoveredStateIdRef.current !== currentFeatureId) {
            hoveredStateIdRef.current = currentFeatureId;
            map.setFilter('states-outline-hover', ['==', ['id'], currentFeatureId]);
            map.setFilter('states-outline-hover-glow', ['==', ['id'], currentFeatureId]);
            map.setFilter('states-fill-hover', ['==', ['id'], currentFeatureId]);
            setHoveredStateName(stateName);
          }
          map.getCanvas().style.cursor = 'pointer';
        } else {
          clearHover();
        }
      });

      map.on('mouseleave', 'states-fill', clearHover);

      // Register panel → map hover handler
      panelHoverHandlerRef.current = (stateName, isHovering) => {
        const feature = usStatesGeoJson.features.find(
          f => f.properties.name === stateName
        );
        if (!feature) return;
        // usStatesGeoJson features don't have stable ids until generateId assigns them
        // so we drive the filter by name instead
        if (isHovering) {
          map.setFilter('states-outline-hover', ['==', ['get', 'name'], stateName]);
          map.setFilter('states-outline-hover-glow', ['==', ['get', 'name'], stateName]);
          map.setFilter('states-fill-hover', ['==', ['get', 'name'], stateName]);
          setHoveredStateName(stateName);
        } else {
          map.setFilter('states-outline-hover', ['==', ['id'], -1]);
          map.setFilter('states-outline-hover-glow', ['==', ['id'], -1]);
          map.setFilter('states-fill-hover', ['==', ['id'], -1]);
          setHoveredStateName(null);
        }
      };

      // Touch: tap wine state → navigate directly; non-wine states do nothing
      map.on('click', 'states-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const stateName = feature.properties.name;

          if (!wineStates.includes(stateName)) {
            return;
          }

          if (!stateName) return;

          const stateSlug = stateName.toLowerCase().replace(/\s+/g, '-');
          const center = map.getCenter();
          const cameraPosition = {
            center: [center.lng, center.lat],
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
          };

          navigate(`/states/${stateSlug}`, {
            state: { fromNational: true, previousCamera: cameraPosition }
          });
        }
      });

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [navigate]);

  return (
    <>
      <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Hover name tooltip */}
      {hoveredStateName && (
        <div
          style={{
            position: 'absolute',
            ...(isMobile
              ? { bottom: '80px', left: '50%', transform: 'translateX(-50%)', top: 'auto' }
              : { top: '24px', left: '50%', transform: 'translateX(-50%)' }
            ),
            background: 'var(--glass-bg-medium)',
            backdropFilter: 'var(--glass-blur-light)',
            WebkitBackdropFilter: 'var(--glass-blur-light)',
            border: '1px solid var(--glass-border-hover)',
            color: 'var(--text-on-glass)',
            padding: isMobile ? '10px 20px' : '10px 24px',
            borderRadius: '12px',
            zIndex: 900,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            boxShadow: 'var(--glass-shadow-sm)',
            maxWidth: isMobile ? '90vw' : 'calc(100vw - 380px)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {hoveredStateName}
        </div>
      )}

      {/* State list panel — mirrors AVAListPanel on state page */}
      <StateListPanel
        onStateHover={(name, isHovering) => panelHoverHandlerRef.current?.(name, isHovering)}
      />
    </>
  );
};

export default MapLibreNationalMap;
