import { useEffect, useRef } from 'react';
import { useMapContext } from '../../context/MapContext';

const AVAMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { selectedAVA } = useMapContext();

  useEffect(() => {
    if (mapContainer.current && !map.current && selectedAVA) {
      const container = mapContainer.current;
      container.style.background = 'linear-gradient(135deg, #8B9F3D 0%, #C41E3A 100%)';
      container.style.position = 'relative';

      const mapPlaceholder = document.createElement('div');
      mapPlaceholder.innerHTML = `
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: var(--base-white);
        ">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🏔️</div>
          <h2 style="font-family: var(--font-display); margin-bottom: 0.5rem; font-size: var(--text-3xl);">
            ${selectedAVA.name}
          </h2>
          <p style="font-size: var(--text-xl); margin-bottom: 2rem; opacity: 0.9;">
            3D Terroir Visualization
          </p>
          <div style="
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            margin: 2rem auto;
            max-width: 400px;
          ">
            <h3 style="margin-bottom: 1rem; font-size: var(--text-lg);">Available Data Layers</h3>
            <div style="display: grid; gap: 0.5rem; text-align: left;">
              <div>🌡️ Climate & Temperature</div>
              <div>🏔️ Elevation & Topography</div>
              <div>🌱 Soil Properties</div>
              <div>💨 Wind Patterns</div>
              <div>🪨 Geological Structure</div>
            </div>
          </div>
          <p style="font-size: var(--text-sm); opacity: 0.8; margin-top: 2rem;">
            This will be a 3D CesiumJS view with detailed terroir data layers
          </p>
        </div>
      `;

      container.appendChild(mapPlaceholder);
      map.current = { container };
    }
  }, [selectedAVA]);

  if (!selectedAVA) {
    return <div>Loading AVA view...</div>;
  }

  return (
    <div 
      ref={mapContainer} 
      className="map" 
      style={{ 
        width: '100%', 
        height: '100vh'
      }} 
    />
  );
};

export default AVAMap;
