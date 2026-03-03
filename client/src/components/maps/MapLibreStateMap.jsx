import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import usStatesGeoJson from '../../data/us-states.json';

/**
 * MapLibre State Map Component
 * Displays a state with AVA boundaries using MapLibre GL JS
 */
const MapLibreStateMap = ({ stateConfig, avaData, onAVAHoverHandler }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const avaLayersAddedRef = useRef(false);
  const isTouchRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredAVAName, setHoveredAVAName] = useState(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // First effect: Initialize map (runs once)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const previousCamera = location.state?.previousCamera;
    const initialCenter = previousCamera?.center || stateConfig.center || [-98, 39];
    const initialZoom = previousCamera?.zoom || (stateConfig.zoom ? stateConfig.zoom - 0.5 : 4);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
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
        ]
      },
      center: initialCenter,
      zoom: initialZoom,
      minZoom: 1,
      maxZoom: 18
    });

    mapRef.current = map;

    map.on('load', () => {
      mapLoadedRef.current = true;

      // Add state boundary
      const statesGeoJSON = usStatesGeoJson;
      const stateFeature = statesGeoJSON.features.find(
        f => f.properties.name.toLowerCase() === stateConfig.name.toLowerCase()
      );
      
      if (stateFeature) {
        map.addSource('state-boundary', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [stateFeature] }
        });

        // State boundary — glow pass
        map.addLayer({
          id: 'state-boundary-glow',
          type: 'line',
          source: 'state-boundary',
          paint: {
            'line-color': '#FFD97A',
            'line-width': 12,
            'line-opacity': 0.12,
            'line-blur': 6
          }
        });

        // State boundary — crisp warm ivory line
        map.addLayer({
          id: 'state-boundary-line',
          type: 'line',
          source: 'state-boundary',
          paint: {
            'line-color': '#FFE8A0',
            'line-width': 2,
            'line-opacity': 0.6
          }
        });
      }

      // Animate to state if coming from national
      if (previousCamera) {
        setTimeout(() => {
          map.flyTo({
            center: stateConfig.center || [-98, 39],
            zoom: stateConfig.zoom ? stateConfig.zoom - 0.5 : 6,
            duration: 1500,
            essential: true
          });
        }, 100);
      }

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapLoadedRef.current = false;
        avaLayersAddedRef.current = false;
      }
    };
  }, []);

  // Second effect: Add AVA layers when data arrives
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !avaData?.features?.length) return;
    if (avaLayersAddedRef.current) return;

    const addAVALayers = () => {
      if (map.getSource('avas')) return;

      map.addSource('avas', {
        type: 'geojson',
        data: avaData,
        generateId: true
      });

      const avaFeaturesMap = new Map();
      avaData.features.forEach((feat, idx) => {
        if (feat.properties.name) {
          avaFeaturesMap.set(feat.properties.name, idx);
        }
      });

      // AVA fill — faint warm tint (frosted pane)
      map.addLayer({
        id: 'ava-fills',
        type: 'fill',
        source: 'avas',
        paint: {
          'fill-color': '#FFB81C',
          'fill-opacity': 0.04
        }
      });

      // AVA borders — glow pass (wide, soft, warm)
      map.addLayer({
        id: 'ava-outlines-glow',
        type: 'line',
        source: 'avas',
        paint: {
          'line-color': '#FFD97A',
          'line-width': 6,
          'line-opacity': 0.15,
          'line-blur': 3
        }
      });

      // AVA borders — crisp warm ivory line on top
      map.addLayer({
        id: 'ava-outlines',
        type: 'line',
        source: 'avas',
        paint: {
          'line-color': '#FFE8A0',
          'line-width': 1,
          'line-opacity': 0.8
        }
      });

      // Hover glow pass — soft accent blue bloom
      map.addLayer({
        id: 'ava-outlines-hover-glow',
        type: 'line',
        source: 'avas',
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
        id: 'ava-outlines-hover',
        type: 'line',
        source: 'avas',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2,
          'line-opacity': 0.95
        },
        filter: ['==', ['id'], -1]
      });

      let hoveredAVAId = null;

      // Detect touch device
      map.getCanvas().addEventListener('touchstart', () => { isTouchRef.current = true; }, { once: true });

      map.on('mousemove', 'ava-fills', (e) => {
        if (isTouchRef.current) return;
        if (e.features.length > 0) {
          const name = e.features[0].properties.name;
          const id = e.features[0].id;
          if (hoveredAVAId === id) return;
          hoveredAVAId = id;
          map.setFilter('ava-outlines-hover', ['==', ['id'], id]);
          map.setFilter('ava-outlines-hover-glow', ['==', ['id'], id]);
          map.getCanvas().style.cursor = 'pointer';
          setHoveredAVAName(name);
        }
      });

      map.on('mouseleave', 'ava-fills', () => {
        if (isTouchRef.current) return;
        hoveredAVAId = null;
        map.setFilter('ava-outlines-hover', ['==', ['id'], -1]);
        map.setFilter('ava-outlines-hover-glow', ['==', ['id'], -1]);
        map.getCanvas().style.cursor = '';
        setHoveredAVAName(null);
      });

      map.on('click', 'ava-fills', (e) => {
        if (e.features.length > 0) {
          const name = e.features[0].properties.name;
          const id = e.features[0].id;
          if (name) {
            // On touch: highlight briefly then navigate
            if (isTouchRef.current) {
              map.setFilter('ava-outlines-hover', ['==', ['id'], id]);
              map.setFilter('ava-outlines-hover-glow', ['==', ['id'], id]);
              setHoveredAVAName(name);
            }
            const avaSlug = name.toLowerCase().replace(/\s+/g, '-');
            const stateSlug = stateConfig.name.toLowerCase().replace(/\s+/g, '-');
            navigate(`/states/${stateSlug}/avas/${avaSlug}`);
          }
        }
      });

      // Handler for panel hover
      const handlePanelHover = (avaName, isHovering) => {
        const id = avaFeaturesMap.get(avaName);
        if (id !== undefined) {
          if (isHovering) {
            hoveredAVAId = id;
            map.setFilter('ava-outlines-hover', ['==', ['id'], id]);
            map.setFilter('ava-outlines-hover-glow', ['==', ['id'], id]);
            setHoveredAVAName(avaName);
          } else if (hoveredAVAId === id) {
            hoveredAVAId = null;
            map.setFilter('ava-outlines-hover', ['==', ['id'], -1]);
            map.setFilter('ava-outlines-hover-glow', ['==', ['id'], -1]);
            setHoveredAVAName(null);
          }
        }
      };

      if (onAVAHoverHandler) {
        onAVAHoverHandler(handlePanelHover);
      }

      avaLayersAddedRef.current = true;
    };

    if (mapLoadedRef.current) {
      addAVALayers();
    } else {
      map.on('load', addAVALayers);
    }
  }, [avaData, stateConfig, navigate, onAVAHoverHandler]);

  return (
    <>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100vh', position: 'relative' }} 
      />
      
      {hoveredAVAName && (
        <div
          style={{
            position: 'absolute',
            ...(isMobile
              ? { bottom: '80px', left: '50%', transform: 'translateX(-50%)', top: 'auto' }
              : { top: '20px', left: '50%', transform: 'translateX(-50%)' }
            ),
            background: 'var(--glass-bg-medium)',
            backdropFilter: 'var(--glass-blur-light)',
            WebkitBackdropFilter: 'var(--glass-blur-light)',
            border: '1px solid var(--glass-border-hover)',
            color: 'var(--text-on-glass)',
            padding: isMobile ? '10px 20px' : '12px 28px',
            borderRadius: '12px',
            zIndex: 1000,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: isMobile ? '13px' : '15px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            boxShadow: 'var(--glass-shadow-sm)',
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          {hoveredAVAName}
        </div>
      )}
    </>
  );
};

export default MapLibreStateMap;
