import { useState, useEffect } from 'react';
import { useMapContext } from '../../context/MapContext';
import { useLayerContext } from '../../context/LayerContext';
import LayerToggle from './LayerToggle';
import OpacitySlider from './OpacitySlider';

const LayerPanel = ({ isModal = false }) => {
  const { currentLevel, selectedState, selectedAVA } = useMapContext();
  const { activeLayers, toggleLayer, setLayerOpacity, layerOpacity } = useLayerContext();
  const [availableLayers, setAvailableLayers] = useState([]);
  
  // State to track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({
    climate: false,
    soil: false,
    topography: false,
    geology: false,
    wind: false
  });

  // Function to toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    // Fetch available layers based on current level
    let endpoint;
    if (currentLevel === 'national') {
      endpoint = '/api/layers/national';
    } else if (currentLevel === 'state') {
      endpoint = `/api/layers/state/${selectedState?.id}`;
    } else if (currentLevel === 'ava') {
      endpoint = `/api/layers/${selectedAVA?.id}`;
    }

    if (endpoint) {
      fetch(endpoint)
        .then(res => res.json())
        .then(data => setAvailableLayers(data.layers || []))
        .catch(err => console.error('Error fetching layers:', err));
    }
  }, [currentLevel, selectedState, selectedAVA]);

  const layerCategories = {
    climate: ['Temperature', 'Precipitation', 'Growing Degree Days'],
    soil: ['Texture', 'Drainage', 'Depth', 'pH'],
    topography: ['Elevation', 'Slope', 'Aspect', 'Solar Exposure'],
    geology: ['Bedrock Geology', 'Surficial Geology'],
    wind: ['Average Wind Speed', 'Prevailing Direction']
  };

  return (
    <div className={isModal ? "layer-panel-modal" : "layer-panel"}>
      {!isModal && <h2 className="panel-title">LAYERS</h2>}
      
      {Object.entries(layerCategories).map(([category, layers]) => {
        const isExpanded = expandedCategories[category];
        
        return (
          <div key={category} className="layer-category">
            <div 
              className="category-header"
              onClick={() => toggleCategory(category)}
              style={{
                cursor: 'pointer',
                padding: 'var(--space-2) var(--space-1)',
                borderRadius: '4px',
                transition: 'background-color var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(196, 30, 58, 0.03)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <h3 className="category-title" style={{ margin: 0 }}>
                {category.toUpperCase()}
              </h3>
              <span className="category-chevron" style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-gray)',
                transition: 'transform var(--transition-fast)',
                userSelect: 'none'
              }}>
                {isExpanded ? '↓' : '→'}
              </span>
            </div>
            
            <div 
              className="category-layers"
              style={{
                overflow: 'hidden',
                transition: 'max-height var(--transition-base)',
                maxHeight: isExpanded ? '500px' : '0'
              }}
            >
          
          {layers.map(layer => {
            const layerData = availableLayers.find(
              l => l.display_name === layer
            );
            
            if (!layerData) {
              return (
                <div key={layer} className="layer-item layer-item-disabled">
                  <LayerToggle
                    label={layer}
                    checked={false}
                    onChange={() => {}}
                  />
                  <span className="layer-unavailable">Not available at this level</span>
                </div>
              );
            }
            
            const isActive = activeLayers.includes(layerData.id);
            const opacity = layerOpacity[layerData.id] || 0.7;
            
            return (
              <div key={layerData.id} className="layer-item">
                <LayerToggle
                  label={layer}
                  checked={isActive}
                  onChange={() => toggleLayer(layerData.id)}
                />
                
                {isActive && (
                  <OpacitySlider
                    value={opacity}
                    onChange={(value) => setLayerOpacity(layerData.id, value)}
                  />
                )}
              </div>
            );
          })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LayerPanel;
