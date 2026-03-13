import { useState } from 'react';
import { CONTINUOUS_COLORMAPS } from './climateConfig';

/**
 * MobileDock
 * Bottom-center control bar for mobile AVA view.
 * Contains three icon buttons that expand their respective panels
 * as upward-sliding bottom sheets. Only one sheet open at a time.
 *
 * Props:
 *   toolkit    {ReactNode}  — full MapToolkit panel content (rendered inside sheet)
 *   dataLayer  {ReactNode}  — full DataLayerPanel content
 *   scale      {ReactNode}  — full ScalePanel content
 *   anyLayerVisible {boolean}
 *   colormap   {string}     — active colormap id (for swatch in dock icon)
 *   isClassified {boolean}
 */
const MobileDock = ({
  toolkit,
  dataLayer,
  scale,
  anyLayerVisible = false,
  colormap = 'plasma',
  isClassified = false,
}) => {
  // 'toolkit' | 'dataLayer' | 'scale' | null
  const [openSheet, setOpenSheet] = useState(null);

  const toggle = (id) => setOpenSheet(prev => prev === id ? null : id);
  const close  = () => setOpenSheet(null);

  // Colormap swatch for scale icon
  const activeCmap = CONTINUOUS_COLORMAPS.find(c => c.id === colormap) || CONTINUOUS_COLORMAPS[0];
  const swatchGradient = isClassified
    ? 'linear-gradient(to right, #3b82f6, #60a5fa, #86efac, #fde047, #fb923c, #ef4444, #b91c1c)'
    : activeCmap.gradient;

  const DOCK_H = 56; // px — height of the dock bar itself

  // Shared sheet wrapper styles
  const sheetStyle = (isOpen) => ({
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: DOCK_H,
    zIndex: 200,
    maxHeight: '65vh',
    overflowY: 'auto',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderTop: '1px solid var(--glass-border)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px rgba(0,0,0,0.45)',
    transform: isOpen ? 'translateY(0)' : 'translateY(110%)',
    transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
    pointerEvents: isOpen ? 'auto' : 'none',
    fontFamily: 'Inter, sans-serif',
    WebkitOverflowScrolling: 'touch',
  });

  const iconBtnStyle = (id) => ({
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    background: openSheet === id ? 'var(--accent-dim)' : 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '6px 4px',
    transition: 'background 0.15s',
    outline: 'none',
  });

  const labelStyle = (id) => ({
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    color: openSheet === id ? 'var(--accent-text)' : 'var(--text-on-glass-dim)',
    lineHeight: 1,
  });

  // Sheet header with title + close button
  const SheetHeader = ({ title, onClose }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px 10px',
      borderBottom: '1px solid var(--glass-border-light)',
      position: 'sticky', top: 0, zIndex: 1,
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.7px', color: 'var(--text-on-glass)',
      }}>
        {title}
      </span>
      <button
        onClick={onClose}
        style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-on-glass-dim)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}
        aria-label="Close"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  return (
    <>
      {/* ── Backdrop — tap outside to close ── */}
      {openSheet && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            zIndex: 190,
            background: 'rgba(0,0,0,0.25)',
          }}
        />
      )}

      {/* ── Toolkit sheet ── */}
      <div style={sheetStyle(openSheet === 'toolkit')}>
        <SheetHeader title="Map Toolkit" onClose={close} />
        <div style={{ padding: '0 0 8px' }}>
          {toolkit}
        </div>
      </div>

      {/* ── Data Layer sheet ── */}
      <div style={sheetStyle(openSheet === 'dataLayer')}>
        <SheetHeader title="Map Visualizations" onClose={close} />
        <div style={{ padding: '0 0 8px' }}>
          {dataLayer}
        </div>
      </div>

      {/* ── Scale sheet ── */}
      <div style={sheetStyle(openSheet === 'scale')}>
        <SheetHeader title="Scale" onClose={close} />
        <div style={{ padding: '0 0 8px' }}>
          {scale}
        </div>
      </div>

      {/* ── Dock bar ── */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: `${DOCK_H}px`,
        zIndex: 210,
        display: 'flex',
        alignItems: 'stretch',
        padding: '6px 24px',
        gap: '8px',
        background: 'var(--glass-bg-medium)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--glass-border)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      }}>

        {/* Map Toolkit button */}
        <button style={iconBtnStyle('toolkit')} onClick={() => toggle('toolkit')} aria-label="Map Toolkit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={openSheet === 'toolkit' ? 'var(--accent)' : 'var(--text-on-glass-dim)'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
          <span style={labelStyle('toolkit')}>View</span>
        </button>

        {/* Map Visualizations button */}
        <button style={iconBtnStyle('dataLayer')} onClick={() => toggle('dataLayer')} aria-label="Map Visualizations">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={openSheet === 'dataLayer' ? 'var(--accent)' : 'var(--text-on-glass-dim)'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span style={labelStyle('dataLayer')}>Layers</span>
        </button>

        {/* Scale button — shows live colormap swatch */}
        <button
          style={{
            ...iconBtnStyle('scale'),
            opacity: anyLayerVisible ? 1 : 0.35,
            pointerEvents: anyLayerVisible ? 'auto' : 'none',
          }}
          onClick={() => toggle('scale')}
          aria-label="Scale"
        >
          <div style={{
            width: '32px', height: '10px', borderRadius: '4px',
            background: swatchGradient,
            border: openSheet === 'scale'
              ? '1.5px solid var(--accent)'
              : '1px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
          }} />
          <span style={labelStyle('scale')}>Scale</span>
        </button>

      </div>
    </>
  );
};

export default MobileDock;
