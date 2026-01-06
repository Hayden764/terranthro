import { useEffect, useRef, useState } from 'react';
import { useMapContext } from '../../context/MapContext';

const NationalMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [isMapboxLoaded, setIsMapboxLoaded] = useState(false);
  const { navigateToState } = useMapContext();

  // Mock data for US states with wine production
  const mockStates = [
    { 
      id: 1, 
      name: 'California', 
      abbreviation: 'CA', 
      tons_crushed: 3500000,
      centroid: { coordinates: [-119.4179, 36.7783] }
    },
    { 
      id: 2, 
      name: 'Oregon', 
      abbreviation: 'OR', 
      tons_crushed: 85000,
      centroid: { coordinates: [-120.5542, 43.8041] }
    },
    { 
      id: 3, 
      name: 'Washington', 
      abbreviation: 'WA', 
      tons_crushed: 270000,
      centroid: { coordinates: [-120.7401, 47.7511] }
    },
    { 
      id: 4, 
      name: 'New York', 
      abbreviation: 'NY', 
      tons_crushed: 52000,
      centroid: { coordinates: [-75.5268, 43.2994] }
    }
  ];

  useEffect(() => {
    // For now, create a simple placeholder map
    if (mapContainer.current && !map.current) {
      const container = mapContainer.current;
      container.style.background = 'linear-gradient(135deg, #FFFEF7 0%, #F0F0F0 100%)';
      container.style.position = 'relative';
      container.style.overflow = 'hidden';

      // Add a simple US outline placeholder
      const mapPlaceholder = document.createElement('div');
      mapPlaceholder.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: var(--text-gray);
        ">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
          <h2 style="font-family: var(--font-display); margin-bottom: 0.5rem; color: var(--text-charcoal);">
            TERRANTHRO
          </h2>
          <p style="font-size: var(--text-lg); margin-bottom: 2rem;">
            Progressive Multi-Scale Terroir Visualization
          </p>
          <div style="
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            max-width: 400px;
            margin: 0 auto;
          ">
            ${mockStates.map(state => `
              <button 
                onclick="window.selectState(${state.id})"
                style="
                  padding: 1rem;
                  background: var(--base-white);
                  border: 2px solid var(--border-gray);
                  border-radius: 8px;
                  cursor: pointer;
                  transition: all var(--transition-base);
                  text-align: center;
                "
                onmouseover="this.style.borderColor='var(--primary-burgundy)'; this.style.transform='translateY(-2px)'"
                onmouseout="this.style.borderColor='var(--border-gray)'; this.style.transform='translateY(0)'"
              >
                <div style="font-weight: bold; color: var(--text-charcoal); margin-bottom: 0.25rem;">
                  ${state.name}
                </div>
                <div style="font-size: var(--text-sm); color: var(--text-gray);">
                  ${(state.tons_crushed / 1000).toLocaleString()}K tons
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.appendChild(mapPlaceholder);

      // Global function to handle state selection
      window.selectState = (stateId) => {
        const state = mockStates.find(s => s.id === stateId);
        if (state) {
          navigateToState(state);
        }
      };

      map.current = { container };
    }

    return () => {
      if (window.selectState) {
        delete window.selectState;
      }
    };
  }, [navigateToState]);

  return (
    <div 
      ref={mapContainer} 
      className="map" 
      style={{ 
        width: '100%', 
        height: '100vh',
        background: 'var(--base-cream)'
      }} 
    />
  );
};

export default NationalMap;
