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
        background: 'rgba(255, 254, 247, 0.96)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        fontFamily: 'Inter, sans-serif',
        maxWidth: '320px',
        minWidth: '290px',
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
          borderBottom: isPanelOpen ? '1px solid #e5e7eb' : 'none',
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
          color: '#2B2B2B'
        }}>
          🗺️ Data Layers
        </h3>
        <svg
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="#6b7280" strokeWidth="2"
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
          <div style={{ borderBottom: '1px solid #e5e7eb' }}>
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
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#2B2B2B' }}>
                🌡️ Climate (PRISM)
              </span>
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="#9ca3af" strokeWidth="2"
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
                  <span style={{ fontSize: '12px', color: '#4b5563' }}>Show Temperature</span>
                  <label style={{ position: 'relative', display: 'inline-block', width: '40px', height: '22px' }}>
                    <input
                      type="checkbox"
                      checked={climateVisible}
                      onChange={(e) => onClimateToggle(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                      background: climateVisible ? '#14b8a6' : '#d1d5db',
                      borderRadius: '11px', transition: 'background 0.2s'
                    }}>
                      <span style={{
                        position: 'absolute', height: '18px', width: '18px',
                        left: climateVisible ? '20px' : '2px', bottom: '2px',
                        background: '#fff', borderRadius: '50%',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </span>
                  </label>
                </div>

                {/* Month Slider */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                    Month: <span style={{ color: '#14b8a6', fontWeight: 600 }}>{MONTH_NAMES[currentMonth - 1]}</span>
                  </div>
                  <input
                    type="range" min="1" max="12" step="1"
                    value={currentMonth}
                    onChange={(e) => onMonthChange(Number(e.target.value))}
                    disabled={!climateVisible}
                    style={{
                      width: '100%', height: '6px', borderRadius: '3px', appearance: 'none',
                      background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((currentMonth - 1) / 11) * 100}%, #e5e7eb ${((currentMonth - 1) / 11) * 100}%, #e5e7eb 100%)`,
                      cursor: climateVisible ? 'pointer' : 'not-allowed',
                      opacity: climateVisible ? 1 : 0.4
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>
                    <span>{MONTH_ABBR[0]}</span>
                    <span>{MONTH_ABBR[3]}</span>
                    <span>{MONTH_ABBR[6]}</span>
                    <span>{MONTH_ABBR[9]}</span>
                    <span>{MONTH_ABBR[11]}</span>
                  </div>
                </div>

                {/* Climate Legend */}
                {climateVisible && (
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Temperature</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {['°C', '°F'].map(unit => (
                          <button
                            key={unit}
                            onClick={() => setIsFahrenheit(unit === '°F')}
                            style={{
                              padding: '1px 6px', borderRadius: '3px', border: 'none', cursor: 'pointer',
                              fontSize: '10px', fontWeight: 500,
                              background: (unit === '°F') === isFahrenheit ? '#14b8a6' : '#e5e7eb',
                              color: (unit === '°F') === isFahrenheit ? '#fff' : '#6b7280',
                              transition: 'all 0.15s'
                            }}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{
                      width: '100%', height: '12px', borderRadius: '2px',
                      background: 'linear-gradient(to right, #2813ED 0%, #13EDED 25%, #18B445 50%, #EDED13 75%, #ED1313 100%)'
                    }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
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
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#2B2B2B' }}>
                  ⛰️ Topography
                </span>
                {!topoAvailable && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    color: '#C41E3A',
                    background: 'rgba(196, 30, 58, 0.1)',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    No Data
                  </span>
                )}
              </div>
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="#9ca3af" strokeWidth="2"
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
                    background: 'rgba(196, 30, 58, 0.06)',
                    border: '1px solid rgba(196, 30, 58, 0.15)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '11px', color: '#C41E3A', fontWeight: 600, marginBottom: '4px' }}>
                      Topography data not available
                    </div>
                    <div style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.4' }}>
                      Slope, aspect, and elevation data has not yet been processed for this AVA. Check back soon!
                    </div>
                  </div>
                ) : (
                  /* ── Layer radio buttons ─────────────────────── */
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                            background: activeTopoLayer === layer.id ? 'rgba(107, 45, 92, 0.08)' : 'transparent',
                            border: activeTopoLayer === layer.id ? '1px solid rgba(107, 45, 92, 0.2)' : '1px solid transparent',
                            transition: 'all 0.15s'
                          }}
                          onClick={() => handleTopoChange(layer.id)}
                        >
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            border: `2px solid ${activeTopoLayer === layer.id ? '#6B2D5C' : '#d1d5db'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'border-color 0.15s', flexShrink: 0
                          }}>
                            {activeTopoLayer === layer.id && (
                              <div style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: '#6B2D5C'
                              }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#2B2B2B' }}>
                              {layer.label}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                              {layer.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Topography Legend */}
                    {activeTopoConfig && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                          {activeTopoConfig.label} ({activeTopoConfig.unit})
                        </div>
                        <div style={{
                          width: '100%', height: '12px', borderRadius: '2px',
                          background: `linear-gradient(to right, ${activeTopoConfig.legend.colors.join(', ')})`
                        }} />
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '10px',
                          color: '#6b7280',
                          marginTop: '2px'
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
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        input[type='range']::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        input[type='range']:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default DataLayerPanel;
