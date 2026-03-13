import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/ava-list-panel.css';

/**
 * AVA List Panel Component
 * Displays searchable list of AVAs with bi-directional hover interaction with map
 */
const AVAListPanel = ({ avaData, stateName, onAVAHover }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  if (!avaData || !avaData.features) {
    return null;
  }

  // Sort AVAs alphabetically
  const sortedAVAs = [...avaData.features].sort((a, b) => {
    const nameA = a.properties.name || '';
    const nameB = b.properties.name || '';
    return nameA.localeCompare(nameB);
  });

  // Filter AVAs by search term
  const filteredAVAs = searchTerm
    ? sortedAVAs.filter(ava => 
        ava.properties.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sortedAVAs;

  const handleAVAClick = (avaName) => {
    const avaSlug = avaName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/states/${stateName}/avas/${avaSlug}`);
  };

  const handleMouseEnter = (avaName) => {
    if (onAVAHover) {
      onAVAHover(avaName, true);
    }
  };

  const handleMouseLeave = (avaName) => {
    if (onAVAHover) {
      onAVAHover(avaName, false);
    }
  };

  return (
    <div className={`ava-list-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="ava-list-header">
        <button 
          className="ava-list-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand AVA list' : 'Collapse AVA list'}
        >
          <span className={`toggle-arrow ${isCollapsed ? '' : 'expanded'}`}>
            ▶
          </span>
        </button>
        <h3 className="ava-list-title">
          AVAs
          <span className="ava-count">({filteredAVAs.length})</span>
        </h3>
      </div>

      {!isCollapsed && (
        <div className="ava-list-content">
          {sortedAVAs.length > 5 && (
            <div className="ava-search">
              <input
                type="text"
                className="ava-search-input"
                placeholder="Search AVAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="ava-search-clear"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <div className="ava-list-items">
            {filteredAVAs.length > 0 ? (
              filteredAVAs.map((ava, index) => (
                <div
                  key={index}
                  className="ava-list-item"
                  onClick={() => handleAVAClick(ava.properties.name)}
                  onMouseEnter={() => handleMouseEnter(ava.properties.name)}
                  onMouseLeave={() => handleMouseLeave(ava.properties.name)}
                >
                  <span className="ava-list-item-name">
                    {ava.properties.name}
                  </span>
                  <span className="ava-list-item-arrow">→</span>
                </div>
              ))
            ) : (
              <div className="ava-list-empty">
                No AVAs match "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AVAListPanel;
