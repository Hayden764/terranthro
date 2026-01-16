import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import MapLibreAVAViewer from './MapLibreAVAViewer';
import LayerPanel from './LayerPanel';
import '../../styles/globals.css';

const AVAPage = () => {
  const { stateName, avaSlug } = useParams();
  const [avaFeature, setAvaFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Format state name for display
  const stateDisplay = stateName ? stateName.charAt(0).toUpperCase() + stateName.slice(1).toLowerCase() : 'State';

  // Load AVA data from public GeoJSON based on slug
  useEffect(() => {
    if (!stateName || !avaSlug) {
      setError('Missing state or AVA information');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Determine which GeoJSON file to fetch from public folder
    const stateAbbrev = stateName.substring(0, 2).toUpperCase();
    const avaFile = `/data/${stateAbbrev}_avas.geojson`;

    console.log(`Fetching AVA data from: ${avaFile}`);

    fetch(avaFile)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load AVA data: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`✓ Loaded ${data.features.length} AVAs from ${avaFile}`);
        console.log(`Looking for AVA with slug: "${avaSlug}"`);
        console.log(`Available AVAs in ${stateName.toUpperCase()}:`, 
          data.features.map(f => ({
            name: f.properties.name,
            slug: f.properties.name?.toLowerCase().replace(/\s+/g, '-'),
            ava_id: f.properties.ava_id
          }))
        );
        
        // Find the AVA matching the slug
        const ava = data.features.find(f => {
          const name = f.properties.name || f.properties.ava_name || f.properties.ava_id;
          if (!name) return false;
          const featureSlug = name.toLowerCase().replace(/\s+/g, '-');
          console.log(`Comparing: "${featureSlug}" === "${avaSlug}"`, featureSlug === avaSlug);
          return featureSlug === avaSlug;
        });

        if (ava) {
          console.log(`✓ Found AVA: ${ava.properties.name}`);
          setAvaFeature(ava);
        } else {
          console.error(`✗ AVA not found: ${avaSlug}`);
          console.error('Available slugs:', data.features.map(f => 
            f.properties.name?.toLowerCase().replace(/\s+/g, '-')
          ));
          setError(`AVA not found: ${avaSlug}`);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading AVA data:', err);
        setError(`Error loading AVA data: ${err.message}`);
        setLoading(false);
      });
  }, [stateName, avaSlug]);

  // Loading state
  if (loading) {
    return (
      <div className="state-page">
        <header className="state-header">
          <nav className="state-breadcrumb">
            <Link to="/" className="breadcrumb-link">TERRANTHRO</Link>
            <span className="breadcrumb-separator">→</span>
            <Link to="/" className="breadcrumb-link">UNITED STATES</Link>
            <span className="breadcrumb-separator">→</span>
            <Link to={`/states/${stateName}`} className="breadcrumb-link">
              {stateDisplay.toUpperCase()}
            </Link>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-current">LOADING...</span>
          </nav>
        </header>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Loading AVA data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !avaFeature) {
    return (
      <div className="state-page">
        <header className="state-header">
          <nav className="state-breadcrumb">
            <Link to="/" className="breadcrumb-link">TERRANTHRO</Link>
            <span className="breadcrumb-separator">→</span>
            <Link to="/" className="breadcrumb-link">UNITED STATES</Link>
            <span className="breadcrumb-separator">→</span>
            <Link to={`/states/${stateName}`} className="breadcrumb-link">
              {stateDisplay.toUpperCase()}
            </Link>
          </nav>
        </header>
        <section className="state-intro">
          <h1>AVA NOT FOUND</h1>
          <p className="intro-text">
            The AVA "{avaSlug}" was not found in {stateDisplay}.
          </p>
          <Link to={`/states/${stateName}`} className="back-link">
            ← Back to {stateDisplay}
          </Link>
        </section>
      </div>
    );
  }

  // Extract AVA properties
  const avaName = avaFeature.properties.name || avaFeature.properties.ava_name || 'Unknown AVA';
  const avaState = avaFeature.properties.state || stateDisplay.toUpperCase();
  const avaCreated = avaFeature.properties.created || null;

  return (
    <div className="state-page">
      {/* Breadcrumb Navigation */}
      <header className="state-header">
        <nav className="state-breadcrumb">
          <Link to="/" className="breadcrumb-link">TERRANTHRO</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to="/" className="breadcrumb-link">UNITED STATES</Link>
          <span className="breadcrumb-separator">→</span>
          <Link to={`/states/${stateName}`} className="breadcrumb-link">
            {stateDisplay.toUpperCase()}
          </Link>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{avaName.toUpperCase()}</span>
        </nav>
      </header>

      {/* AVA Info Section */}
      <section className="state-intro">
        <h1>{avaName.toUpperCase()}</h1>
        <p className="intro-text">
          {avaFeature.properties.petitioner 
            ? `Petitioned by ${avaFeature.properties.petitioner}` 
            : 'American Viticultural Area'}
        </p>

        {/* Stats Panel */}
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-label">State</span>
            <span className="stat-value">{avaState}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Established</span>
            <span className="stat-value">
              {avaCreated ? new Date(avaCreated).getFullYear() : 'TBD'}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">County</span>
            <span className="stat-value">
              {avaFeature.properties.county || 'TBD'}
            </span>
          </div>
        </div>
      </section>

      {/* 3D Terrain Map Section */}
      <section className="state-map-section">
        <div className="state-map-container" style={{ height: '700px', position: 'relative' }}>
          <MapLibreAVAViewer avaFeature={avaFeature} />
          <LayerPanel />
        </div>
      </section>

      {/* Back Link */}
      <footer className="state-footer">
        <Link to={`/states/${stateName}`} className="back-link">← Back to {stateDisplay}</Link>
      </footer>
    </div>
  );
};

export default AVAPage;
