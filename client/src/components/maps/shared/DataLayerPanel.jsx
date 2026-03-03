import { useState } from 'react';
import {
  MONTH_ABBR,
  MONTH_NAMES
} from './climateConfig';
import {
  TOPO_LAYER_TYPES,
  hasTopographyData
} from './topographyConfig';

/**
 * DataLayerPanel Component
 * Unified collapsible panel with Climate and Topography sections.
 * Shows "data not available" badges for AVAs without topography data.
 *
 * @param {Object} props
 * @param {boolean} props.climateVisible - Whether climate layer is on
 * @param {Function} props.onClimateToggle - Toggle climate visibility
 * @param {number} props.currentMonth - Current climate month (1-12)
 * @param {Function} props.onMonthChange - Change climate month
 * @param {string|null} props.activeTopoLayer - Active topography layer type or null
 * @param {Function} props.onTopoLayerChange - Change active topography layer
 * @param {string} props.avaSlug - Current AVA slug for data availability check
 */
const DataLayerPanel = ({
  climateVisible = false,
  onClimateToggle,
  currentMonth = 1,
  onMonthChange,
  activeTopoLayer = null,
  onTopoLayerChange,
  avaSlug = ''
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [climateExpanded, setClimateExpanded] = useState(true);
  const [topoExpanded, setTopoExpanded] = useState(true);
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  const topoAvailable = hasTopographyData(avaSlug);

  const toFahrenheit = (c) => Math.round((c * 9 / 5) + 32);
  const tempValues = [0, 10, 20, 30, 40];
  const displayTemps = isFahrenheit ? tempValues.map(toFahrenheit) : tempValues;

  // Handle topography layer radio toggle
  const handleTopoChange = (layerType) => {
    if (!topoAvailable) return;
    // Toggle off if already active, otherwise switch
    onTopoLayerChange(activeTopoLayer === layerType ? null : layerType);
  };

  // Active topo layer config for legend
  const activeTopoConfig = activeTopoLayer ? TOPO_LAYER_TYPES[activeTopoLayer] : null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 40,
        background: 'var(--glass-bg-medium)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        boxShadow: 'var(--glass-shadow)',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '300px',
        minWidth: '270px',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}
    >
      {/* ── Panel Header ──────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: isPanelOpen ? '1px solid var(--glass-border-light)' : 'none',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        <h3 style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--text-on-glass)'
        }}>
          🗺️ Data Layers
        </h3>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isPanelOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isPanelOpen && (
        <div style={{ padding: '0' }}>
          {/* ═══════════════════════════════════════════════════════
               CLIMATE SECTION
             ═══════════════════════════════════════════════════════ */}
          <div style={{ borderBottom: '1px solid var(--glass-border-light)' }}>
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => setClimateExpanded(!climateExpanded)}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>
                🌡️ Climate (PRISM)
              </span>
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: climateExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {climateExpanded && (
              <div style={{ padding: '0 14px 12px 14px' }}>
                {/* Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-on-glass-muted)' }}>Show Temperature</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={climateVisible}
                      onChange={(e) => onClimateToggle(e.target.checked)}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <div style={{
                      width: '44px', height: '24px', borderRadius: '12px',
                      background: climateVisible ? 'var(--accent-medium)' : 'rgba(255,255,255,0.15)',
                      border: climateVisible ? '1px solid var(--accent-border)' : '1px solid var(--glass-border)',
                      transition: 'all 0.2s ease', position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute', top: '2px',
                        left: climateVisible ? '22px' : '2px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        transition: 'left 0.2s ease'
                      }} />
                    </div>
                  </label>
                </div>

                {/* Month Slider */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-on-glass-label)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Month: <span style={{ color: 'var(--accent-text)', fontWeight: 700 }}>{MONTH_NAMES[currentMonth - 1]}</span>
                  </div>
                  <input
                    type="range" min="1" max="12" step="1"
                    value={currentMonth}
                    onChange={(e) => onMonthChange(Number(e.target.value))}
                    disabled={!climateVisible}
                    className="data-layer-range"
                    style={{
                      width: '100%', height: '4px', borderRadius: '2px', appearance: 'none', WebkitAppearance: 'none', outline: 'none',
                      background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.15) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.15) 100%)`,
                      cursor: climateVisible ? 'pointer' : 'not-allowed',
                      opacity: climateVisible ? 1 : 0.4
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '4px' }}>
                    <span>{MONTH_ABBR[0]}</span>
                    <span>{MONTH_ABBR[3]}</span>
                    <span>{MONTH_ABBR[6]}</span>
                    <span>{MONTH_ABBR[9]}</span>
                    <span>{MONTH_ABBR[11]}</span>
                  </div>
                </div>

                {/* Climate Legend */}
                {climateVisible && (
                  <div style={{ paddingTop: '8px', borderTop: '1px solid var(--glass-border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}>Temperature</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {['°C', '°F'].map(unit => (
                          <button
                            key={unit}
                            onClick={() => setIsFahrenheit(unit === '°F')}
                            style={{
                              padding: '2px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                              fontSize: '11px', fontWeight: 500, fontFamily: 'Inter, sans-serif',
                              background: (unit === '°F') === isFahrenheit ? 'var(--accent-medium)' : 'rgba(255,255,255,0.12)',
                              color: (unit === '°F') === isFahrenheit ? '#fff' : 'var(--text-on-glass-muted)',
                              transition: 'all 0.15s'
                            }}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      width: '100%', height: '14px', borderRadius: '3px',
                      background: 'linear-gradient(to right, #2813ED 0%, #13EDED 25%, #18B445 50%, #EDED13 75%, #ED1313 100%)'
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '3px' }}>
                      {displayTemps.map((t, i) => <span key={i}>{t}°</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
               TOPOGRAPHY SECTION
             ═══════════════════════════════════════════════════════ */}
          <div>
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => setTopoExpanded(!topoExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>
                  ⛰️ Topography
                </span>
                {!topoAvailable && (
                  <span style={{
                    fontSize: '9px', fontWeight: 600,
                    color: 'var(--accent-text)', background: 'var(--accent-dim)',
                    padding: '1px 6px', borderRadius: '8px',
                    textTransform: 'uppercase', letterSpacing: '0.3px'
                  }}>
                    No Data
                  </span>
                )}
              </div>
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: topoExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {topoExpanded && (
              <div style={{ padding: '0 14px 12px 14px' }}>
                {!topoAvailable ? (
                  /* ── No data message ─────────────────────────── */
                  <div style={{
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent-text)', fontWeight: 600, marginBottom: '4px' }}>
                      Topography data not available
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', lineHeight: '1.4' }}>
                      Slope, aspect, and elevation data has not yet been processed for this AVA. Check back soon!
                    </div>
                  </div>
                ) : (
                  /* ── Layer radio buttons ─────────────────────── */
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.values(TOPO_LAYER_TYPES).map((layer) => (
                        <label
                          key={layer.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            background: activeTopoLayer === layer.id ? 'var(--accent-dim)' : 'transparent',
                            border: activeTopoLayer === layer.id ? '1px solid var(--accent-border)' : '1px solid transparent',
                            transition: 'all 0.15s'
                          }}
                          onClick={() => handleTopoChange(layer.id)}
                        >
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: `2px solid ${activeTopoLayer === layer.id ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'border-color 0.15s', flexShrink: 0
                          }}>
                            {activeTopoLayer === layer.id && (
                              <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: 'var(--accent)'
                              }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-on-glass)' }}>
                              {layer.label}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)' }}>
                              {layer.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Topography Legend */}
                    {activeTopoConfig && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--glass-border-light)' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', marginBottom: '4px' }}>
                          {activeTopoConfig.label} ({activeTopoConfig.unit})
                        </div>
                        <div style={{
                          width: '100%', height: '14px', borderRadius: '3px',
                          background: `linear-gradient(to right, ${activeTopoConfig.legend.colors.join(', ')})`
                        }} />
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '3px'
                        }}>
                          {activeTopoConfig.legend.labels.map((label, i) => (
                            <span key={i}>{label}</span>
                          ))}
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

      {/* Custom range input styling */}
      <style>{`
        .data-layer-range::-webkit-slider-thumb {
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
        .data-layer-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
          border: none;
        }
        .data-layer-range:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DataLayerPanel;
