import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../../styles/components/maplibre-viewer.css';

const MapLibreAVAViewer = ({ avaFeature }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
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
    if (!mapContainer.current) return;

    // Create MapLibre map with 3D terrain
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'terrain-rgb': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            encoding: 'terrarium',
            tileSize: 256,
            maxzoom: 15
          },
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite',
            type: 'raster',
            source: 'esri-satellite'
          }
        ],
        terrain: {
          source: 'terrain-rgb',
          exaggeration: 1.5
        }
      },
      center: [-123.0, 45.28], // Dundee Hills coordinates
      zoom: 13.5,
      pitch: 60, // Tilted 3D view
      bearing: -20, // Slight rotation
      antialias: true,
      hash: false
    });

    mapRef.current = map;

    // Hide default MapLibre controls
    map.addControl(new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: false
    }), 'top-right');

    // Smooth fly animation on load
    map.on('load', () => {
      // Use the passed avaFeature prop directly
      if (avaFeature) {
        console.log('Loading AVA boundary:', avaFeature.properties.name);
        
        // Add source
        map.addSource('ava-boundary', {
          type: 'geojson',
          data: avaFeature
        });
        
        // Add outline only (no fill)
        map.addLayer({
          id: 'ava-outline',
          type: 'line',
          source: 'ava-boundary',
          paint: {
            'line-color': '#FFFFFF',
            'line-width': 2
          }
        });

        // Calculate bounds from geometry
        const calculateBounds = (geometry) => {
          let minLng = Infinity, maxLng = -Infinity;
          let minLat = Infinity, maxLat = -Infinity;
          
          const processCoords = (coords) => {
            if (typeof coords[0] === 'number') {
              // This is a [lng, lat] pair
              minLng = Math.min(minLng, coords[0]);
              maxLng = Math.max(maxLng, coords[0]);
              minLat = Math.min(minLat, coords[1]);
              maxLat = Math.max(maxLat, coords[1]);
            } else {
              // Nested array, recurse
              coords.forEach(c => processCoords(c));
            }
          };
              
              processCoords(geometry.coordinates);
              return [[minLng, minLat], [maxLng, maxLat]];
            };

          
          const bounds = calculateBounds(avaFeature.geometry);
          
          // Fit camera to AVA bounds with 3D perspective - North view (looking south)
          map.fitBounds(bounds, {
            padding: 80,      // 80px padding around edges
            pitch: 45,        // 45° tilt for balanced 3D view
            bearing: 0,       // North view (looking south at AVA)
            duration: 2000,   // 2 second animation
            essential: true
          });
        } else {
          console.warn('No AVA feature provided');
        }
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [avaFeature]);

  return (
    <>
      <div 
        ref={mapContainer}
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
