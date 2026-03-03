import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { useMapContext } from '../../context/MapContext';
import usStatesGeoJson from "../../data/us-states.json";
import { getConfiguredStateNames, getAllStateConfigs } from '../../config/stateConfig';

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
  const [tooltip, setTooltip] = useState(null); // { x, y, text }

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
      zoom: 3.5,
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

      // States fill hover — subtle tint on hovered wine state
      map.addLayer({
        id: 'states-fill-hover',
        type: 'fill',
        source: 'us-states',
        paint: {
          'fill-color': '#FFFFFF',
          'fill-opacity': 0.15
        },
        filter: ['==', ['id'], -1]
      });      // Non-wine state borders — dimmer, thinner
      map.addLayer({
        id: 'states-outline-inactive',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 0.5,
          'line-opacity': 0.3
        },
        filter: ['!', ['in', ['get', 'name'], ['literal', wineStates]]]
      });

      // Wine state borders — brighter, slightly thicker at rest
      map.addLayer({
        id: 'states-outline',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 1.2,
          'line-opacity': 0.9
        },
        filter: ['in', ['get', 'name'], ['literal', wineStates]]
      });

      // Hover highlight layer — only the hovered state, always on top
      map.addLayer({
        id: 'states-outline-hover',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#7EC8E3',
          'line-width': 2.5,
          'line-opacity': 1
        },
        filter: ['==', ['id'], -1]
      });

      // Detect touch device
      map.getCanvas().addEventListener('touchstart', () => { isTouchRef.current = true; }, { once: true });

      const clearHover = () => {
        map.setFilter('states-outline-hover', ['==', ['id'], -1]);
        hoveredStateIdRef.current = null;
        map.getCanvas().style.cursor = '';
        setTooltip(null);
      };

      // Hover interaction — pure setFilter, no feature-state
      map.on('mousemove', 'states-fill', (e) => {
        if (isTouchRef.current) return;
        if (e.features.length > 0) {
          const stateName = e.features[0].properties.name;
          const currentFeatureId = e.features[0].id;

          if (!wineStates.includes(stateName)) {
            // Show "no data" tooltip for non-wine states
            if (hoveredStateIdRef.current !== null) clearHover();
            setTooltip({ x: e.point.x, y: e.point.y, text: 'No AVAs in this state' });
            map.getCanvas().style.cursor = 'default';
            return;
          }

          setTooltip(null);
          if (hoveredStateIdRef.current !== currentFeatureId) {
            hoveredStateIdRef.current = currentFeatureId;
            map.setFilter('states-outline-hover', ['==', ['id'], currentFeatureId]);
          }
          map.getCanvas().style.cursor = 'pointer';
        } else {
          clearHover();
        }
      });

      map.on('mouseleave', 'states-fill', clearHover);

      // Touch: tap wine state → navigate directly; tap non-wine → brief tooltip
      map.on('click', 'states-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const stateName = feature.properties.name;

          if (!wineStates.includes(stateName)) {
            if (isTouchRef.current) {
              setTooltip({ x: e.point.x, y: e.point.y, text: 'No AVAs in this state' });
              setTimeout(() => setTooltip(null), 2000);
            }
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
    <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0 }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 40}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.75)',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            letterSpacing: '0.03em',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 500,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default MapLibreNationalMap;
