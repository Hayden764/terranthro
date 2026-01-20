import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../../styles/components/maplibre-viewer.css';

/**
 * MapLibre AVA Viewer Component
 * Displays a single AVA with 3D terrain
 * Uses MapLibre GL JS with ESRI satellite basemap and terrain
 * Supports camera transitions from state map
 */
const MapLibreAVAViewer = ({ avaData, avaName }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const location = useLocation();
  const [activeView, setActiveView] = useState('N');
  const [isMobileViewMenuOpen, setIsMobileViewMenuOpen] = useState(false);

  // Cardinal direction view presets
  const viewPresets = {
    N: { bearing: 0, label: 'N', description: 'North' },
    E: { bearing: 90, label: 'E', description: 'East' },
    S: { bearing: 180, label: 'S', description: 'South' },
    W: { bearing: 270, label: 'W', description: 'West' }
  };

  // Handle view change - preserves user's custom pitch
  const changeView = (direction) => {
    if (!mapRef.current) return;
    
    const preset = viewPresets[direction];
    const currentPitch = mapRef.current.getPitch(); // Preserve user's current pitch
    
    mapRef.current.easeTo({
      bearing: preset.bearing,
      pitch: currentPitch, // Keep existing pitch
      duration: 1000
    });
    
    setActiveView(direction);
    setIsMobileViewMenuOpen(false); // Close mobile menu after selection
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Get previous camera from navigation state
    const previousCamera = location.state?.previousCamera;

    // Calculate AVA bounds if data available
    let avaBounds = null;
    let avaCenter = [-120.5, 44];
    
    if (avaData && avaData.features && avaData.features.length > 0) {
      const feature = avaData.features[0];
      const coords = [];
      
      const extractCoords = (geometry) => {
        if (geometry.type === 'Polygon') {
          geometry.coordinates[0].forEach(coord => coords.push(coord));
        } else if (geometry.type === 'MultiPolygon') {
          geometry.coordinates.forEach(polygon => {
            polygon[0].forEach(coord => coords.push(coord));
          });
        }
      };
      
      extractCoords(feature.geometry);
      
      if (coords.length > 0) {
        const lngs = coords.map(c => c[0]);
        const lats = coords.map(c => c[1]);
        avaBounds = [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)]
        ];
        avaCenter = [
          (avaBounds[0][0] + avaBounds[1][0]) / 2,
          (avaBounds[0][1] + avaBounds[1][1]) / 2
        ];
      }
    }

    // Determine initial camera
    const initialCenter = previousCamera?.center || avaCenter;
    const initialZoom = previousCamera?.zoom || 8;
    const initialPitch = previousCamera?.pitch || 0;

    // Initialize map with terrain
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
          },
          'terrain-source': {
            type: 'raster-dem',
            tiles: [
              'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            encoding: 'terrarium'
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
        terrain: {
          source: 'terrain-source',
          exaggeration: 1.5
        },
        sky: {
          'sky-color': '#87CEEB',
          'horizon-color': '#f0f8ff',
          'fog-color': '#f0f8ff'
        }
      },
      center: initialCenter,
      zoom: initialZoom,
      pitch: initialPitch,
      bearing: previousCamera?.bearing || 0,
      minZoom: 6,
      maxZoom: 18,
      maxPitch: 85
    });

    mapRef.current = map;

    map.on('load', () => {
      // Animate to AVA if we have previous camera
      if (previousCamera && avaBounds) {
        setTimeout(() => {
          map.flyTo({
            center: avaCenter,
            zoom: 10,
            pitch: 60,
            bearing: -20,
            duration: 2000,
            essential: true
          });
        }, 100);
      } else if (!previousCamera) {
        // Direct URL access - start high and zoom down
        map.flyTo({
          center: avaCenter,
          zoom: 10,
          pitch: 60,
          bearing: -20,
          duration: 1500,
          essential: true
        });
      }

      // Add AVA boundary if data available
      if (avaData && avaData.features && avaData.features.length > 0) {
        map.addSource('ava-boundary', {
          type: 'geojson',
          data: avaData
        });

        // AVA fill
        map.addLayer({
          id: 'ava-fill',
          type: 'fill',
          source: 'ava-boundary',
          paint: {
            'fill-color': '#C41E3A',
            'fill-opacity': 0.15
          }
        });

        // AVA outline
        map.addLayer({
          id: 'ava-outline',
          type: 'line',
          source: 'ava-boundary',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 3,
            'line-opacity': 0.9
          }
        });
      }

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add terrain control
      map.addControl(
        new maplibregl.TerrainControl({
          source: 'terrain-source',
          exaggeration: 1.5
        }),
        'top-right'
      );
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [avaData, avaName, location.state]);

  return (
    <>
      <div 
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Desktop View Controls - Hidden on mobile */}
      <div className="view-controls-desktop">
        <div style={{
          fontSize: 'var(--text-xs)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-wider)',
          color: 'var(--text-gray)',
          display: 'flex',
          alignItems: 'center',
          paddingRight: '8px',
          borderRight: '1px solid var(--border-gray)'
        }}>
          View
        </div>
        {Object.entries(viewPresets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => changeView(key)}
            style={{
              background: activeView === key 
                ? 'var(--primary-burgundy)' 
                : 'transparent',
              border: '1px solid',
              borderColor: activeView === key ? 'var(--primary-burgundy)' : 'var(--border-gray)',
              borderRadius: '4px',
              padding: '8px 12px',
              color: activeView === key ? 'white' : 'var(--text-charcoal)',
              fontFamily: 'var(--font-primary)',
              fontSize: 'var(--text-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '36px'
            }}
            onMouseEnter={(e) => {
              if (activeView !== key) {
                e.target.style.background = 'var(--base-cream)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeView !== key) {
                e.target.style.background = 'transparent';
              }
            }}
            title={`View from ${preset.description}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Mobile View Controls - Icon Button */}
      <button 
        className="view-controls-mobile-button"
        onClick={() => setIsMobileViewMenuOpen(!isMobileViewMenuOpen)}
        aria-label="Change view direction"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 19 9 12 16 5 9" />
          <line x1="12" y1="16" x2="12" y2="22" />
        </svg>
      </button>

      {/* Mobile View Menu Popup */}
      {isMobileViewMenuOpen && (
        <>
          <div 
            className="view-mobile-backdrop"
            onClick={() => setIsMobileViewMenuOpen(false)}
          />
          <div className="view-mobile-menu">
            <div className="view-mobile-menu-title">Select View</div>
            {Object.entries(viewPresets).map(([key, preset]) => (
              <button
                key={key}
                className={`view-mobile-menu-item ${activeView === key ? 'active' : ''}`}
                onClick={() => changeView(key)}
              >
                <span className="view-mobile-menu-icon">{preset.label}</span>
                <span className="view-mobile-menu-label">{preset.description}</span>
                {activeView === key && <span className="view-mobile-menu-check">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default MapLibreAVAViewer;
