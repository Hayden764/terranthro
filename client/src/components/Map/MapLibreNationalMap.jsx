import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { feature } from 'topojson-client';
import usStatesTopo from '../../data/us-states-topo.json';
import { getConfiguredStateNames } from '../../config/stateConfig';

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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with globe projection
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
      // Convert TopoJSON to GeoJSON
      const statesGeoJSON = feature(usStatesTopo, usStatesTopo.objects.states);

      // Add states source with generateId for feature-state
      map.addSource('us-states', {
        type: 'geojson',
        data: statesGeoJSON,
        generateId: true
      });

      // Wine-producing states to highlight
      const wineStates = getConfiguredStateNames();

      // States fill layer with hover effect
      map.addLayer({
        id: 'states-fill',
        type: 'fill',
        source: 'us-states',
        paint: {
          'fill-color': '#FFFFFF',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            0.2,
            0
          ]
        }
      });

      // States outline layer
      map.addLayer({
        id: 'states-outline',
        type: 'line',
        source: 'us-states',
        paint: {
          'line-color': '#FFFFFF',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            1
          ],
          'line-opacity': 0.8
        }
      });

      // Hover interaction using feature-state
      map.on('mousemove', 'states-fill', (e) => {
        if (e.features.length > 0) {
          const stateName = e.features[0].properties.name;
          const currentFeatureId = e.features[0].id;
          
          // Only allow hover on wine states
          if (!wineStates.includes(stateName)) {
            // Clear any existing hover if moving to non-wine state
            if (hoveredStateIdRef.current !== null) {
              map.setFeatureState(
                { source: 'us-states', id: hoveredStateIdRef.current },
                { hover: false }
              );
              hoveredStateIdRef.current = null;
              map.getCanvas().style.cursor = '';
            }
            return;
          }

          // Clear previous hover if moving to a different state
          if (hoveredStateIdRef.current !== null && hoveredStateIdRef.current !== currentFeatureId) {
            map.setFeatureState(
              { source: 'us-states', id: hoveredStateIdRef.current },
              { hover: false }
            );
          }
          
          // Set new hover only if it's different from current
          if (hoveredStateIdRef.current !== currentFeatureId) {
            hoveredStateIdRef.current = currentFeatureId;
            map.setFeatureState(
              { source: 'us-states', id: hoveredStateIdRef.current },
              { hover: true }
            );
          }
          map.getCanvas().style.cursor = 'pointer';
        } else {
          // No features under cursor - clear hover
          if (hoveredStateIdRef.current !== null) {
            map.setFeatureState(
              { source: 'us-states', id: hoveredStateIdRef.current },
              { hover: false }
            );
            hoveredStateIdRef.current = null;
            map.getCanvas().style.cursor = '';
          }
        }
      });

      map.on('mouseleave', 'states-fill', () => {
        if (hoveredStateIdRef.current !== null) {
          map.setFeatureState(
            { source: 'us-states', id: hoveredStateIdRef.current },
            { hover: false }
          );
          hoveredStateIdRef.current = null;
        }
        map.getCanvas().style.cursor = '';
      });

      // Click to navigate to state page
      map.on('click', 'states-fill', (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          const stateName = feature.properties.name;
          
          // Only allow navigation for wine states
          if (!wineStates.includes(stateName)) {
            return;
          }
          
          if (!stateName) {
            console.error('State name is undefined! Available properties:', Object.keys(feature.properties));
            return;
          }
          
          const stateSlug = stateName.toLowerCase().replace(/\s+/g, '-');
          
          // Capture current camera position for smooth transition
          const center = map.getCenter();
          const cameraPosition = {
            center: [center.lng, center.lat],
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
          };
          
          // Navigate with camera state
          navigate(`/states/${stateSlug}`, {
            state: { 
              fromNational: true,
              previousCamera: cameraPosition 
            }
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
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0
      }} 
    />
  );
};

export default MapLibreNationalMap;
