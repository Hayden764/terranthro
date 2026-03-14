import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMapContext } from '../context/MapContext';
import { getStateConfig } from '../config/stateConfig';
import MapLibreAVAViewer from '../components/maps/MapLibreAVAViewer';
import '../styles/globals.css';

const AVAPage = () => {
  const { stateName, avaSlug } = useParams();
  const navigate = useNavigate();
  const [avaData, setAvaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avaName, setAvaName] = useState('');

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const { setSelectedAVA, setCurrentLevel } = useMapContext();

  const stateConfig = getStateConfig(stateName);

  useEffect(() => {
    if (!stateConfig || !stateConfig.avaFile) {
      setLoading(false);
      setError('State configuration not found');
      return;
    }

    fetch(stateConfig.avaFile)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Find the specific AVA by slug
        const avaFeature = data.features.find(f => {
          const name = f.properties.name || '';
          const slug = name.toLowerCase().replace(/\s+/g, '-');
          return slug === avaSlug;
        });

        if (avaFeature) {
          setAvaName(avaFeature.properties.name);
          setAvaData({
            type: 'FeatureCollection',
            features: [avaFeature]
          });
        } else {
          setError('AVA not found');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading AVA:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [stateName, avaSlug, stateConfig]);

  useEffect(() => {
    if (avaData) {
      setCurrentLevel('ava');
      setSelectedAVA(avaData);
    }
  }, [avaData]);

  if (loading) {
    return (
      <div className="ava-page loading" style={{ background: 'var(--scene-bg)', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-on-glass)' }}>
        <p>Loading AVA...</p>
      </div>
    );
  }

  if (error || !avaData) {
    return (
      <div className="ava-page error" style={{ background: 'var(--scene-bg)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--text-on-glass)' }}>
        <h1>AVA Not Found</h1>
        <p style={{ color: 'var(--text-on-glass-muted)' }}>{error || 'The requested AVA could not be found.'}</p>
        <Link to={`/${stateName}`} style={{ color: 'var(--primary-burgundy)' }}>← Back to {stateName}</Link>
      </div>
    );
  }

  return (
    <div className="ava-page">
      <div className="ava-map-container" style={{ position: 'relative', width: '100%', height: '100vh' }}>
        <MapLibreAVAViewer 
          avaData={avaData}
          avaName={avaName}
        />

        <Link 
          to={`/${stateName}`}
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
          title={`Back to ${stateName.charAt(0).toUpperCase() + stateName.slice(1)}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        <div 
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--glass-bg-medium)',
            backdropFilter: 'var(--glass-blur-light)',
            WebkitBackdropFilter: 'var(--glass-blur-light)',
            color: 'var(--text-on-glass)',
            padding: isMobile ? '8px 16px' : '12px 24px',
            borderRadius: '10px',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: isMobile ? '13px' : '18px',
            fontWeight: '700',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow-sm)',
            zIndex: 1000,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            maxWidth: isMobile ? 'calc(100vw - 120px)' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {avaName}
        </div>
      </div>
    </div>
  );
};

export default AVAPage;
