import { useMapContext } from '../../context/MapContext';

const Breadcrumb = () => {
  const { 
    currentLevel, 
    selectedState, 
    selectedAVA,
    navigateToNational,
    setCurrentLevel,
    setSelectedAVA 
  } = useMapContext();

  const handleNavigation = (level) => {
    if (level === 'national') {
      navigateToNational();
    } else if (level === 'state') {
      setCurrentLevel('state');
      setSelectedAVA(null);
    }
  };

  return (
    <nav className="breadcrumb">
      <button 
        onClick={() => handleNavigation('national')}
        className="breadcrumb-link"
      >
        TERRANTHRO
      </button>
      
      <span className="breadcrumb-separator">→</span>
      
      <button 
        onClick={() => handleNavigation('national')}
        className="breadcrumb-link"
      >
        United States
      </button>
      
      {selectedState && (
        <>
          <span className="breadcrumb-separator">→</span>
          <button 
            onClick={() => handleNavigation('state')}
            className="breadcrumb-link"
          >
            {selectedState.name}
          </button>
        </>
      )}
      
      {selectedAVA && (
        <>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">
            {selectedAVA.name}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
