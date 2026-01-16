import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMapContext } from '../../context/MapContext';
import styles from './Breadcrumb.module.css';

const Breadcrumb = () => {
  const { 
    currentLevel, 
    selectedState, 
    selectedAVA,
    navigateToNational,
    setCurrentLevel,
    setSelectedAVA 
  } = useMapContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const hoverTimeoutRef = useRef(null);

  // Detect mobile on resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (level) => {
    if (level === 'national') {
      navigateToNational();
    } else if (level === 'state') {
      setCurrentLevel('state');
      setSelectedAVA(null);
    }
  };

  // Desktop: hover handlers
  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(hoverTimeoutRef.current);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 500);
    }
  };

  // Mobile: click handler
  const handleClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  // Build all breadcrumb items
  const allItems = [];
  
  // Always include Terranthro home link
  allItems.push({
    type: 'home',
    label: 'TERRANTHRO',
    onClick: null,
    component: 'Link'
  });

  // Add United States if not at national level
  if (currentLevel !== 'national') {
    allItems.push({
      type: 'national',
      label: 'UNITED STATES',
      onClick: () => handleNavigation('national'),
      component: 'button'
    });
  }

  // Add state if selected
  if (selectedState) {
    allItems.push({
      type: 'state',
      label: selectedState.name.toUpperCase(),
      onClick: () => handleNavigation('state'),
      component: 'button'
    });
  }

  // Add AVA if selected (always shown as current/last item)
  if (selectedAVA) {
    allItems.push({
      type: 'ava',
      label: selectedAVA.name.toUpperCase(),
      onClick: null,
      component: 'span',
      isCurrent: true
    });
  }

  // Determine display items based on expanded state
  let displayItems;
  if (currentLevel === 'national') {
    // At national level, just show home link (no chevron)
    displayItems = [allItems[0]];
  } else if (isExpanded) {
    // Expanded: show all items
    displayItems = allItems;
  } else {
    // Collapsed: show first and last
    displayItems = [allItems[0], allItems[allItems.length - 1]];
  }

  const showChevron = currentLevel !== 'national';

  return (
    <nav 
      className={`${styles.breadcrumb} ${isExpanded ? styles.expanded : styles.collapsed}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {displayItems.map((item, index) => (
        <span key={`${item.type}-${index}`} className={styles.breadcrumbItem}>
          {index > 0 && <span className={styles.separator}>→</span>}
          
          {item.component === 'Link' ? (
            <Link 
              to="/"
              className={styles.link}
            >
              {item.label}
            </Link>
          ) : item.component === 'button' ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              className={styles.link}
            >
              {item.label}
            </button>
          ) : (
            <span className={styles.current}>
              {item.label}
            </span>
          )}
        </span>
      ))}
      
      {showChevron && (
        <span className={styles.chevron}>
          {isExpanded ? '▲' : '▼'}
        </span>
      )}
    </nav>
  );
};

export default Breadcrumb;
