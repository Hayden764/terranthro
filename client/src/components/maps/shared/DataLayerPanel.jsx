import { useState } from 'react';
import {
  MONTH_ABBR,
  MONTH_NAMES,
  CLIMATE_LAYER_TYPES,
  INDEX_LAYER_TYPES,
  INDEX_YEARS,
} from './climateConfig';
import {
  TOPO_LAYER_TYPES,
  hasTopographyData,
} from './topographyConfig';

// ── Shared card token ─────────────────────────────────────────────────────────
const CARD = {
  background:   'rgba(255,255,255,0.07)',
  border:       '1px solid rgba(255,255,255,0.11)',
  borderRadius: '12px',
  boxShadow:    '0 1px 4px rgba(0,0,0,0.25)',
  padding:      '12px 14px',
};

/**
 * DataLayerPanel — "Map Visualizations"
 * mobileSheetMode=true  → bare content sections (MobileDock provides shell)
 * mobileSheetMode=false → full absolute floating panel (desktop)
 */
const DataLayerPanel = ({
  activeLayer = null,
  onLayerChange,
  currentMonth = 1,
  onMonthChange,
  activeYear = 2025,
  onYearChange,
  avaSlug = '',
  mobileSheetMode = false,
}) => {
  const [isPanelOpen,     setIsPanelOpen]     = useState(true);
  const [climateExpanded, setClimateExpanded] = useState(true);
  const [topoExpanded,    setTopoExpanded]    = useState(true);
  const [climateMode,     setClimateMode]     = useState('normals');

  const topoAvailable = hasTopographyData(avaSlug);
  const isPrismLayer  = activeLayer && !!CLIMATE_LAYER_TYPES[activeLayer];
  const isIndexLayer  = activeLayer && !!INDEX_LAYER_TYPES[activeLayer];

  const handleClimateMode = (mode) => {
    setClimateMode(mode);
    if (mode === 'normals'  && isIndexLayer) onLayerChange(null);
    if (mode === 'vintages' && isPrismLayer) onLayerChange(null);
  };

  const handleSelect = (layer) => {
    if (!layer.available) return;
    onLayerChange(activeLayer === layer.id ? null : layer.id);
  };

  const Chevron = ({ open }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );

  const RadioRow = ({ layer }) => {
    const isActive    = activeLayer === layer.id;
    const unavailable = !layer.available;
    return (
      <div onClick={() => handleSelect(layer)} style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '7px 10px', borderRadius: '8px',
        cursor: unavailable ? 'not-allowed' : 'pointer',
        background: isActive ? 'rgba(56,189,248,0.13)' : 'transparent',
        border:     isActive ? '1px solid rgba(56,189,248,0.30)' : '1px solid transparent',
        opacity:    unavailable ? 0.4 : 1,
        transition: 'all 0.15s',
      }}>
        <div style={{
          width: '15px', height: '15px', borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.28)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}>
          {isActive && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#ffffff' }}>{layer.label}</span>
            {unavailable && (
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase',
                padding: '1px 5px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.10)',
              }}>Soon</span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>{layer.description}</div>
        </div>
      </div>
    );
  };

  const rangeThumbCss = `
    .data-layer-range::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 15px; height: 15px; border-radius: 50%;
      background: var(--accent); cursor: pointer;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 6px rgba(56,189,248,0.4);
    }
    .data-layer-range::-moz-range-thumb {
      width: 15px; height: 15px; border-radius: 50%;
      background: var(--accent); cursor: pointer;
      border: 2px solid rgba(255,255,255,0.8);
      box-shadow: 0 2px 6px rgba(56,189,248,0.4);
    }
  `;

  const cardHeader = {
    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '1px', color: 'rgba(255,255,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    cursor: 'pointer', userSelect: 'none', marginBottom: '10px',
  };

  const Sections = () => (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

      {/* ── Climate card ─────────────────────────────────────── */}
      <div style={CARD}>
        <div style={cardHeader} onClick={() => setClimateExpanded(v => !v)}>
          <span>Climate</span>
          <Chevron open={climateExpanded} />
        </div>

        {climateExpanded && (
          <>
            {/* Mode pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              {['normals', 'vintages'].map(pill => {
                const isActive = climateMode === pill;
                return (
                  <button key={pill} onClick={() => handleClimateMode(pill)} style={{
                    flex: 1, padding: '5px 10px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.3px', cursor: 'pointer',
                    border: isActive ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.14)',
                    background: isActive ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? 'var(--accent-text)' : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.15s', outline: 'none',
                  }}>
                    {pill === 'normals' ? 'Normals' : 'Vintages'}
                  </button>
                );
              })}
            </div>

            {/* Normals layers */}
            {climateMode === 'normals' && (
              <>
                {/* Period badge — styled like an active year pill */}
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <button disabled style={{
                    padding: '3px 10px', borderRadius: '12px',
                    fontSize: '11px', fontWeight: 700, cursor: 'default',
                    border: '1px solid rgba(56,189,248,0.5)',
                    background: 'rgba(56,189,248,0.15)',
                    color: 'var(--accent-text)',
                    outline: 'none',
                  }}>1991 – 2020</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {Object.values(CLIMATE_LAYER_TYPES).map(layer => <RadioRow key={layer.id} layer={layer} />)}
                </div>
                {isPrismLayer && (
                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                      Month — <span style={{ color: 'var(--accent-text)' }}>{MONTH_NAMES[currentMonth - 1]}</span>
                    </div>
                    <input type="range" min="1" max="12" step="1"
                      value={currentMonth}
                      onChange={e => onMonthChange(Number(e.target.value))}
                      className="data-layer-range"
                      style={{
                        width: '100%', height: '4px', borderRadius: '2px',
                        appearance: 'none', WebkitAppearance: 'none', outline: 'none',
                        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.12) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.12) 100%)`,
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                      <span>{MONTH_ABBR[0]}</span><span>{MONTH_ABBR[3]}</span>
                      <span>{MONTH_ABBR[6]}</span><span>{MONTH_ABBR[9]}</span>
                      <span>{MONTH_ABBR[11]}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Vintages layers */}
            {climateMode === 'vintages' && (
              <>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {INDEX_YEARS.map(y => {
                    const ya = activeYear === y;
                    return (
                      <button key={y} onClick={() => onYearChange(y)} style={{
                        padding: '3px 10px', borderRadius: '12px',
                        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                        border: ya ? '1px solid rgba(56,189,248,0.5)' : '1px solid rgba(255,255,255,0.12)',
                        background: ya ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                        color: ya ? 'var(--accent-text)' : 'rgba(255,255,255,0.45)',
                        transition: 'all 0.15s', outline: 'none',
                      }}>{y}</button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {Object.values(INDEX_LAYER_TYPES).map(layer => <RadioRow key={layer.id} layer={layer} />)}
                </div>
                <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.4 }}>
                  Growing season Apr – Oct
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Topography card ──────────────────────────────────── */}
      <div style={CARD}>
        <div style={cardHeader} onClick={() => setTopoExpanded(v => !v)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Topography</span>
            {!topoAvailable && (
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
                padding: '1px 6px', borderRadius: '8px',
                background: 'rgba(56,189,248,0.10)', color: 'rgba(56,189,248,0.6)',
                border: '1px solid rgba(56,189,248,0.18)',
              }}>No Data</span>
            )}
          </div>
          <Chevron open={topoExpanded} />
        </div>

        {topoExpanded && (
          !topoAvailable ? (
            <div style={{
              padding: '10px 12px', borderRadius: '8px', textAlign: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: '4px' }}>
                Not yet available
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                Slope, aspect, and elevation data has not been processed for this AVA.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {Object.values(TOPO_LAYER_TYPES).map(layer => <RadioRow key={layer.id} layer={layer} />)}
            </div>
          )
        )}
      </div>

    </div>
  );

  // Mobile sheet mode — bare content
  if (mobileSheetMode) {
    return (
      <div style={{ fontFamily: 'Inter, sans-serif' }}>
        <Sections />
        <style>{rangeThumbCss}</style>
      </div>
    );
  }

  // Desktop — minimal dark shell so cards pop
  return (
    <div style={{
      position: 'absolute', bottom: '16px', left: '16px', zIndex: 40,
      background: 'rgba(14,14,18,0.75)',
      backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      fontFamily: 'Inter, sans-serif',
      maxWidth: '290px', minWidth: '260px',
      maxHeight: 'calc(100vh - 106px)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div onClick={() => setIsPanelOpen(v => !v)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', cursor: 'pointer', userSelect: 'none', flexShrink: 0,
        borderBottom: isPanelOpen ? '1px solid rgba(255,255,255,0.07)' : 'none',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.55)' }}>
          Map Visualizations
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isPanelOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isPanelOpen && (
        <div style={{ overflowY: 'auto', flex: 1, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.12) transparent' }}>
          <Sections />
        </div>
      )}
      <style>{rangeThumbCss}</style>
    </div>
  );
};

export default DataLayerPanel;
