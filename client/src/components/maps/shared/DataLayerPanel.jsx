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

/**
 * DataLayerPanel
 * Unified collapsible panel — single radio selection across all sections.
 *
 * Climate section has two sub-groups:
 *   • PRISM Normals  — month slider
 *   • Indices        — year dropdown
 *
 * @param {string|null} activeLayer    - active layer id or null
 * @param {Function}    onLayerChange  - (id | null) => void
 * @param {number}      currentMonth   - 1-12
 * @param {Function}    onMonthChange
 * @param {number}      activeYear     - vintage year for indices
 * @param {Function}    onYearChange
 * @param {string}      avaSlug
 */
const DataLayerPanel = ({
  activeLayer = null,
  onLayerChange,
  currentMonth = 1,
  onMonthChange,
  activeYear = 2025,
  onYearChange,
  avaSlug = '',
}) => {
  const [isPanelOpen,      setIsPanelOpen]      = useState(true);
  const [climateExpanded,  setClimateExpanded]  = useState(true);
  const [indicesExpanded,  setIndicesExpanded]  = useState(true);
  const [topoExpanded,     setTopoExpanded]     = useState(true);

  const topoAvailable      = hasTopographyData(avaSlug);
  const isPrismLayer       = activeLayer && !!CLIMATE_LAYER_TYPES[activeLayer];
  const isIndexLayer       = activeLayer && !!INDEX_LAYER_TYPES[activeLayer];
  const isTopoLayer        = activeLayer && !!TOPO_LAYER_TYPES[activeLayer];
  const activeTopoConfig   = isTopoLayer ? TOPO_LAYER_TYPES[activeLayer] : null;

  const handleSelect = (layer) => {
    if (!layer.available) return;
    onLayerChange(activeLayer === layer.id ? null : layer.id);
  };

  // ── Shared radio row ─────────────────────────────────────────
  const RadioRow = ({ layer }) => {
    const isActive    = activeLayer === layer.id;
    const unavailable = !layer.available;
    return (
      <div
        onClick={() => handleSelect(layer)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 8px', borderRadius: '6px',
          cursor: unavailable ? 'not-allowed' : 'pointer',
          background: isActive ? 'var(--accent-dim)' : 'transparent',
          border:     isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
          opacity:    unavailable ? 0.45 : 1,
          transition: 'all 0.15s',
        }}
      >
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}>
          {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-on-glass)' }}>{layer.label}</span>
            {unavailable && (
              <span style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase',
                padding: '1px 5px', borderRadius: '6px',
                background: 'rgba(255,255,255,0.08)', color: 'var(--text-on-glass-dim)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>Soon</span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)' }}>{layer.description}</div>
        </div>
      </div>
    );
  };

  // ── Section chevron ──────────────────────────────────────────
  const Chevron = ({ open }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="var(--text-on-glass-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div style={{
      position: 'absolute', bottom: '16px', left: '16px', zIndex: 40,
      background: 'var(--glass-bg-medium)',
      backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)', borderRadius: '12px',
      boxShadow: 'var(--glass-shadow)', fontFamily: 'Inter, sans-serif',
      maxWidth: '300px', minWidth: '270px', overflow: 'hidden', transition: 'all 0.2s ease',
    }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', cursor: 'pointer', userSelect: 'none',
          borderBottom: isPanelOpen ? '1px solid var(--glass-border-light)' : 'none',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-on-glass)' }}>
          🗺️ Data Layers
        </h3>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-on-glass-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isPanelOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isPanelOpen && (
        <div>
          {/* ══ CLIMATE — PRISM NORMALS ════════════════════════ */}
          <div style={{ borderBottom: '1px solid var(--glass-border-light)' }}>
            <div
              onClick={() => setClimateExpanded(!climateExpanded)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>🌡️ Climate Normals</span>
              <Chevron open={climateExpanded} />
            </div>

            {climateExpanded && (
              <div style={{ padding: '0 14px 12px 14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.values(CLIMATE_LAYER_TYPES).map(layer => (
                    <RadioRow key={layer.id} layer={layer} />
                  ))}
                </div>

                {/* Month slider — PRISM layers only */}
                {isPrismLayer && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--glass-border-light)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-on-glass-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                      Month: <span style={{ color: 'var(--accent-text)', fontWeight: 700 }}>{MONTH_NAMES[currentMonth - 1]}</span>
                    </div>
                    <input
                      type="range" min="1" max="12" step="1"
                      value={currentMonth}
                      onChange={(e) => onMonthChange(Number(e.target.value))}
                      className="data-layer-range"
                      style={{
                        width: '100%', height: '4px', borderRadius: '2px',
                        appearance: 'none', WebkitAppearance: 'none', outline: 'none',
                        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.15) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.15) 100%)`,
                        cursor: 'pointer',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '4px' }}>
                      <span>{MONTH_ABBR[0]}</span><span>{MONTH_ABBR[3]}</span>
                      <span>{MONTH_ABBR[6]}</span><span>{MONTH_ABBR[9]}</span>
                      <span>{MONTH_ABBR[11]}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══ CLIMATE — GROWING SEASON INDICES ══════════════ */}
          <div style={{ borderBottom: '1px solid var(--glass-border-light)' }}>
            <div
              onClick={() => setIndicesExpanded(!indicesExpanded)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>🌱 Indices</span>
              <Chevron open={indicesExpanded} />
            </div>

            {indicesExpanded && (
              <div style={{ padding: '0 14px 12px 14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.values(INDEX_LAYER_TYPES).map(layer => (
                    <RadioRow key={layer.id} layer={layer} />
                  ))}
                </div>

                {/* Year dropdown — index layers only */}
                {isIndexLayer && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--glass-border-light)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-on-glass-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                      Vintage Year
                    </div>
                    <select
                      value={activeYear}
                      onChange={(e) => onYearChange(Number(e.target.value))}
                      style={{
                        width: '100%', padding: '5px 8px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-on-glass)', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', outline: 'none', appearance: 'none',
                        WebkitAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        paddingRight: '28px',
                      }}
                    >
                      {INDEX_YEARS.map(y => (
                        <option key={y} value={y} style={{ background: '#1a1a2e', color: '#fff' }}>{y}</option>
                      ))}
                    </select>
                    <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '4px' }}>
                      Growing season Apr–Oct
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ══ TOPOGRAPHY ════════════════════════════════════ */}
          <div>
            <div
              onClick={() => setTopoExpanded(!topoExpanded)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>⛰️ Topography</span>
                {!topoAvailable && (
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-dim)', padding: '1px 6px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    No Data
                  </span>
                )}
              </div>
              <Chevron open={topoExpanded} />
            </div>

            {topoExpanded && (
              <div style={{ padding: '0 14px 12px 14px' }}>
                {!topoAvailable ? (
                  <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: '6px', padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-text)', fontWeight: 600, marginBottom: '4px' }}>Topography data not available</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', lineHeight: '1.4' }}>Slope, aspect, and elevation data has not yet been processed for this AVA.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.values(TOPO_LAYER_TYPES).map(layer => (
                        <RadioRow key={layer.id} layer={layer} />
                      ))}
                    </div>
                    {activeTopoConfig && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--glass-border-light)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
                          {activeTopoConfig.label} ({activeTopoConfig.unit})
                        </div>
                        <div style={{ width: '100%', height: '14px', borderRadius: '3px', background: `linear-gradient(to right, ${activeTopoConfig.legend.colors.join(', ')})` }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '3px' }}>
                          {activeTopoConfig.legend.labels.map((label, i) => <span key={i}>{label}</span>)}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .data-layer-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--accent); cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
        .data-layer-range::-moz-range-thumb {
          width: 16px; height: 16px; border-radius: 50%;
          background: var(--accent); cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
      `}</style>
    </div>
  );
};

export default DataLayerPanel;
