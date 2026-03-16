import { useState, useEffect } from 'react';
import CameraControls from './CameraControls';

const CARD = {
  background:   'rgba(255,255,255,0.07)',
  border:       '1px solid rgba(255,255,255,0.11)',
  borderRadius: '12px',
  boxShadow:    '0 1px 4px rgba(0,0,0,0.25)',
  padding:      '12px 14px',
};

const cardLbl = {
  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '1px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px',
};

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
  mobileSheetMode = false,
  map = null,
}) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('mapToolkitExpanded');
    if (stored !== null) return stored === 'true';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  useEffect(() => {
    localStorage.setItem('mapToolkitExpanded', isExpanded.toString());
  }, [isExpanded]);

  const handleToolClick = (id) => {
    const locked = (id === 'probe' || id === 'measure') && !anyLayerVisible;
    if (!locked) onToolChange?.(id);
  };

  const toolBtn = (id) => {
    const isActive = activeTool === id;
    const locked = (id === 'probe' || id === 'measure') && !anyLayerVisible;
    return {
      flex: 1, padding: '8px 0', borderRadius: '9px',
      border: isActive ? '1px solid rgba(56,189,248,0.45)' : '1px solid rgba(255,255,255,0.10)',
      background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
      color: isActive ? 'var(--accent-text)' : 'rgba(255,255,255,0.55)',
      cursor: locked ? 'not-allowed' : 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '4px', fontSize: '10px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.04em', transition: 'all 0.15s ease',
      opacity: locked ? 0.3 : 1, userSelect: 'none',
    };
  };

  const BodyContent = () => (
    <div style={{ overflowY: 'auto', flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* ── Tools card ─────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={cardLbl}>Tools</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={toolBtn('pan')} onClick={() => handleToolClick('pan')} title="Pan — drag to navigate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0m0 0v8M10 10V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6m12-3v4a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v-2" />
            </svg>
            Pan
          </button>
          <button style={toolBtn('probe')} onClick={() => handleToolClick('probe')} title={anyLayerVisible ? 'Probe — sample layer value' : 'Activate a layer to use Probe'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 13.5V20a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1.5" />
              <path d="M6 11.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7.5" />
              <path d="M10 11.5V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.5" />
              <path d="M14 11.5V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3" />
            </svg>
            Probe
          </button>
          <button style={toolBtn('measure')} onClick={() => handleToolClick('measure')} title={anyLayerVisible ? 'Measure — place waypoints' : 'Activate a layer to use Measure'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h20M2 12l4-4M2 12l4 4M22 12l-4-4M22 12l-4 4" />
              <line x1="8" y1="8" x2="8" y2="16" strokeWidth="1.5" />
              <line x1="12" y1="9" x2="12" y2="15" strokeWidth="1.5" />
              <line x1="16" y1="8" x2="16" y2="16" strokeWidth="1.5" />
            </svg>
            Measure
          </button>
        </div>

        {/* Measure readout */}
        {activeTool === 'measure' && anyLayerVisible && (
          <div style={{
            marginTop: '10px', padding: '9px 11px', borderRadius: '9px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
          }}>
            {measurePointCount < 2 ? (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Click map to place waypoints…</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Distance · {measurePointCount} pts</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-text)', letterSpacing: '-0.5px', marginTop: '2px' }}>{fmtKm?.(totalDistance) ?? '—'}</div>
                </div>
                <button onClick={onClearMeasure} style={{
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '7px', padding: '5px 10px', color: 'rgba(255,255,255,0.55)',
                  fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}>Clear</button>
              </div>
            )}
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>Dbl-click or Esc to reset</div>
          </div>
        )}
      </div>

      {/* ── View card ──────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={cardLbl}>View</div>

        {/* Zoom + Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          {[
            { label: '+', fn: onZoomIn,    title: 'Zoom in' },
            { label: '−', fn: onZoomOut,   title: 'Zoom out' },
            { label: '↻', fn: onResetView, title: 'Reset view', ml: true },
          ].map(({ label, fn, title, ml }) => (
            <button key={label} onClick={fn} title={title} style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '17px', fontWeight: 500, marginLeft: ml ? 'auto' : 0,
              transition: 'background 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* 3D Terrain toggle */}
        <div style={{ paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '12px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <input type="checkbox" checked={terrainEnabled} onChange={e => onToggleTerrain(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} aria-label="Toggle 3D terrain" />
              <div style={{
                width: '42px', height: '23px', borderRadius: '12px', position: 'relative',
                background: terrainEnabled ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.12)',
                border: terrainEnabled ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: '2px',
                  left: terrainEnabled ? '21px' : '2px',
                  width: '17px', height: '17px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: terrainEnabled ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>3D Terrain</span>
          </label>
        </div>

        {/* Bearing + pitch sliders */}
        <CameraControls
          map={map}
          bearing={currentBearing}
          pitch={currentPitch}
          terrainEnabled={terrainEnabled}
          onBearingChange={onBearingChange}
          onPitchChange={onPitchChange}
        />
      </div>

    </div>
  );

  // Mobile sheet
  if (mobileSheetMode) return <BodyContent />;

  // Collapsed pill
  if (!isExpanded) {
    return (
      <button onClick={() => setIsExpanded(true)} style={{
        position: 'absolute', top: '16px', right: '16px', zIndex: 50,
        width: '44px', height: '44px',
        background: 'rgba(14,14,18,0.75)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }} aria-label="Open map toolkit">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      </button>
    );
  }

  // Desktop expanded — minimal dark shell
  return (
    <div style={{
      position: 'absolute', top: '16px', right: '16px', zIndex: 50,
      width: '252px',
      background: 'rgba(14,14,18,0.75)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      fontFamily: 'Inter, sans-serif',
      maxHeight: 'calc(90vh - 16px - 300px)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.55)', fontFamily: 'Montserrat, sans-serif' }}>
          Map Toolkit
        </span>
        <button onClick={() => setIsExpanded(false)} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
          color: 'rgba(255,255,255,0.35)', lineHeight: 1,
        }} aria-label="Collapse">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <BodyContent />
    </div>
  );
};

export default MapToolkit;
