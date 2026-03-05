/**
 * ClimatePointModal
 * Glass card shown when the user pins a point with the Probe tool.
 * Anchored right side, below the MapToolkit panel.
 *
 * @param {boolean}     props.isOpen
 * @param {Function}    props.onClose
 * @param {number|null} props.value         - Raw pixel value
 * @param {string|null} props.valueLabel    - Class label for classified layers (e.g. "Region II")
 * @param {{ lng, lat}} props.coords
 * @param {string}      props.unit
 * @param {string}      props.label         - Layer label
 * @param {number}      props.currentMonth
 * @param {boolean}     props.isClassified
 */

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const ClimatePointModal = ({
  isOpen,
  onClose,
  value,
  valueLabel = null,
  coords,
  unit = '°C',
  label = 'Climate',
  currentMonth = 1,
  isClassified = false,
}) => {
  if (!isOpen || !coords) return null;

  const fmtCoord = (n, pos, neg) =>
    `${Math.abs(n).toFixed(4)}° ${n >= 0 ? pos : neg}`;

  // Display: classified shows label, continuous shows value+unit
  const displayValue = isClassified && valueLabel
    ? valueLabel
    : (value !== null && value !== undefined ? `${value}${unit}` : '—');

  const displayFontSize = isClassified && valueLabel ? '16px' : '32px';

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        right: '16px',
        marginTop: '8px',
        // Stack below MapToolkit — offset by toolkit height (~480px when expanded)
        // Use transform to shift down; toolkit is ~480px, we add gap
        transform: 'translateY(488px)',
        zIndex: 48,
        background: 'var(--glass-bg-medium)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        boxShadow: 'var(--glass-shadow)',
        fontFamily: 'Inter, sans-serif',
        width: '256px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px',
        borderBottom: '1px solid var(--glass-border-light)',
      }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-on-glass-dim)' }}>
            📍 Pinned Point
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-on-glass-dim)', marginTop: '2px' }}>
            {fmtCoord(coords.lat, 'N', 'S')} &nbsp; {fmtCoord(coords.lng, 'E', 'W')}
          </div>
        </div>
        <button onClick={onClose}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-on-glass-dim)', padding: '4px', borderRadius: '6px', lineHeight: 1, fontSize: '18px' }}
          aria-label="Close"
        >×</button>
      </div>

      {/* Value card */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--glass-border-light)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '5px' }}>
          {label}{!isClassified ? ` — ${MONTH_NAMES[currentMonth - 1]}` : ''}
        </div>
        <div style={{ fontSize: displayFontSize, fontWeight: 800, color: 'var(--accent-text)', letterSpacing: isClassified ? '-0.2px' : '-1px', lineHeight: 1.2 }}>
          {displayValue}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', marginTop: '4px' }}>
          {isClassified ? 'Classified raster · 2025 season' : 'PRISM 800m · 2020 normals'}
        </div>
      </div>

      {/* Monthly profile placeholder */}
      {!isClassified && (
        <div style={{ padding: '10px 12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-on-glass-dim)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>
            Monthly Profile
          </div>
          <div style={{
            height: '64px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px dashed rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)' }}>📊 Monthly chart coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimatePointModal;
