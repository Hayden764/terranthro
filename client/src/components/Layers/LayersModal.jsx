import { useEffect } from 'react';
import LayerPanel from './LayerPanel';
import styles from './LayersModal.module.css';

const LayersModal = ({ isOpen, onClose }) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Handle overlay click (close modal)
  const handleOverlayClick = () => {
    onClose();
  };

  // Prevent modal box clicks from closing
  const handleModalClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modalBox} onClick={handleModalClick}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>LAYERS</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close layers modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <LayerPanel isModal={true} />
        </div>
      </div>
    </div>
  );
};

export default LayersModal;
