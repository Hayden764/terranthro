import { useState, useEffect } from 'react';

/**
 * MapToolkit
 * Top-right collapsible panel combining:
 *   • Tools — Pan / Probe / Measure (always shown; Probe+Measure blur when no layer active)
 *   • View  — Zoom, Reset, 3D Terrain, Bearing, Pitch
 *
 * @param {Function} props.onZoomIn
 * @param {Function} props.onZoomOut
 * @param {Function} props.onResetView
 * @param {Function} props.onToggleTerrain
 * @param {Function} props.onBearingChange
 * @param {Function} props.onPitchChange
 * @param {boolean}  props.terrainEnabled
 * @param {number}   props.currentBearing
 * @param {number}   props.currentPitch
 * @param {string}   props.activeTool       - 'pan' | 'probe' | 'measure'
 * @param {Function} props.onToolChange     - (tool: string) => void
 * @param {boolean}  props.anyLayerVisible  - Whether any data layer is on
 * @param {number|null}  props.totalDistance   - Measure result in km
 * @param {Function}     props.onClearMeasure  - Reset measure waypoints
 * @param {Function}     props.fmtKm           - km formatter
 * @param {number}       props.measurePointCount
 */
const MapToolkit = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleTerrain,
  onBearingChange,
  onPitchChange,
  terrainEnabled = true,
  currentBearing = 0,
  currentPitch = 60,
  activeTool = 'pan',
  onToolChange,
  anyLayerVisible = false,
  totalDistance = null,
  onClearMeasure,
  fmtKm,
  measurePointCount = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('mapToolkitExpanded');
    if (stored !== null) return stored === 'true';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  useEffect(() => {
    localStorage.setItem('mapToolkitExpanded', isExpanded.toString());
  }, [isExpanded]);

  const getCardinalDirection = (bearing) => {
    const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(bearing / 22.5) % 16];
  };

  // Tool button style factory
  const toolBtn = (id) => {
    const isActive = activeTool === id;
    const locked = (id === 'probe' || id === 'measure') && !anyLayerVisible;
    return {
      flex: 1,
      padding: '7px 0',
      borderRadius: '8px',
      border: isActive
        ? '1.5px solid var(--accent-border)'
        : '1px solid var(--glass-border)',
      background: isActive
        ? 'var(--accent-medium)'
        : 'var(--glass-bg-medium)',
      color: isActive ? 'var(--accent-text)' : 'var(--text-on-glass)',
      cursor: locked ? 'not-allowed' : 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '3px',
      fontSize: '10px',
      fontWeight: 600,
      fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.04em',
      transition: 'all 0.15s ease',
      opacity: locked ? 0.35 : 1,
      filter: locked ? 'blur(0.4px)' : 'none',
      userSelect: 'none',
    };
  };

  const handleToolClick = (id) => {
    const locked = (id === 'probe' || id === 'measure') && !anyLayerVisible;
    if (!locked) onToolChange?.(id);
  };

  // Collapsed — icon only
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'absolute', top: '80px', right: '16px', zIndex: 50,
          width: '48px', height: '48px',
          background: 'var(--glass-bg-medium)',
          backdropFilter: 'var(--glass-blur-light)',
          WebkitBackdropFilter: 'var(--glass-blur-light)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          boxShadow: 'var(--glass-shadow-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
        aria-label="Open map toolkit"
      >
        <span style={{ fontSize: '22px' }}>🗺️</span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute', top: '80px', right: '16px', zIndex: 50,
        width: '256px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        boxShadow: 'var(--glass-shadow)',
        fontFamily: 'Inter, sans-serif',
        // Cap height so toolkit never overlaps ScalePanel below it
        maxHeight: 'calc(100vh - 80px - 300px)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Panel header (pinned, never scrolls) ── */}
      <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-on-glass)', letterSpacing: '0.05em', margin: 0, fontFamily: 'Montserrat, sans-serif', textTransform: 'uppercase' }}>
          Map Toolkit
        </h3>
        <button onClick={() => setIsExpanded(false)}
          style={{ color: 'var(--text-on-glass-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', lineHeight: 1 }}
          aria-label="Collapse"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      </div>{/* end pinned header wrapper */}

      {/* ── Scrollable body ── */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 16px 16px' }}>

      {/* ── TOOLS section ── */}
      <div style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          Tools
        </div>

        {/* Tool row */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Pan */}
          <button style={toolBtn('pan')} onClick={() => handleToolClick('pan')} title="Pan — drag to navigate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0m0 0v8M10 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6m12-3v4a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v-2" />
            </svg>
            Pan
          </button>

          {/* Probe */}
          <button
            style={toolBtn('probe')}
            onClick={() => handleToolClick('probe')}
            title={anyLayerVisible ? 'Probe — click to sample layer value' : 'Activate a data layer to use Probe'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 13.5V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.5" />
              <path d="M6 11.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7.5" />
              <path d="M10 11.5V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.5" />
              <path d="M14 11.5V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3" />
            </svg>
            Probe
          </button>

          {/* Measure */}
          <button
            style={toolBtn('measure')}
            onClick={() => handleToolClick('measure')}
            title={anyLayerVisible ? 'Measure — click to place waypoints' : 'Activate a data layer to use Measure'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" />
              <line x1="8" y1="8" x2="8" y2="16" strokeWidth="1.5" />
              <line x1="12" y1="9" x2="12" y2="15" strokeWidth="1.5" />
              <line x1="16" y1="8" x2="16" y2="16" strokeWidth="1.5" />
            </svg>
            Measure
          </button>
        </div>

        {/* Measure HUD */}
        {activeTool === 'measure' && anyLayerVisible && (
          <div style={{
            marginTop: '10px', padding: '8px 10px',
            background: 'var(--glass-bg-light)',
            border: '1px solid var(--glass-border-light)',
            borderRadius: '8px',
          }}>
            {measurePointCount < 2 ? (
              <div style={{ fontSize: '11px', color: 'var(--text-on-glass-dim)', fontStyle: 'italic' }}>
                Click map to place waypoints…
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Distance · {measurePointCount} pts
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-text)', letterSpacing: '-0.5px', marginTop: '2px' }}>
                    {fmtKm?.(totalDistance) ?? '—'}
                  </div>
                </div>
                <button
                  onClick={onClearMeasure}
                  title="Clear waypoints"
                  style={{
                    background: 'var(--glass-bg-medium)', border: '1px solid var(--glass-border)',
                    borderRadius: '6px', padding: '5px 8px',
                    color: 'var(--text-on-glass-dim)', fontSize: '11px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Clear
                </button>
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '6px' }}>
              Dbl-click or Esc to reset
            </div>
          </div>
        )}
      </div>

      {/* ── VIEW section ── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
          View
        </div>
        {/* Zoom + Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          {[{label: '+', fn: onZoomIn, title: 'Zoom in'}, {label: '−', fn: onZoomOut, title: 'Zoom out'}, {label: '↻', fn: onResetView, title: 'Reset view', ml: true}].map(({label, fn, title, ml}) => (
            <button key={label} onClick={fn} title={title}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--glass-bg-medium)', border: '1px solid var(--glass-border)',
                color: 'var(--text-on-glass)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 500,
                boxShadow: 'var(--glass-shadow-sm)',
                marginLeft: ml ? 'auto' : 0,
              }}
            >{label}</button>
          ))}
        </div>

        {/* 3D Terrain toggle */}
        <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--glass-border-light)' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input type="checkbox" checked={terrainEnabled}
                onChange={(e) => onToggleTerrain(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                aria-label="Toggle 3D terrain"
              />
              <div style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: terrainEnabled ? 'var(--accent-medium)' : 'rgba(255,255,255,0.15)',
                border: terrainEnabled ? '1px solid var(--accent-border)' : '1px solid var(--glass-border)',
                transition: 'all 0.2s ease', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: '2px',
                  left: terrainEnabled ? '22px' : '2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s ease',
                }} />
              </div>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-on-glass-muted)' }}>
              3D Terrain
            </span>
          </label>
        </div>

        {/* Bearing */}
        <div style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--glass-border-light)' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Bearing: <span style={{ color: 'var(--accent-text)', fontWeight: 700 }}>{currentBearing}° ({getCardinalDirection(currentBearing)})</span>
          </label>
          <input type="range" min="0" max="360" step="1"
            value={currentBearing}
            onChange={(e) => onBearingChange(Number(e.target.value))}
            style={{
              width: '100%', height: '4px', borderRadius: '2px',
              appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', outline: 'none',
              background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(currentBearing/360)*100}%, rgba(255,255,255,0.15) ${(currentBearing/360)*100}%, rgba(255,255,255,0.15) 100%)`,
            }}
          />
        </div>

        {/* Pitch */}
        {terrainEnabled && (
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Pitch: <span style={{ color: 'var(--accent-text)', fontWeight: 700 }}>{currentPitch}°</span>
            </label>
            <input type="range" min="0" max="85" step="1"
              value={currentPitch}
              onChange={(e) => onPitchChange(Number(e.target.value))}
              style={{
                width: '100%', height: '4px', borderRadius: '2px',
                appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', outline: 'none',
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(currentPitch/85)*100}%, rgba(255,255,255,0.15) ${(currentPitch/85)*100}%, rgba(255,255,255,0.15) 100%)`,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-on-glass-dim)' }}>
              <span>0°</span><span>85°</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--accent); cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
        input[type='range']::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--accent); cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
      `}</style>
      </div>{/* end scrollable body */}
    </div>
  );
};

export default MapToolkit;
