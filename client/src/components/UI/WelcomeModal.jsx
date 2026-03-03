import { useState, useEffect } from 'react';

const STORAGE_KEY = 'terranthro_welcome_dismissed';

// Glassmorphism: frosted glass panels, vivid gradient light blobs,
// backdrop-filter blur, semi-transparent surfaces, thin white borders,
// Inter typography, soft multi-layered glow shadows.
const WelcomeModal = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, 320);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* ─── Base ─── */
        * { box-sizing: border-box; }

        /* ─── Animations ─── */
        @keyframes gl-bg-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gl-bg-out { from { opacity: 1; } to { opacity: 0; } }

        @keyframes gl-card-in {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) scale(0.97); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes gl-card-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 0; transform: translate(-50%, calc(-50% + 12px)) scale(0.97); }
        }

        /* ─── Glass card ─── */
        .gl-card {
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(36px) saturate(1.7);
          -webkit-backdrop-filter: blur(36px) saturate(1.7);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 20px;
          box-shadow:
            /* ambient outer glow */
            0 0 80px rgba(107, 45, 92, 0.22),
            /* depth shadow */
            0 24px 64px rgba(0, 0, 0, 0.55),
            0 8px 24px rgba(0, 0, 0, 0.35),
            /* top highlight — mimics glass thickness */
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(255, 255, 255, 0.04);
        }

        /* ─── Inner glass panels (step cards, notice) ─── */
        .gl-panel {
          background: rgba(255, 255, 255, 0.055);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 12px;
          transition: background 180ms ease, border-color 180ms ease;
        }
        .gl-panel:hover {
          background: rgba(255, 255, 255, 0.085);
          border-color: rgba(255, 255, 255, 0.16);
        }

        /* ─── Notice panel ─── */
        .gl-notice {
          background: rgba(196, 30, 58, 0.12);
          border: 1px solid rgba(196, 30, 58, 0.28);
          border-radius: 12px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        /* ─── CTA button ─── */
        .gl-cta {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #fff;
          background: linear-gradient(135deg, rgba(196,30,58,0.85) 0%, rgba(107,45,92,0.85) 100%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 11px 26px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 140ms ease, box-shadow 140ms ease;
          box-shadow:
            0 0 24px rgba(196, 30, 58, 0.35),
            0 4px 14px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .gl-cta::before {
          /* top gloss sheen */
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 45%;
          background: linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%);
          border-radius: 10px 10px 0 0;
          pointer-events: none;
        }
        .gl-cta:hover {
          transform: translateY(-2px);
          box-shadow:
            0 0 36px rgba(196, 30, 58, 0.5),
            0 8px 20px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.22);
        }
        .gl-cta:active {
          transform: translateY(0px);
          box-shadow:
            0 0 16px rgba(196, 30, 58, 0.3),
            0 2px 8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
        }

        /* ─── Checkbox ─── */
        .gl-check-wrap {
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          user-select: none;
        }
        .gl-check-wrap input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 5px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.07);
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
        }
        .gl-check-wrap input[type="checkbox"]:checked {
          background: rgba(196, 30, 58, 0.7);
          border-color: rgba(196, 30, 58, 0.8);
          box-shadow: 0 0 8px rgba(196, 30, 58, 0.45);
        }
        .gl-check-wrap input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          top: 3px; left: 5px;
          width: 5px; height: 9px;
          border: 2px solid #fff;
          border-top: none;
          border-left: none;
          transform: rotate(45deg);
        }

        /* ─── Divider ─── */
        .gl-divider {
          border: none;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.12) 70%, transparent);
          margin: 0;
        }

        /* ─── Scrollbar ─── */
        .gl-scroll::-webkit-scrollbar { width: 4px; }
        .gl-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 4px; }
        .gl-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .gl-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

        /* ─── Badge ─── */
        .gl-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 184, 28, 0.9);
          background: rgba(255, 184, 28, 0.10);
          border: 1px solid rgba(255, 184, 28, 0.25);
          border-radius: 20px;
          padding: 3px 10px;
        }

        /* ─── Step number dot ─── */
        .gl-dot {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: rgba(196, 30, 58, 0.18);
          border: 1px solid rgba(196, 30, 58, 0.35);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 120, 140, 0.95);
          box-shadow: 0 0 10px rgba(196, 30, 58, 0.2);
        }
      `}</style>

      {/* ─── Backdrop — transparent blur scrim so the live map shows through ─── */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(10, 6, 16, 0.45)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          animation: animatingOut
            ? 'gl-bg-out 320ms ease forwards'
            : 'gl-bg-in 350ms ease forwards',
        }}
      />

      {/* ─── Modal Card ─── */}
      <div
        className="gl-card gl-scroll"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(640px, 93vw)',
          maxHeight: '91vh',
          overflowY: 'auto',
          zIndex: 2001,
          color: 'rgba(255,255,255,0.92)',
          fontFamily: "'Inter', system-ui, sans-serif",
          animation: animatingOut
            ? 'gl-card-out 320ms cubic-bezier(0.4, 0, 1, 1) forwards'
            : 'gl-card-in 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >

        {/* ─── HEADER ─── */}
        <div style={{
          padding: 'clamp(24px, 4vw, 36px) clamp(24px, 5vw, 40px) clamp(18px, 3vw, 26px)',
          position: 'relative',
        }}>
          {/* Top badge row */}
          <div style={{ marginBottom: '16px' }}>
            <span className="gl-badge">
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(255,184,28,0.9)',
                boxShadow: '0 0 6px rgba(255,184,28,0.7)',
                display: 'inline-block',
              }} />
              Early Access
            </span>
          </div>

          {/* Wordmark */}
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(34px, 5.5vw, 54px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.0,
            /* Subtle gradient text — light through glass */
            background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.70) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            TERRANTHRO
          </h1>

          {/* Subtitle */}
          <p style={{
            margin: '10px 0 0',
            fontSize: '14px',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.50)',
            letterSpacing: '0.01em',
          }}>
            Progressive Terroir Visualization
          </p>

          {/* Decorative corner glow */}
          <div style={{
            position: 'absolute',
            top: -20, right: -20,
            width: 160, height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(196,30,58,0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }} />
        </div>

        <hr className="gl-divider" />

        {/* ─── BODY ─── */}
        <div style={{ padding: 'clamp(20px, 4vw, 30px) clamp(24px, 5vw, 40px)' }}>

          {/* Description */}
          <p style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.62)',
            margin: '0 0 24px',
          }}>
            An interactive map for exploring{' '}
            <span style={{
              color: 'rgba(255,255,255,0.88)',
              fontWeight: 500,
            }}>
              American Viticultural Areas (AVAs)
            </span>
            {' '}— the officially designated wine regions of the United States. Navigate from
            national overview to individual AVAs to explore terrain, climate patterns,
            and geographic character.
          </p>

          {/* Section heading */}
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '12px',
          }}>
            How to navigate
          </div>

          {/* Step cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
            {[
              { n: '1', title: 'Pick a State', desc: 'Hover over a highlighted state on the globe and click to zoom in.' },
              { n: '2', title: 'Explore AVAs',  desc: 'Browse all American Viticultural Areas within the state. Hover to highlight, click to dive deeper.' },
              { n: '3', title: 'View Terrain & Climate', desc: 'Toggle elevation, slope, aspect, and monthly climate layers from the data panel.' },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="gl-panel"
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                }}
              >
                <div className="gl-dot">{n}</div>
                <div style={{ paddingTop: '2px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.90)',
                    marginBottom: '3px',
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontSize: '12.5px',
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.48)',
                    lineHeight: 1.6,
                  }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data notice */}
          <div
            className="gl-notice"
            style={{ padding: '13px 16px', marginBottom: '26px' }}
          >
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(255, 120, 140, 0.8)',
              marginBottom: '5px',
            }}>
              Data Status
            </div>
            <p style={{
              margin: 0,
              fontSize: '12.5px',
              lineHeight: 1.65,
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 400,
            }}>
              Topography + climate layers available for select Oregon AVAs now —
              more regions being added continuously.{' '}
              <span style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                AVA boundary data covers all 33 wine states.
              </span>
            </p>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <label className="gl-check-wrap">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.42)',
              }}>
                Don't show again
              </span>
            </label>

            <button className="gl-cta" onClick={handleClose}>
              Start Exploring →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WelcomeModal;
