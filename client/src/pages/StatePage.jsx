import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getStateConfig } from '../config/stateConfig';
import { useMapContext } from '../context/MapContext';
import MapLibreStateMap from '../components/maps/MapLibreStateMap';
import AVAListPanel from '../components/layers/AVAListPanel';
import '../styles/globals.css';

const StatePage = () => {
  const { stateName } = useParams();
  const [avaData, setAvaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const avaHoverHandlerRef = useRef(null);
  
  const { setSelectedState, setCurrentLevel } = useMapContext();
  const stateConfig = getStateConfig(stateName);  useEffect(() => {
    if (!stateConfig) {
      setLoading(false);
      return;
    }

    if (stateConfig.avaFile) {
      setLoading(true);
      setError(null);
      
      console.log(`Loading AVAs for ${stateConfig.name}:`, stateConfig.avaFile);
      
      fetch(stateConfig.avaFile)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          return res.json();
        })
        .then(data => {
          console.log(`✅ Loaded ${data.features?.length || 0} AVAs for ${stateConfig.name}`);
          setAvaData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(`❌ Error loading AVAs for ${stateConfig.name}:`, err);
          setError(err.message);
          setLoading(false);
        });
    } else {
      console.log(`No AVA data available for ${stateConfig.name}`);
      setAvaData(null);
      setLoading(false);
    }
  }, [stateName, stateConfig]);

  useEffect(() => {
    setCurrentLevel('state');
    if (stateConfig) {
      setSelectedState(stateConfig);
    }
  }, [stateName]);

  if (!stateConfig) {
    return (
      <div className="state-page">
        <div className="state-not-found">
          <h1>State Not Found</h1>
          <p>The state "{stateName}" was not found.</p>
          <Link to="/">← Back to National Map</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="state-page">
      <div className="state-map-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <MapLibreStateMap 
          stateConfig={stateConfig}
          avaData={avaData}
          onAVAHoverHandler={(handler) => { avaHoverHandlerRef.current = handler; }}
        />
        
        {!loading && !error && avaData && (
          <AVAListPanel
            avaData={avaData}
            stateName={stateName}
            onAVAHover={(name, hover) => avaHoverHandlerRef.current?.(name, hover)}
          />
        )}

        {/* Back to National Map Button */}
        <Link 
          to="/" 
          className="back-button"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'var(--glass-bg-medium)',
            backdropFilter: 'var(--glass-blur-light)',
            WebkitBackdropFilter: 'var(--glass-blur-light)',
            color: 'var(--text-on-glass)',
            padding: '10px 16px',
            borderRadius: '10px',
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow-sm)',
            zIndex: 1000
          }}
        >
          ← Back to US Map
        </Link>

        {/* Loading State */}
        {loading && (
          <div 
            style={{
              position: 'absolute',
              bottom: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--glass-bg-medium)',
              backdropFilter: 'var(--glass-blur-light)',
              WebkitBackdropFilter: 'var(--glass-blur-light)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-on-glass)',
              padding: '16px 32px',
              borderRadius: '12px',
              boxShadow: 'var(--glass-shadow-sm)',
              zIndex: 1000,
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            Loading AVA data...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div 
            style={{
              position: 'absolute',
              bottom: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(196, 30, 58, 0.18)',
              backdropFilter: 'var(--glass-blur-light)',
              WebkitBackdropFilter: 'var(--glass-blur-light)',
              border: '1px solid rgba(196, 30, 58, 0.35)',
              color: 'rgba(255, 150, 150, 0.95)',
              padding: '16px 32px',
              borderRadius: '12px',
              boxShadow: 'var(--glass-shadow-sm)',
              zIndex: 1000,
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              maxWidth: '400px',
              textAlign: 'center'
            }}
          >
            Failed to load AVA data: {error}
          </div>
        )}

        {/* No AVA Data State */}
        {!loading && !error && !avaData && (
          <div 
            style={{
              position: 'absolute',
              bottom: '40%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--glass-bg-medium)',
              backdropFilter: 'var(--glass-blur-light)',
              WebkitBackdropFilter: 'var(--glass-blur-light)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-on-glass-muted)',
              padding: '16px 32px',
              borderRadius: '12px',
              boxShadow: 'var(--glass-shadow-sm)',
              zIndex: 1000,
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              textAlign: 'center'
            }}
          >
            No AVA data available for {stateConfig.name}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatePage;
