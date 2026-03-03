import { useState } from 'react';
import { useMapContext } from '../../context/MapContext';

// Projection configuration for each wine-producing state (matches StateMap.jsx)
const STATE_PROJECTIONS = {
  'California': { zone: 10, rotation: -3 },
  'Oregon': { zone: 10, rotation: -2 },
  'Washington': { zone: 10, rotation: -4 },
  'Idaho': { zone: 11, rotation: -2 },
  'Colorado': { zone: 13, rotation: 0 },
  'Arizona': { zone: 12, rotation: 0 },
  'New Mexico': { zone: 13, rotation: 1 },
  'Texas': { zone: 14, rotation: 1 },
  'Missouri': { zone: 15, rotation: 0 },
  'Arkansas': { zone: 15, rotation: 0 },
  'Oklahoma': { zone: 14, rotation: 0 },
  'Louisiana': { zone: 15, rotation: 0 },
  'Mississippi': { zone: 16, rotation: 2 },
  'Tennessee': { zone: 16, rotation: 0 },
  'Kentucky': { zone: 16, rotation: 0 },
  'Illinois': { zone: 16, rotation: 2 },
  'Indiana': { zone: 16, rotation: 0 },
  'Iowa': { zone: 15, rotation: 0 },
  'Wisconsin': { zone: 16, rotation: 3 },
  'Minnesota': { zone: 15, rotation: 1 },
  'Ohio': { zone: 17, rotation: 2 },
  'Michigan': { zone: 16, rotation: -1 },
  'Pennsylvania': { zone: 18, rotation: 3 },
  'New York': { zone: 18, rotation: 2 },
  'Maryland': { zone: 18, rotation: 2 },
  'Virginia': { zone: 17, rotation: 0 },
  'North Carolina': { zone: 17, rotation: 0 },
  'Georgia': { zone: 17, rotation: 5 },
  'New Jersey': { zone: 18, rotation: 1 },
  'Connecticut': { zone: 18, rotation: 0 },
  'Massachusetts': { zone: 19, rotation: 4 },
  'Rhode Island': { zone: 19, rotation: 0 },
  'New Hampshire': { zone: 19, rotation: 2 }
};

const ProjectionInfoModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLevel, selectedState } = useMapContext();

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleOverlayClick = (e) => {
    // Close modal if clicking on the overlay (not the modal content)
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <>
      {/* Info Button */}
      <button
        onClick={openModal}
        className="projection-info-button"
        style={{
          position: 'absolute',
          bottom: 'var(--space-8)',
          right: 'var(--space-8)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--glass-bg-medium)',
          backdropFilter: 'var(--glass-blur-light)',
          WebkitBackdropFilter: 'var(--glass-blur-light)',
          border: '1px solid var(--glass-border)',
          color: 'rgba(255,255,255,0.75)',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: 'var(--glass-shadow-hud)',
          transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = 'var(--glass-bg-heavy)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'var(--glass-bg-medium)';
        }}
      >
        i
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="projection-modal-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0, left: 0,
            width: '100%', height: '100%',
            backgroundColor: 'var(--scrim-bg)',
            backdropFilter: 'var(--glass-blur-scrim)',
            WebkitBackdropFilter: 'var(--glass-blur-scrim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 300ms ease-out'
          }}
        >
          {/* Modal Content */}
          <div
            className="projection-modal-content"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '90%',
              padding: 'var(--space-8)',
              position: 'relative',
              boxShadow: 'var(--glass-shadow)',
              color: 'var(--text-on-glass)',
              animation: 'modalSlideIn 300ms ease-out'
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                width: '28px', height: '28px',
                background: 'var(--glass-bg-medium)',
                border: '1px solid var(--glass-border)',
                borderRadius: '50%',
                fontSize: 'var(--text-lg)',
                color: 'var(--text-on-glass-muted)',
                cursor: 'pointer',
                transition: 'color var(--transition-fast), background var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-on-glass)';
                e.currentTarget.style.background = 'var(--glass-bg-heavy)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-on-glass-muted)';
                e.currentTarget.style.background = 'var(--glass-bg-medium)';
              }}
            >
              ×
            </button>

            {/* Modal Header */}
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--text-on-glass)',
                marginBottom: 'var(--space-6)',
                letterSpacing: 'var(--tracking-tight)'
              }}
            >
              Projection & Data Information
            </h2>

            {/* Projection Details */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h3 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--accent-text)',
                  marginBottom: 'var(--space-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)'
                }}
              >
                Current Projection
              </h3>
              
              {/* National Level - Albers USA */}
              {currentLevel === 'national' && (
                <>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>Projection:</strong> Albers Equal Area Conic (EPSG:5070)
                  </p>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>Datum:</strong> NAD83
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-on-glass-muted)', fontStyle: 'italic' }}>
                    Optimized for continental United States visualization
                  </p>
                </>
              )}
              
              {/* State Level - UTM */}
              {currentLevel === 'state' && selectedState && (
                <>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>Projection:</strong> UTM Zone {STATE_PROJECTIONS[selectedState.name]?.zone}N (Transverse Mercator)
                  </p>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>EPSG Code:</strong> {32600 + (STATE_PROJECTIONS[selectedState.name]?.zone || 0)}
                  </p>
                  {STATE_PROJECTIONS[selectedState.name]?.rotation !== 0 && (
                    <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                      <strong>Rotation:</strong> {Math.abs(STATE_PROJECTIONS[selectedState.name]?.rotation)}° {STATE_PROJECTIONS[selectedState.name]?.rotation > 0 ? 'clockwise' : 'counter-clockwise'}
                    </p>
                  )}
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>Datum:</strong> WGS84
                  </p>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>State:</strong> {selectedState.name}
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-on-glass-muted)', fontStyle: 'italic' }}>
                    UTM projection minimizes distortion for regional-scale terroir analysis
                  </p>
                </>
              )}
              
              {/* AVA Level - Local UTM with 3D */}
              {currentLevel === 'ava' && (
                <>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>Projection:</strong> Local UTM with 3D Terrain
                  </p>
                  <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-on-glass)', marginBottom: 'var(--space-2)' }}>
                    <strong>Datum:</strong> WGS84
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-on-glass-muted)', fontStyle: 'italic' }}>
                    High-precision local projection with elevation data for vineyard-scale analysis
                  </p>
                </>
              )}
            </div>

            {/* Data Sources */}
            <div>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--accent-text)',
                  marginBottom: 'var(--space-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)'
                }}
              >
                Data Sources
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                <li style={{ marginBottom: 'var(--space-2)', color: 'var(--text-on-glass)' }}>
                  <strong style={{ color: 'var(--accent-text)' }}>Climate:</strong> PRISM Climate Group, Oregon State University
                </li>
                <li style={{ marginBottom: 'var(--space-2)', color: 'var(--text-on-glass)' }}>
                  <strong style={{ color: 'var(--accent-text)' }}>Soil:</strong> USDA NRCS Soil Survey (SSURGO)
                </li>
                <li style={{ marginBottom: 'var(--space-2)', color: 'var(--text-on-glass)' }}>
                  <strong style={{ color: 'var(--accent-text)' }}>Terrain:</strong> USGS 3D Elevation Program (3DEP)
                </li>
                <li style={{ color: 'var(--text-on-glass)' }}>
                  <strong style={{ color: 'var(--accent-text)' }}>Production Data:</strong> USDA National Agricultural Statistics Service (NASS)
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .projection-modal-overlay {
          animation: fadeIn 300ms ease-out;
        }

        .projection-modal-content {
          animation: modalSlideIn 300ms ease-out;
        }
      `}</style>
    </>
  );
};

export default ProjectionInfoModal;
