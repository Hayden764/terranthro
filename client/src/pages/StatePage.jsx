import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { STATE_CONFIG, getStateConfig } from '../config/stateConfig';
import MapboxStateMap from '../components/Map/MapboxStateMap';
import wineStatesData from '../data/wine-states-production.json';
import '../styles/globals.css';

const StatePage = () => {
  const { stateName } = useParams();
  const [avaData, setAvaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get state configuration
  const stateConfig = getStateConfig(stateName);

  // Get production data for this state
  const productionData = stateConfig 
    ? wineStatesData.find(s => s.name === stateConfig.name)
    : null;

  // Fetch AVA data when state changes
  useEffect(() => {
    if (!stateConfig) {
      setLoading(false);
      return;
    }

    if (stateConfig.avaFile) {
      setLoading(true);
      setError(null);
      
      fetch(stateConfig.avaFile)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log(`Loaded ${data.features.length} ${stateConfig.name} AVAs`);
          setAvaData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading AVAs:', err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      // No AVA file for this state yet
      console.log(`No AVA file available for ${stateConfig.name}`);
      setAvaData(null);
      setLoading(false);
    }
  }, [stateName, stateConfig]);

  // Handle state not found
  if (!stateConfig) {
    return (
      <div className="state-page">
        <div className="state-not-found">
          <h1>State Not Found</h1>
          <p>The state "{stateName}" was not found in our database.</p>
          <Link to="/" className="back-link">← Back to National Map</Link>
        </div>
      </div>
    );
  }

  // Format production number
  const formatProduction = (tons) => {
    if (tons >= 1000000) {
      return `${(tons / 1000000).toFixed(1)}M tons`;
    } else if (tons >= 1000) {
      return `${(tons / 1000).toFixed(0)}K tons`;
    }
    return `${tons} tons`;
  };

  return (
    <div className="state-page">
      {/* Breadcrumb for state page */}
      <header className="state-header">
        <nav className="state-breadcrumb">
          <Link to="/" className="breadcrumb-link">TERRANTHRO</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to="/" className="breadcrumb-link">UNITED STATES</Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{stateConfig.name.toUpperCase()}</span>
        </nav>
      </header>

      {/* Intro Section */}
      <section className="state-intro">
        <h1>{stateConfig.name.toUpperCase()} WINE REGIONS</h1>
        <p className="intro-text">{stateConfig.intro}</p>

        {/* Stats Panel */}
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-label">AVAs</span>
            <span className="stat-value">
              {loading ? '...' : (avaData ? avaData.features.length : 'TBD')}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Production</span>
            <span className="stat-value">
              {productionData ? formatProduction(productionData.tons_crushed) : 'TBD'}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Rank</span>
            <span className="stat-value">
              {productionData ? `#${wineStatesData.findIndex(s => s.name === stateConfig.name) + 1}` : 'TBD'}
            </span>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="state-map-section">
        {loading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Loading {stateConfig.name} AVAs...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            <p>Error loading AVA data: {error}</p>
          </div>
        )}

        <div className="state-map-container">
          <MapboxStateMap 
            stateConfig={stateConfig}
            avaData={avaData}
          />
        </div>
      </section>

      {/* AVA List Section */}
      {avaData && avaData.features.length > 0 && (
        <section className="ava-list-section">
          <h2>AMERICAN VITICULTURAL AREAS</h2>
          <div className="ava-grid">
            {avaData.features
              .map(f => f.properties.name)
              .filter(Boolean)
              .sort()
              .map((name, index) => (
                <div key={index} className="ava-item">
                  {name}
                </div>
              ))
            }
          </div>
        </section>
      )}

      {/* No AVA Data Message */}
      {!loading && !avaData && (
        <section className="no-ava-section">
          <p>
            AVA boundary data for {stateConfig.name} is coming soon. 
            Check back later for detailed appellation maps.
          </p>
        </section>
      )}

      {/* Back to National Map */}
      <footer className="state-footer">
        <Link to="/" className="back-link">← Back to National Map</Link>
      </footer>
    </div>
  );
};

export default StatePage;
