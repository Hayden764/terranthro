import styles from './LayersMenuButton.module.css';

const LayersMenuButton = ({ onClick }) => {
  return (
    <button 
      className={styles.hamburgerButton}
      onClick={onClick}
      aria-label="Toggle layers menu"
    >
      <div className={styles.hamburgerIcon}>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </div>
    </button>
  );
};

export default LayersMenuButton;
