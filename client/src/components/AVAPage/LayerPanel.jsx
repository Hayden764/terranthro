import { useState } from 'react';
import '../../styles/components/layer-panel.css';

const LayerPanel = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // All categories collapsed by default
  const [expandedCategories, setExpandedCategories] = useState({
    topography: false,
    climate: false,
    soils: false,
    geology: false,
    viticulture: false
  });
  
  const [activeLayer, setActiveLayer] = useState(null);

  // Layer definitions
  const layers = {
    topography: ['Elevation', 'Slope', 'Aspect', 'Hillshade'],
    climate: ['Growing Degree Days', 'Precipitation', 'Temperature Zones'],
    soils: ['Soil Types', 'Drainage Classes'],
    geology: ['Bedrock Formations', 'Surficial Geology'],
    viticulture: ['Vineyard Boundaries']
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleLayer = (layerId) => {
    setActiveLayer(activeLayer === layerId ? null : layerId);
    console.log('Layer toggled:', layerId);
  };

  const generateLayerId = (category, layer) => {
    return `${category}-${layer.toLowerCase().replace(/\s+/g, '-')}`;
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="layer-hamburger-button"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open layer menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="layer-mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Layer Panel */}
      <div className={`layer-panel ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="panel-content">
          {/* Mobile Close Button */}
          <button 
            className="layer-mobile-close"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close layer menu"
          >
            ×
          </button>

          <h3 className="panel-title">Data Layers</h3>

          <div className="categories">
            {Object.entries(layers).map(([category, layerList]) => (
              <div key={category} className="category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="arrow">
                    {expandedCategories[category] ? '▼' : '▶'}
                  </span>
                  <span className="category-name">
                    {category.toUpperCase()}
                  </span>
                </button>

                {expandedCategories[category] && (
                  <div className="layer-list">
                    {layerList.map((layer) => {
                      const layerId = generateLayerId(category, layer);
                      return (
                        <label key={layerId} className="layer-checkbox">
                          <input
                            type="checkbox"
                            checked={activeLayer === layerId}
                            onChange={() => toggleLayer(layerId)}
                          />
                          <span>{layer}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LayerPanel;

