/**
 * ClimateProbeTooltip
 * Floating tooltip that follows the cursor showing the live PRISM pixel value.
 * Only renders when a climate layer is active and the mouse is over the map.
 *
 * @param {Object}      props
 * @param {number|null} props.value       - Current pixel value (null = no data)
 * @param {{ x, y }}    props.screenPos   - Screen pixel position from MapLibre e.point
 * @param {string}      props.unit        - Unit string e.g. "°C" or "mm"
 * @param {string}      props.label       - Layer label e.g. "Mean Temperature"
 * @param {boolean}     props.isActive    - Whether to show at all
 */
const ClimateProbeTooltip = ({ value, screenPos, unit = '°C', label = '', isActive }) => {
  if (!isActive || !screenPos || value === null || value === undefined) return null;

  const OFFSET = 16; // px offset from cursor

  return (
    <div
      style={{
        position: 'absolute',
        left: screenPos.x + OFFSET,
        top: screenPos.y + OFFSET,
        zIndex: 60,
        pointerEvents: 'none',
        background: 'var(--glass-bg-medium)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: '8px',
        padding: '6px 10px',
        boxShadow: 'var(--glass-shadow)',
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '10px', color: 'var(--text-on-glass-dim)', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-text)', letterSpacing: '-0.3px' }}>
        {value}{unit}
      </div>
    </div>
  );
};

export default ClimateProbeTooltip;
