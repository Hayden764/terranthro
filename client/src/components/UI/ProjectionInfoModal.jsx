import { useState } from 'react';

const ProjectionInfoModal = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          background: 'var(--base-white)',
          border: '2px solid var(--primary-burgundy)',
          color: 'var(--primary-burgundy)',
          fontSize: 'var(--text-sm)',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          transition: 'transform var(--transition-fast)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
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
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
              background: 'var(--base-white)',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              padding: 'var(--space-8)',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
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
                width: '24px',
                height: '24px',
                background: 'none',
                border: 'none',
                fontSize: 'var(--text-lg)',
                color: 'var(--text-gray)',
                cursor: 'pointer',
                borderRadius: '4px',
                transition: 'color var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--primary-burgundy)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--text-gray)';
              }}
            >
              ×
            </button>

            {/* Modal Header */}
            <h2 
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xl)',
                color: 'var(--text-charcoal)',
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
                  color: 'var(--primary-burgundy)',
                  marginBottom: 'var(--space-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)'
                }}
              >
                Current Projection
              </h3>
              <p style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--text-charcoal)',
                marginBottom: 'var(--space-2)'
              }}>
                Albers Equal Area Conic (EPSG:5070)
              </p>
              <p style={{ 
                fontSize: 'var(--text-base)', 
                color: 'var(--text-charcoal)'
              }}>
                <strong>Datum:</strong> NAD83
              </p>
            </div>

            {/* Data Sources */}
            <div>
              <h3 
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--primary-burgundy)',
                  marginBottom: 'var(--space-3)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)'
                }}
              >
                Data Sources
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                fontSize: 'var(--text-sm)',
                lineHeight: 1.6
              }}>
                <li style={{ 
                  marginBottom: 'var(--space-2)',
                  color: 'var(--text-charcoal)'
                }}>
                  <strong style={{ color: 'var(--primary-burgundy)' }}>Climate:</strong> PRISM Climate Group, Oregon State University
                </li>
                <li style={{ 
                  marginBottom: 'var(--space-2)',
                  color: 'var(--text-charcoal)'
                }}>
                  <strong style={{ color: 'var(--primary-burgundy)' }}>Soil:</strong> USDA NRCS Soil Survey (SSURGO)
                </li>
                <li style={{ 
                  marginBottom: 'var(--space-2)',
                  color: 'var(--text-charcoal)'
                }}>
                  <strong style={{ color: 'var(--primary-burgundy)' }}>Terrain:</strong> USGS 3D Elevation Program (3DEP)
                </li>
                <li style={{ 
                  color: 'var(--text-charcoal)'
                }}>
                  <strong style={{ color: 'var(--primary-burgundy)' }}>Production Data:</strong> USDA National Agricultural Statistics Service (NASS)
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
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
