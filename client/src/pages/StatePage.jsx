import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getStateConfig } from '../config/stateConfig';
import { useMapContext } from '../context/MapContext';
import MapLibreStateMap from '../components/maps/MapLibreStateMap';
import AVAListPanel from '../components/layers/AVAListPanel';
import '../styles/globals.css';

const StatePage = () => {
  const { stateName } = useParams();
  const [listData, setListData] = useState(null);   // no geometry — for AVAListPanel
  const [avaData, setAvaData] = useState(null);     // with geometry — for MapLibreStateMap
  const [listLoading, setListLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [error, setError] = useState(null);
  const avaHoverHandlerRef = useRef(null);

  const { setSelectedState, setCurrentLevel } = useMapContext();
  const stateConfig = getStateConfig(stateName);

  useEffect(() => {
    if (!stateConfig) {
      setListLoading(false);
      setMapLoading(false);
      return;
    }

    setListLoading(true);
    setMapLoading(true);
    setError(null);
    setListData(null);
    setAvaData(null);

    const abbrev = stateConfig.abbreviation;

    // Fetch list data first (no geometry — fast)
    fetch(`/api/avas/state/${abbrev}?geometry=false`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setListData(data);
        setListLoading(false);
      })
      .catch(err => {
        console.error(`Error loading AVA list for ${stateConfig.name}:`, err);
        setError(err.message);
        setListLoading(false);
      });

    // Fetch full geometry for the map (slower, larger)
    fetch(`/api/avas/state/${abbrev}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        setAvaData(data);
        setMapLoading(false);
      })
      .catch(err => {
        console.error(`Error loading AVA geometry for ${stateConfig.name}:`, err);
        setMapLoading(false);
      });
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
        
        {!listLoading && !error && listData && (
          <AVAListPanel
            avaData={listData}
            stateName={stateName}
            onAVAHover={(name, hover) => avaHoverHandlerRef.current?.(name, hover)}
          />
        )}

        {/* Back to National Map Button */}
        <Link 
          to="/"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--glass-bg-medium)',
            backdropFilter: 'var(--glass-blur-light)',
            WebkitBackdropFilter: 'var(--glass-blur-light)',
            color: 'var(--text-on-glass)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            zIndex: 1000,
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
          title="Back to US Map"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        {/* Loading State */}
        {(listLoading || mapLoading) && (
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
        {!listLoading && !mapLoading && !error && !listData && (
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
