import { useState, useEffect } from 'react';

/**
 * CameraControls
 * Standalone bearing + pitch sliders that talk directly to the MapLibre map
 * instance, bypassing React state during the drag so the slider never remounts.
 *
 * Strategy:
 *   • Local state drives the thumb position (instant visual feedback)
 *   • map.setBearing / map.setPitch are called on every onChange (live update)
 *   • Parent onBearingChange / onPitchChange are called ONLY on pointerUp
 *     so the parent re-render doesn't happen during the drag
 *   • useEffect syncs local state if parent resets values externally
 *     (e.g. Reset View button sets bearing+pitch back to 0)
 *
 * Props:
 *   map            {maplibregl.Map}  — live map instance
 *   bearing        {number}          — controlled value from parent (0-360)
 *   pitch          {number}          — controlled value from parent (0-85)
 *   terrainEnabled {boolean}         — pitch slider only shown when true
 *   onBearingChange {Function}       — (v) => void  called on release
 *   onPitchChange   {Function}       — (v) => void  called on release
 */
const CameraControls = ({
  map,
  bearing = 0,
  pitch = 0,
  terrainEnabled = false,
  onBearingChange,
  onPitchChange,
}) => {
  const [localBearing, setLocalBearing] = useState(bearing);
  const [localPitch,   setLocalPitch]   = useState(pitch);

  // Sync when parent resets externally (Reset View, terrain toggle off)
  useEffect(() => { setLocalBearing(bearing); }, [bearing]);
  useEffect(() => { setLocalPitch(pitch);     }, [pitch]);

  const DIRS = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  const cardinal = (b) => DIRS[Math.round(b / 22.5) % 16];

  // ── shared track style ────────────────────────────────────────
  const trackStyle = (pct) => ({
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
    outline: 'none',
    // no touchAction:none — let the browser handle touch scrolling normally;
    // pointer capture handles the mouse drag case cleanly
    background: `linear-gradient(to right,
      var(--accent) 0%,
      var(--accent) ${pct}%,
      rgba(255,255,255,0.15) ${pct}%,
      rgba(255,255,255,0.15) 100%)`,
  });

  const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-on-glass-label)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
    fontFamily: 'Inter, sans-serif',
  };

  const accentSpan = {
    color: 'var(--accent-text)',
    fontWeight: 700,
  };

  return (
    <div>
      {/* ── Bearing ── */}
      <div style={{
        marginBottom: terrainEnabled ? '14px' : 0,
        paddingBottom: terrainEnabled ? '14px' : 0,
        borderBottom: terrainEnabled ? '1px solid var(--glass-border-light)' : 'none',
      }}>
        <label style={labelStyle}>
          Bearing:{' '}
          <span style={accentSpan}>
            {localBearing}° ({cardinal(localBearing)})
          </span>
        </label>
        <input
          type="range"
          min="0" max="360" step="1"
          value={localBearing}
          onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalBearing(v);
            map?.setBearing(v);
          }}
          onPointerUp={(e) => {
            onBearingChange?.(Number(e.currentTarget.value));
          }}
          className="cc-slider"
          style={trackStyle((localBearing / 360) * 100)}
          aria-label="Camera bearing"
        />
      </div>

      {/* ── Pitch (only when 3D terrain is on) ── */}
      {terrainEnabled && (
        <div>
          <label style={labelStyle}>
            Pitch:{' '}
            <span style={accentSpan}>{localPitch}°</span>
          </label>
          <input
            type="range"
            min="0" max="85" step="1"
            value={localPitch}
            onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLocalPitch(v);
              map?.setPitch(v);
            }}
            onPointerUp={(e) => {
              onPitchChange?.(Number(e.currentTarget.value));
            }}
            className="cc-slider"
            style={trackStyle((localPitch / 85) * 100)}
            aria-label="Camera pitch"
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
            fontSize: '11px',
            color: 'var(--text-on-glass-dim)',
            fontFamily: 'Inter, sans-serif',
          }}>
            <span>0°</span>
            <span>85°</span>
          </div>
        </div>
      )}

      {/* Thumb styles — scoped to this component */}
      <style>{`
        .cc-slider::-webkit-slider-thumb {
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
        .cc-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
          border: none;
        }
      `}</style>
    </div>
  );
};

export default CameraControls;
