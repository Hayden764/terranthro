import { useState } from 'react';
import { CONTINUOUS_COLORMAPS } from './climateConfig';
import InfoPanel from './InfoPanel';

/**
 * DesktopDock
 * Left-edge vertical icon strip for desktop AVA view.
 * Three buttons (View / Layers / Scale) each open a single centered
 * floating modal. No backdrop — map stays fully interactable.
 * Single-open rule: only one of the three left-dock modals visible at a time.
 * Info panel is independent — on the right edge, starts open, toggles separately.
 *
 * Props mirror MobileDock:
 *   toolkit    {ReactNode}
 *   dataLayer  {ReactNode}
 *   scale      {ReactNode}
 *   info       {ReactNode}
 *   anyLayerVisible {boolean}
 *   colormap   {string}
 *   isClassified {boolean}
 */
const DesktopDock = ({
  toolkit,
  dataLayer,
  scale,
  info,
  anyLayerVisible = false,
  colormap = 'plasma',
  isClassified = false,
}) => {
  const [openPanel, setOpenPanel] = useState(null); // 'toolkit' | 'dataLayer' | 'scale' | null
  const [infoOpen, setInfoOpen] = useState(true);   // Info panel independent — starts open

  const toggle = (id) => setOpenPanel(prev => prev === id ? null : id);
  const close  = () => setOpenPanel(null);

  // Colormap swatch for the Scale dock button
  const activeCmap = CONTINUOUS_COLORMAPS.find(c => c.id === colormap) || CONTINUOUS_COLORMAPS[0];
  const swatchGradient = isClassified
    ? 'linear-gradient(to right, #3b82f6, #60a5fa, #86efac, #fde047, #fb923c, #ef4444, #b91c1c)'
    : activeCmap.gradient;

  const DOCK_W = 56; // px — width of the vertical strip

  // ── Dock button style ──────────────────────────────────────────
  const dockBtnStyle = (id) => ({
    width: '100%',
    aspectRatio: '1 / 1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    background: openPanel === id ? 'var(--accent-dim)' : 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '6px 4px',
    transition: 'background 0.15s',
    outline: 'none',
    flexShrink: 0,
  });

  const dockLabelStyle = (id) => ({
    fontSize: '8px',
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    color: openPanel === id ? 'var(--accent-text)' : 'var(--text-on-glass-dim)',
    lineHeight: 1,
    whiteSpace: 'nowrap',
  });

  // ── Modal config ───────────────────────────────────────────────
  const panels = {
    toolkit:   { title: 'Map Toolkit',        content: toolkit },
    dataLayer: { title: 'Map Visualizations', content: dataLayer },
    scale:     { title: 'Scale',              content: scale },
  };

  const activePanel = openPanel ? panels[openPanel] : null;

  // Shared close-button style
  const closeBtnStyle = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-on-glass-dim)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  };

  const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );

  return (
    <>
      {/* ── Left-dock floating panel (toolkit / dataLayer / scale) ── */}
      {activePanel && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: `${DOCK_W + 8}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 200,
            width: '320px',
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            fontFamily: 'Inter, sans-serif',
            animation: 'ddock-in 0.22s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--glass-border-light)',
            flexShrink: 0,
            borderRadius: '16px 16px 0 0',
            overflow: 'hidden',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              color: 'var(--text-on-glass)',
            }}>
              {activePanel.title}
            </span>
            <button onClick={close} style={closeBtnStyle} aria-label="Close panel">
              <CloseIcon />
            </button>
          </div>
          <div style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            borderRadius: '0 0 16px 16px',
          }}>
            {activePanel.content}
          </div>
        </div>
      )}

      {/* ── Info panel — right edge, independent ─────────────── */}
      {infoOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 200,
            width: '300px',
            maxHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(10,6,20,0.65)',
            backdropFilter: 'blur(40px) saturate(1.2)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.2)',
            border: '1px solid rgba(255,255,255,0.13)',
            borderRight: 'none',
            borderRadius: '16px 0 0 16px',
            boxShadow: '-6px 0 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.10)',
            fontFamily: 'Inter, sans-serif',
            animation: 'info-in 0.25s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            flexShrink: 0,
            borderRadius: '16px 0 0 0',
            overflow: 'hidden',
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.9px',
              color: '#ffffff',
            }}>
              Info
            </span>
            <button onClick={() => setInfoOpen(false)} style={closeBtnStyle} aria-label="Close info panel">
              <CloseIcon />
            </button>
          </div>
          <div style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            borderRadius: '0 0 0 16px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.15) transparent',
          }}>
            {info}
          </div>
        </div>
      )}

      {/* ── Left-anchored vertical dock strip ─────────────────── */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: `${DOCK_W}px`,
        zIndex: 210,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 6px',
        gap: '4px',
        background: 'var(--glass-bg-medium)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--glass-border)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        borderRadius: '0 12px 12px 0',
        boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      }}>

        {/* View / Toolkit button */}
        <button
          style={dockBtnStyle('toolkit')}
          onClick={() => toggle('toolkit')}
          aria-label="Map Toolkit"
          title="View controls"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={openPanel === 'toolkit' ? 'var(--accent)' : 'var(--text-on-glass-dim)'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
          <span style={dockLabelStyle('toolkit')}>View</span>
        </button>

        {/* Divider */}
        <div style={{ width: '32px', height: '1px', background: 'var(--glass-border-light)', flexShrink: 0 }} />

        {/* Layers / DataLayer button */}
        <button
          style={dockBtnStyle('dataLayer')}
          onClick={() => toggle('dataLayer')}
          aria-label="Map Visualizations"
          title="Map layers"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={openPanel === 'dataLayer' ? 'var(--accent)' : 'var(--text-on-glass-dim)'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <span style={dockLabelStyle('dataLayer')}>Layers</span>
        </button>

        {/* Divider */}
        <div style={{ width: '32px', height: '1px', background: 'var(--glass-border-light)', flexShrink: 0 }} />

        {/* Scale button — live colormap swatch */}
        <button
          style={{
            ...dockBtnStyle('scale'),
            opacity: anyLayerVisible ? 1 : 0.35,
            pointerEvents: anyLayerVisible ? 'auto' : 'none',
          }}
          onClick={() => toggle('scale')}
          aria-label="Scale"
          title="Color scale"
        >
          <div style={{
            width: '28px',
            height: '9px',
            borderRadius: '3px',
            background: swatchGradient,
            border: openPanel === 'scale'
              ? '1.5px solid var(--accent)'
              : '1px solid rgba(255,255,255,0.2)',
            flexShrink: 0,
          }} />
          <span style={dockLabelStyle('scale')}>Scale</span>
        </button>

        {/* Divider */}
        <div style={{ width: '32px', height: '1px', background: 'var(--glass-border-light)', flexShrink: 0 }} />

        {/* Info button */}
        <button
          style={{
            ...dockBtnStyle('_info'),
            background: infoOpen ? 'var(--accent-dim)' : 'transparent',
          }}
          onClick={() => setInfoOpen(o => !o)}
          aria-label="Info"
          title="AVA & layer info"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={infoOpen ? 'var(--accent)' : 'var(--text-on-glass-dim)'}
            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span style={{
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            color: infoOpen ? 'var(--accent-text)' : 'var(--text-on-glass-dim)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>Info</span>
        </button>

      </div>

      {/* Animations */}
      <style>{`
        @keyframes ddock-in {
          from { opacity: 0; transform: translateY(-50%) translateX(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0)      scale(1); }
        }
        @keyframes info-in {
          from { opacity: 0; transform: translateY(-50%) translateX(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0)     scale(1); }
        }
      `}</style>
    </>
  );
};

export default DesktopDock;
