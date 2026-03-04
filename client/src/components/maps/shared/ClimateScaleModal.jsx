import { useState } from 'react';

/**
 * ClimateScaleModal
 * Floating glass panel anchored bottom-right showing the active climate
 * layer's color scale with an "Auto Adjust" button that fetches
 * viewport-percentile-based rescale bounds from Titiler.
 *
 * When climateVisible is false the panel is present but dimmed +
 * non-interactive (collapsed to header only).
 *
 * @param {boolean}  climateVisible  - Whether the climate layer is on
 * @param {string}   layerLabel      - Human-readable layer name e.g. "Temperature (PRISM)"
 * @param {number|null} displayMin   - Current rescale min value (null = not adjusted yet)
 * @param {number|null} displayMax   - Current rescale max value
 * @param {boolean}  isLoading       - True while stats fetch is in flight
 * @param {string|null} error        - Error message if stats fetch failed
 * @param {Function} onAutoAdjust    - Called when Auto Adjust button is clicked
 * @param {string}   unit            - Unit label e.g. "°C"
 */
const ClimateScaleModal = ({
  climateVisible = false,
  layerLabel = 'Temperature (PRISM)',
  displayMin = null,
  displayMax = null,
  isLoading = false,
  error = null,
  onAutoAdjust,
  unit = '°C',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const disabled = !climateVisible;

  // The plasma colormap used by Titiler — approximate CSS gradient
  const plasmaGradient =
    'linear-gradient(to right, #0d0887, #5302a3, #8b0aa5, #b83289, #db5c68, #f48849, #febc2a, #f0f921)';

  const hasRange = displayMin !== null && displayMax !== null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '52px',   // sits above MapLibre attribution bar
        right: '16px',
        zIndex: 40,
        width: '240px',
        background: 'var(--glass-bg-medium)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        boxShadow: 'var(--glass-shadow)',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        // Dimmed + non-interactive when layer is off
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: isExpanded ? '1px solid var(--glass-border-light)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsExpanded(p => !p)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Small plasma swatch */}
          <div style={{
            width: '18px', height: '10px', borderRadius: '3px',
            background: plasmaGradient,
            border: '1px solid var(--glass-border-light)',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: '11px', fontWeight: 700,
            color: 'var(--text-on-glass)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>
            {layerLabel}
          </span>
        </div>
        {/* Expand/collapse chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="var(--text-on-glass-dim)" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      {isExpanded && (
        <div style={{ padding: '10px 12px 12px' }}>

          {/* Color ramp bar */}
          <div style={{
            width: '100%', height: '14px', borderRadius: '4px',
            background: plasmaGradient,
            marginBottom: '4px',
          }} />

          {/* Range labels */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', color: 'var(--text-on-glass-dim)',
            marginBottom: '10px',
          }}>
            {hasRange ? (
              <>
                <span>{displayMin.toFixed(1)}{unit}</span>
                <span style={{ color: 'var(--text-on-glass-label)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  p2 – p98
                </span>
                <span>{displayMax.toFixed(1)}{unit}</span>
              </>
            ) : (
              <>
                <span style={{ color: 'var(--text-on-glass-dim)', fontStyle: 'italic' }}>—</span>
                <span style={{ color: 'var(--text-on-glass-label)', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  global scale
                </span>
                <span style={{ color: 'var(--text-on-glass-dim)', fontStyle: 'italic' }}>—</span>
              </>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--glass-border-light)', marginBottom: '10px' }} />

          {/* Auto Adjust row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Auto Adjust button */}
            <button
              onClick={onAutoAdjust}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '6px 0',
                borderRadius: '8px',
                border: '1px solid var(--accent-border)',
                background: isLoading ? 'var(--accent-dim)' : 'var(--accent-medium)',
                color: 'var(--accent-text)',
                fontSize: '11px', fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              {isLoading ? (
                <>
                  {/* Spinner */}
                  <svg
                    width="11" height="11" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'csm-spin 0.8s linear infinite', flexShrink: 0 }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Adjusting…
                </>
              ) : (
                <>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                  Auto Adjust
                </>
              )}
            </button>

            {/* Info tooltip button */}
            <button
              title="Auto Adjust calculates the color scale from the data visible in the current viewport using the 2nd and 98th percentiles (p2–p98)."
              style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg-medium)',
                color: 'var(--text-on-glass-muted)',
                fontSize: '12px', fontWeight: 700,
                cursor: 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'Georgia, serif',
              }}
            >
              ⓘ
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              marginTop: '8px', padding: '6px 8px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '6px',
              fontSize: '10px', color: '#fca5a5', lineHeight: '1.4',
            }}>
              ⚠ {error}
            </div>
          )}
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`
        @keyframes csm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ClimateScaleModal;
