import { Link } from 'react-router-dom';
import { useState } from 'react';
import '../../styles/components/ava-list-panel.css';

/**
 * AVA List Panel Component
 * Displays a clickable list of AVAs for navigation
 * Alternative to clicking map polygons
 */
const AVAListPanel = ({ avaData, stateName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  if (!avaData || !avaData.features || avaData.features.length === 0) {
    return null;
  }

  // Sort AVAs alphabetically
  const sortedAVAs = [...avaData.features].sort((a, b) => 
    (a.properties.name || '').localeCompare(b.properties.name || '')
  );

  // Filter AVAs based on search query
  const filteredAVAs = searchQuery
    ? sortedAVAs.filter(ava =>
        (ava.properties.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedAVAs;

  // Convert AVA name to slug for URL
  const getAvaSlug = (avaName) => {
    return (avaName || '').toLowerCase().replace(/\s+/g, '-');
  };

  // Capitalize state name
  const displayStateName = stateName 
    ? stateName.charAt(0).toUpperCase() + stateName.slice(1)
    : '';

  return (
    <div className={`ava-list-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ava-list-header">
        <button
          className="ava-list-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse AVA list' : 'Expand AVA list'}
        >
          <span className={`toggle-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        </button>
        <h3 className="ava-list-title">
          {displayStateName} AVAs
          <span className="ava-count">({filteredAVAs.length})</span>
        </h3>
      </div>

      {isExpanded && (
        <div className="ava-list-content">
          {sortedAVAs.length > 5 && (
            <div className="ava-search">
              <input
                type="text"
                placeholder="Search AVAs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ava-search-input"
              />
              {searchQuery && (
                <button
                  className="ava-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="ava-list-items">
            {filteredAVAs.length > 0 ? (
              filteredAVAs.map((ava, index) => {
                const avaName = ava.properties.name;
                if (!avaName) return null;
                
                const avaSlug = getAvaSlug(avaName);
                const avaPath = `/states/${stateName.toLowerCase()}/avas/${avaSlug}`;

                return (
                  <Link
                    key={avaName || index}
                    to={avaPath}
                    className="ava-list-item"
                  >
                    <span className="ava-list-item-name">{avaName}</span>
                    <span className="ava-list-item-arrow">→</span>
                  </Link>
                );
              })
            ) : (
              <div className="ava-list-empty">
                No AVAs match "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AVAListPanel;