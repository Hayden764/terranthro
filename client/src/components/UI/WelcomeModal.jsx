import { useState, useEffect } from 'react';

const STORAGE_KEY = 'terranthro_welcome_dismissed';

// App.jsx controls whether this renders at all.
// This component only manages: the entrance delay, the exit animation,
// and writing to localStorage when "don't show again" is checked.
const WelcomeModal = ({ onClose }) => {
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    // Small delay so the globe loads visibly behind the modal
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
    }, 350);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 2000,
          animation: animatingOut
            ? 'fadeOut 350ms ease forwards'
            : 'fadeIn 400ms ease forwards',
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(680px, 92vw)',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(20, 18, 14, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          zIndex: 2001,
          fontFamily: 'Inter, sans-serif',
          color: '#FFFFFF',
          boxShadow: '0 32px 80px rgba(0, 0, 0, 0.6)',
          animation: animatingOut
            ? 'slideOut 350ms cubic-bezier(0.4, 0, 1, 1) forwards'
            : 'slideIn 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header stripe */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #C41E3A, #6B2D5C, #7EC8E3)',
          borderRadius: '16px 16px 0 0',
        }} />

        <div style={{ padding: 'clamp(20px, 5vw, 36px) clamp(16px, 6vw, 40px) clamp(16px, 4vw, 32px)' }}>

          {/* Logo / title */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C41E3A',
              marginBottom: '8px',
            }}>
              Welcome to
            </div>
            <h1 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 'clamp(28px, 5vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.1,
            }}>
              TERRANTHRO
            </h1>
            <p style={{
              marginTop: '10px',
              fontSize: '15px',
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.03em',
            }}>
              Progressive Terroir Visualization
            </p>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: '28px',
          }} />

          {/* What is this */}
          <p style={{
            fontSize: '15px',
            lineHeight: 1.75,
            color: 'rgba(255,255,255,0.82)',
            marginBottom: '28px',
          }}>
            Terranthro is an interactive map for exploring American Viticultural Areas (AVAs) —
            the officially designated wine regions of the United States. Zoom into any region to
            see its terrain, climate patterns, and geographic character.
          </p>

          {/* How to use */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#7EC8E3',
              marginBottom: '16px',
            }}>
              How to Navigate
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { step: '01', title: 'Pick a State', desc: 'Hover over a highlighted state on the globe and click to zoom in.' },
                { step: '02', title: 'Explore AVAs', desc: 'Browse all American Viticultural Areas within the state. Hover to highlight, click to dive deeper.' },
                { step: '03', title: 'View Terrain & Climate', desc: 'At the AVA level, toggle on elevation, slope, aspect, and monthly climate layers from the data panel.' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#C41E3A',
                    letterSpacing: '0.1em',
                    paddingTop: '2px',
                    minWidth: '24px',
                  }}>{step}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data note */}
          <div style={{
            padding: '14px 16px',
            background: 'rgba(196, 30, 58, 0.08)',
            border: '1px solid rgba(196, 30, 58, 0.2)',
            borderRadius: '10px',
            marginBottom: '28px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.65,
          }}>
            <span style={{ color: '#FFB81C', fontWeight: 600 }}>Early Access · </span>
            Topography and climate layers are currently available for select Oregon AVAs,
            with more regions being added continuously. AVA boundary data covers all 33 US wine states.
          </div>

          {/* Footer actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            {/* Don't show again */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.45)',
              userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={e => setDontShowAgain(e.target.checked)}
                style={{
                  width: '15px',
                  height: '15px',
                  accentColor: '#C41E3A',
                  cursor: 'pointer',
                }}
              />
              Don't show again
            </label>

            {/* CTA button */}
            <button
              onClick={handleClose}
              style={{
                background: 'linear-gradient(135deg, #C41E3A, #6B2D5C)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 32px',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'opacity 150ms ease, transform 150ms ease',
              }}
              onMouseEnter={e => {
                e.target.style.opacity = '0.88';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Start Exploring →
            </button>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes slideOut {
          from { opacity: 1; transform: translate(-50%, -50%); }
          to   { opacity: 0; transform: translate(-50%, calc(-50% - 12px)); }
        }
      `}</style>
    </>
  );
};

export default WelcomeModal;
