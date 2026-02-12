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
      <div className="ava-page loading">
        <p>Loading AVA...</p>
      </div>
    );
  }

  if (error || !avaData) {
    return (
      <div className="ava-page error">
        <h1>AVA Not Found</h1>
        <p>{error || 'The requested AVA could not be found.'}</p>
        <Link to={`/states/${stateName}`}>← Back to {stateName}</Link>
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
          to={`/states/${stateName}`}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#FFFEF7',
            color: '#2B2B2B',
            padding: '10px 16px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          ← Back to {stateName.charAt(0).toUpperCase() + stateName.slice(1)}
        </Link>

        <div 
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#FFFEF7',
            color: '#2B2B2B',
            padding: '12px 24px',
            borderRadius: '6px',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '18px',
            fontWeight: '700',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {avaName}
        </div>
      </div>
    </div>
  );
};

export default AVAPage;
