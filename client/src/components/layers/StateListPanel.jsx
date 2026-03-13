import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStateConfigs } from '../../config/stateConfig';
import '../../styles/components/ava-list-panel.css';

/**
 * StateListPanel
 * Displays a searchable list of wine-producing states with
 * bi-directional hover interaction with the national map.
 * Mirrors AVAListPanel structure exactly.
 */
const StateListPanel = ({ onStateHover }) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Build sorted list of wine states from config (synchronous — no fetch needed)
  const allStates = Object.values(getAllStateConfigs())
    .filter(cfg => cfg.avaFile)
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredStates = searchTerm
    ? allStates.filter(cfg =>
        cfg.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allStates;

  const handleStateClick = (stateName) => {
    const stateSlug = stateName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/states/${stateSlug}`);
  };

  const handleMouseEnter = (stateName) => {
    onStateHover?.(stateName, true);
  };

  const handleMouseLeave = (stateName) => {
    onStateHover?.(stateName, false);
  };

  return (
    <div className={`ava-list-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="ava-list-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <button
          className="ava-list-toggle"
          onClick={(e) => { e.stopPropagation(); setIsCollapsed(!isCollapsed); }}
          aria-label={isCollapsed ? 'Expand state list' : 'Collapse state list'}
        >
          {/* ▶ points right by default; rotates 180° (◀) when expanded */}
          <span className={`toggle-arrow ${isCollapsed ? '' : 'expanded'}`}>
            ▶
          </span>
        </button>
        <h3 className="ava-list-title">
          Wine States
          <span className="ava-count">({filteredStates.length})</span>
        </h3>
      </div>

      {!isCollapsed && (
        <div className="ava-list-content">
          {allStates.length > 5 && (
            <div className="ava-search">
              <input
                type="text"
                className="ava-search-input"
                placeholder="Search states..."
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
            {filteredStates.length > 0 ? (
              filteredStates.map((cfg) => (
                <div
                  key={cfg.name}
                  className="ava-list-item"
                  onClick={() => handleStateClick(cfg.name)}
                  onMouseEnter={() => handleMouseEnter(cfg.name)}
                  onMouseLeave={() => handleMouseLeave(cfg.name)}
                >
                  <span className="ava-list-item-name">{cfg.name}</span>
                  <span className="ava-list-item-arrow">→</span>
                </div>
              ))
            ) : (
              <div className="ava-list-empty">
                No states match "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StateListPanel;
