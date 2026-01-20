import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { feature } from 'topojson-client';
import usStatesTopo from '../../data/us-states-topo.json';

/**
 * MapLibre State Map Component
 * Displays a state with AVA boundaries using MapLibre GL JS
 */
const MapLibreStateMap = ({ stateConfig, avaData, onAVAHoverHandler }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapLoadedRef = useRef(false);
  const avaLayersAddedRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredAVAName, setHoveredAVAName] = useState(null);

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
      const statesGeoJSON = feature(usStatesTopo, usStatesTopo.objects.states);
      const stateFeature = statesGeoJSON.features.find(
        f => f.properties.name.toLowerCase() === stateConfig.name.toLowerCase()
      );
      
      if (stateFeature) {
        map.addSource('state-boundary', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [stateFeature] }
        });

        map.addLayer({
          id: 'state-boundary-line',
          type: 'line',
          source: 'state-boundary',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 2.5,
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

      map.addLayer({
        id: 'ava-fills',
        type: 'fill',
        source: 'avas',
        paint: {
          'fill-color': '#FFFFFF',
          'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.2, 0]
        }
      });

      map.addLayer({
        id: 'ava-outlines',
        type: 'line',
        source: 'avas',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2, 1],
          'line-opacity': 0.9
        }
      });

      let hoveredAVAId = null;

      map.on('mousemove', 'ava-fills', (e) => {
        if (e.features.length > 0) {
          const name = e.features[0].properties.name;
          const id = e.features[0].id;
          
          if (hoveredAVAId !== null && hoveredAVAId !== id) {
            map.setFeatureState({ source: 'avas', id: hoveredAVAId }, { hover: false });
          }
          
          hoveredAVAId = id;
          map.setFeatureState({ source: 'avas', id: id }, { hover: true });
          map.getCanvas().style.cursor = 'pointer';
          setHoveredAVAName(name);
        }
      });

      map.on('mouseleave', 'ava-fills', () => {
        if (hoveredAVAId !== null) {
          map.setFeatureState({ source: 'avas', id: hoveredAVAId }, { hover: false });
          hoveredAVAId = null;
        }
        map.getCanvas().style.cursor = '';
        setHoveredAVAName(null);
      });

      map.on('click', 'ava-fills', (e) => {
        if (e.features.length > 0) {
          const name = e.features[0].properties.name;
          if (name) {
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
            if (hoveredAVAId !== null && hoveredAVAId !== id) {
              map.setFeatureState({ source: 'avas', id: hoveredAVAId }, { hover: false });
            }
            hoveredAVAId = id;
            map.setFeatureState({ source: 'avas', id: id }, { hover: true });
            setHoveredAVAName(avaName);
          } else if (hoveredAVAId === id) {
            map.setFeatureState({ source: 'avas', id: id }, { hover: false });
            hoveredAVAId = null;
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
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 1000,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          {hoveredAVAName}
        </div>
      )}
    </>
  );
};

export default MapLibreStateMap;
