import { useEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';

const StateMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { selectedState, navigateToAVA } = useMapContext();

  // Mock AVA data for the selected state
  const mockAVAs = {
    1: [ // California
      { id: 15, name: 'Napa Valley', tons_crushed: 150000, centroid: { coordinates: [-122.2869, 38.5025] } },
      { id: 16, name: 'Sonoma County', tons_crushed: 200000, centroid: { coordinates: [-122.9074, 38.5816] } },
      { id: 17, name: 'Paso Robles', tons_crushed: 75000, centroid: { coordinates: [-120.6906, 35.6269] } },
      { id: 18, name: 'Santa Barbara County', tons_crushed: 45000, centroid: { coordinates: [-120.0357, 34.5794] } }
    ],
    2: [ // Oregon
      { id: 19, name: 'Willamette Valley', tons_crushed: 65000, centroid: { coordinates: [-123.0231, 44.9429] } },
      { id: 20, name: 'Southern Oregon', tons_crushed: 15000, centroid: { coordinates: [-123.3307, 42.4403] } }
    ],
    3: [ // Washington
      { id: 21, name: 'Columbia Valley', tons_crushed: 180000, centroid: { coordinates: [-119.2728, 46.2396] } },
      { id: 22, name: 'Walla Walla Valley', tons_crushed: 25000, centroid: { coordinates: [-118.3302, 46.0645] } }
    ]
  };

  useEffect(() => {
    if (mapContainer.current && !map.current && selectedState) {
      const container = mapContainer.current;
      container.style.background = 'linear-gradient(135deg, #FFFEF7 0%, #F0F0F0 100%)';
      container.style.position = 'relative';

      const avas = mockAVAs[selectedState.id] || [];

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
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🍇</div>
          <h2 style="font-family: var(--font-display); margin-bottom: 0.5rem; color: var(--text-charcoal);">
            ${selectedState.name}
          </h2>
          <p style="font-size: var(--text-lg); margin-bottom: 2rem; color: var(--text-gray);">
            American Viticultural Areas
          </p>
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            max-width: 600px;
            margin: 0 auto;
          ">
            ${avas.map(ava => `
              <button 
                onclick="window.selectAVA(${ava.id})"
                style="
                  padding: 1.5rem;
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
                <div style="font-weight: bold; color: var(--text-charcoal); margin-bottom: 0.5rem;">
                  ${ava.name}
                </div>
                <div style="font-size: var(--text-sm); color: var(--text-gray);">
                  ${(ava.tons_crushed / 1000).toLocaleString()}K tons
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.appendChild(mapPlaceholder);

      // Global function to handle AVA selection
      window.selectAVA = (avaId) => {
        const ava = avas.find(a => a.id === avaId);
        if (ava) {
          navigateToAVA(ava);
        }
      };

      map.current = { container };
    }

    return () => {
      if (window.selectAVA) {
        delete window.selectAVA;
      }
    };
  }, [selectedState, navigateToAVA]);

  if (!selectedState) {
    return <div>Loading state view...</div>;
  }

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

export default StateMap;
