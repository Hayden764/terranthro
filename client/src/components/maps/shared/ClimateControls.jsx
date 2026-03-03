import { useState } from 'react';
import { 
  MONTH_ABBR, 
  MONTH_NAMES,
  LEGEND_TEMPS,
  LEGEND_COLORS
} from './climateConfig';

/**
 * Climate Controls Component
 * UI controls for PRISM climate layer - month slider, toggle, and legend
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Whether climate layer is visible
 * @param {Function} props.onToggle - Callback when visibility toggled
 * @param {number} props.currentMonth - Current month (1-12)
 * @param {Function} props.onMonthChange - Callback when month changes
 */
const ClimateControls = ({
  isVisible = false,
  onToggle,
  currentMonth = 1,
  onMonthChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  // Convert Celsius to Fahrenheit
  const toFahrenheit = (celsius) => Math.round((celsius * 9/5) + 32);

  // Temperature values for legend
  const tempValues = [0, 10, 20, 30, 40]; // Celsius
  const displayTemps = isFahrenheit 
    ? tempValues.map(toFahrenheit) 
    : tempValues;

  return (
    <div style={{
      position: 'absolute',
      bottom: '16px',
      left: '16px',
      zIndex: 40,
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      boxShadow: 'var(--glass-shadow)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-on-glass)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, fontFamily: 'Montserrat, sans-serif' }}>
          Climate Data (PRISM)
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ background: 'none', border: 'none', color: 'var(--text-on-glass-muted)', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div style={{ padding: '12px 16px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Toggle Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-on-glass-muted)', fontFamily: 'Inter, sans-serif' }}>
              Show Temperature
            </span>
            <label style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => onToggle(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <div style={{
                width: '44px', height: '24px', borderRadius: '12px',
                background: isVisible ? 'var(--accent-medium)' : 'rgba(255,255,255,0.15)',
                border: isVisible ? '1px solid var(--accent-border)' : '1px solid var(--glass-border)',
                transition: 'all 0.2s ease', position: 'relative'
              }}>
                <div style={{
                  position: 'absolute', top: '2px',
                  left: isVisible ? '22px' : '2px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s ease'
                }} />
              </div>
            </label>
          </div>

          {/* Month Slider */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
              Month: <span style={{ color: 'var(--accent-text)', fontWeight: '700' }}>{MONTH_NAMES[currentMonth - 1]}</span>
            </label>
            <input
              type="range" min="1" max="12" step="1"
              value={currentMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              style={{
                width: '100%', height: '4px', borderRadius: '2px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', outline: 'none',
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.15) ${((currentMonth - 1) / 11) * 100}%, rgba(255,255,255,0.15) 100%)`
              }}
              disabled={!isVisible}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-on-glass-dim)', fontFamily: 'Inter, sans-serif' }}>
              <span>{MONTH_ABBR[0]}</span>
              <span>{MONTH_ABBR[3]}</span>
              <span>{MONTH_ABBR[6]}</span>
              <span>{MONTH_ABBR[9]}</span>
              <span>{MONTH_ABBR[11]}</span>
            </div>
          </div>

          {/* Legend */}
          {isVisible && (
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--glass-border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-on-glass-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>
                  Temperature
                </div>
                {/* °C / °F toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                  <button
                    onClick={() => setIsFahrenheit(false)}
                    style={{
                      padding: '2px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease',
                      background: !isFahrenheit ? 'var(--accent-medium)' : 'rgba(255,255,255,0.12)',
                      color: !isFahrenheit ? '#fff' : 'var(--text-on-glass-muted)',
                    }}
                  >°C</button>
                  <button
                    onClick={() => setIsFahrenheit(true)}
                    style={{
                      padding: '2px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '500', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease',
                      background: isFahrenheit ? 'var(--accent-medium)' : 'rgba(255,255,255,0.12)',
                      color: isFahrenheit ? '#fff' : 'var(--text-on-glass-muted)',
                    }}
                  >°F</button>
                </div>
              </div>
              <div style={{ width: '100%', height: '24px', borderRadius: '4px', marginBottom: '4px', background: 'linear-gradient(to right, #2813ED 0%, #13EDED 25%, #18B445 50%, #EDED13 75%, #ED1313 100%)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-on-glass-dim)', fontFamily: 'Inter, sans-serif' }}>
                {displayTemps.map((temp, idx) => (
                  <span key={idx}>{temp}°</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slider thumb CSS */}
      <style>{`
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
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 6px rgba(56,189,248,0.4);
        }
        input[type='range']:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ClimateControls;
