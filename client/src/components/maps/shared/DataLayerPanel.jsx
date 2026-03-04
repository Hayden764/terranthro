import { useState } from 'react';
import {
  MONTH_ABBR,
  MONTH_NAMES,
  CLIMATE_LAYER_TYPES
} from './climateConfig';
import {
  TOPO_LAYER_TYPES,
  hasTopographyData
} from './topographyConfig';

/**
 * DataLayerPanel Component
 * Unified collapsible panel where climate and topography layers share
 * a single radio selection — only one layer can be active at a time.
 *
 * @param {Object}   props
 * @param {string|null} props.activeLayer      - Active layer id (climate or topo) or null
 * @param {Function} props.onLayerChange       - Called with new layer id or null
 * @param {number}   props.currentMonth        - Current climate month (1-12)
 * @param {Function} props.onMonthChange       - Change climate month
 * @param {string}   props.avaSlug             - Current AVA slug
 */
const DataLayerPanel = ({
  activeLayer = null,
  onLayerChange,
  currentMonth = 1,
  onMonthChange,
  avaSlug = ''
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [climateExpanded, setClimateExpanded] = useState(true);
  const [topoExpanded, setTopoExpanded] = useState(true);

  const topoAvailable = hasTopographyData(avaSlug);

  // Determine if active layer is a climate or topo type
  const isClimateLayer = activeLayer && !!CLIMATE_LAYER_TYPES[activeLayer];
  const isTopoLayer = activeLayer && !!TOPO_LAYER_TYPES[activeLayer];
  const activeClimateConfig = isClimateLayer ? CLIMATE_LAYER_TYPES[activeLayer] : null;
  const activeTopoConfig = isTopoLayer ? TOPO_LAYER_TYPES[activeLayer] : null;

  // Toggle: clicking an already-active layer deselects it
  const handleSelect = (layerId) => {
    onLayerChange(activeLayer === layerId ? null : layerId);
  };

  // Shared radio button row renderer
  const RadioRow = ({ layer, disabled = false }) => {
    const isActive = activeLayer === layer.id;
    return (
      <div
        key={layer.id}
        onClick={() => !disabled && handleSelect(layer.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 8px',
          borderRadius: '6px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: isActive ? 'var(--accent-dim)' : 'transparent',
          border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
          opacity: disabled ? 0.45 : 1,
          transition: 'all 0.15s',
        }}
      >
        {/* Radio dot */}
        <div style={{
          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${isActive ? 'var(--accent)' : 'rgba(255,255,255,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.15s',
        }}>
          {isActive && (
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
          )}
        </div>
        {/* Label */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-on-glass)' }}>
            {layer.label}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)' }}>
            {layer.description}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
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
      transition: 'all 0.2s ease',
    }}>

      {/* ── Panel Header ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: isPanelOpen ? '1px solid var(--glass-border-light)' : 'none',
          cursor: 'pointer', userSelect: 'none',
        }}
        onClick={() => setIsPanelOpen(!isPanelOpen)}
      >
        <h3 style={{ margin: 0, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-on-glass)' }}>
          🗺️ Data Layers
        </h3>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isPanelOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isPanelOpen && (
        <div>

          {/* ══ CLIMATE SECTION ════════════════════════════════ */}
          <div style={{ borderBottom: '1px solid var(--glass-border-light)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setClimateExpanded(!climateExpanded)}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>🌡️ Climate (PRISM)</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: climateExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {climateExpanded && (
              <div style={{ padding: '0 14px 12px 14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.values(CLIMATE_LAYER_TYPES).map(layer => (
                    <RadioRow key={layer.id} layer={layer} />
                  ))}
                </div>

                {/* Month slider — only when a climate layer is active */}
                {isClimateLayer && (
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

          {/* ══ TOPOGRAPHY SECTION ═════════════════════════════ */}
          <div>
            <div
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setTopoExpanded(!topoExpanded)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-on-glass)' }}>⛰️ Topography</span>
                {!topoAvailable && (
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-dim)', padding: '1px 6px', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    No Data
                  </span>
                )}
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: topoExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}>
                <path d="M19 9l-7 7-7-7" />
              </svg>
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

                    {/* Topo legend */}
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
