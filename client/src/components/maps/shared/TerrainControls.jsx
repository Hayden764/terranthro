import { useState, useEffect } from 'react';

/**
 * Terrain Controls Panel Component
 * Collapsible panel with zoom, reset, terrain, bearing, and pitch controls
 * 
 * @param {Object} props
 * @param {Function} props.onZoomIn - Callback to zoom in
 * @param {Function} props.onZoomOut - Callback to zoom out
 * @param {Function} props.onResetView - Callback to reset camera view
 * @param {Function} props.onToggleTerrain - Callback when 3D terrain is toggled
 * @param {Function} props.onBearingChange - Callback when camera bearing changes
 * @param {Function} props.onPitchChange - Callback when camera pitch changes
 * @param {boolean} props.terrainEnabled - Whether 3D terrain is enabled
 * @param {number} props.currentBearing - Current camera bearing angle (0-360°)
 * @param {number} props.currentPitch - Current camera pitch angle (0-85°)
 */
const TerrainControlsPanel = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleTerrain,
  onBearingChange,
  onPitchChange,
  terrainEnabled = true,
  currentBearing = 0,
  currentPitch = 60
}) => {
  // Initialize expanded state from localStorage or screen size
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('terrainControlsExpanded');
    if (stored !== null) return stored === 'true';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  // Persist expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('terrainControlsExpanded', isExpanded.toString());
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Convert bearing to cardinal direction
  const getCardinalDirection = (bearing) => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  };

  // Collapsed state - compact button
  if (!isExpanded) {
    return (
      <button
        onClick={toggleExpanded}
        style={{
          position: 'absolute',
          top: '80px',
          right: '16px',
          zIndex: 50,
          width: '48px',
          height: '48px',
          background: 'var(--glass-bg-medium)',
          backdropFilter: 'var(--glass-blur-light)',
          WebkitBackdropFilter: 'var(--glass-blur-light)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          boxShadow: 'var(--glass-shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        aria-label="Open terrain controls"
        aria-expanded="false"
      >
        <span className="text-xl" role="img" aria-label="Terrain">⛰️</span>
      </button>
    );
  }

  // Expanded state - full panel
  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        right: '16px',
        zIndex: 50,
        width: '256px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        boxShadow: 'var(--glass-shadow)',
        padding: '16px',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-on-glass)', letterSpacing: '0.05em', margin: 0, fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase' }}>
          Terrain Controls
        </h3>
        <button
          onClick={toggleExpanded}
          style={{ color: 'var(--text-on-glass-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', lineHeight: 1 }}
          aria-label="Collapse terrain controls"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Zoom Controls */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
          Zoom
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onZoomIn} aria-label="Zoom in"
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-bg-medium)', border: '1px solid var(--glass-border)', color: 'var(--text-on-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '500', boxShadow: 'var(--glass-shadow-sm)', transition: 'all 0.15s ease' }}
          >+</button>
          <button onClick={onZoomOut} aria-label="Zoom out"
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-bg-medium)', border: '1px solid var(--glass-border)', color: 'var(--text-on-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '500', boxShadow: 'var(--glass-shadow-sm)', transition: 'all 0.15s ease' }}
          >−</button>
          <button onClick={onResetView} aria-label="Reset view" title="Reset view"
            style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--glass-bg-medium)', border: '1px solid var(--glass-border)', color: 'var(--text-on-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: 'var(--glass-shadow-sm)', marginLeft: 'auto', transition: 'all 0.15s ease' }}
          >↻</button>
        </div>
      </div>

      {/* 3D Terrain Toggle */}
      <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <input
              type="checkbox"
              checked={terrainEnabled}
              onChange={(e) => onToggleTerrain(e.target.checked)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              aria-label="Toggle 3D terrain"
            />
            <div style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: terrainEnabled ? 'var(--accent-medium)' : 'rgba(255,255,255,0.15)',
              border: terrainEnabled ? '1px solid var(--accent-border)' : '1px solid var(--glass-border)',
              transition: 'all 0.2s ease', position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: '2px',
                left: terrainEnabled ? '22px' : '2px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.9)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                transition: 'left 0.2s ease'
              }} />
            </div>
          </div>
          <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-on-glass-muted)', fontFamily: 'Inter, sans-serif' }}>
            3D Terrain
          </span>
        </label>
      </div>

      {/* Camera Bearing Slider */}
      <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <label htmlFor="bearing-slider" style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
          Bearing: <span style={{ color: 'var(--accent-text)', fontWeight: '700' }}>{currentBearing}° ({getCardinalDirection(currentBearing)})</span>
        </label>
        <input
          id="bearing-slider"
          type="range" min="0" max="360" step="1"
          value={currentBearing}
          onChange={(e) => onBearingChange(Number(e.target.value))}
          className="glass-range-input"
          style={{
            width: '100%', height: '4px', borderRadius: '2px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', outline: 'none',
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(currentBearing / 360) * 100}%, rgba(255,255,255,0.15) ${(currentBearing / 360) * 100}%, rgba(255,255,255,0.15) 100%)`
          }}
          aria-label="Camera bearing angle"
        />
      </div>

      {/* Camera Pitch Slider */}
      {terrainEnabled && (
        <div style={{ transition: 'all 0.2s ease' }}>
          <label htmlFor="pitch-slider" style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
            Pitch: <span style={{ color: 'var(--accent-text)', fontWeight: '700' }}>{currentPitch}°</span>
          </label>
          <input
            id="pitch-slider"
            type="range" min="0" max="85" step="1"
            value={currentPitch}
            onChange={(e) => onPitchChange(Number(e.target.value))}
            style={{
              width: '100%', height: '4px', borderRadius: '2px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', outline: 'none',
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(currentPitch / 85) * 100}%, rgba(255,255,255,0.15) ${(currentPitch / 85) * 100}%, rgba(255,255,255,0.15) 100%)`
            }}
            aria-label="Camera pitch angle"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-on-glass-dim)', fontFamily: 'Inter, sans-serif' }}>
            <span>0°</span>
            <span>85°</span>
          </div>
        </div>
      )}

      {/* Slider thumb CSS */}
      <style>{`
        .glass-range-input::-webkit-slider-thumb,
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
        .glass-range-input::-moz-range-thumb,
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
      `}</style>
    </div>
  );
};

export default TerrainControlsPanel;
