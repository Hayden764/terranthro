// Example integration in MapLibreAVAViewer.jsx

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import TerrainControlsPanel from './TerrainControlsPanel';
import ClimateLayer from './ClimateLayer';
import ClimateControls from './ClimateControls';

const MapLibreAVAViewer = ({ avaData, avaName }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Terrain controls state
  const [terrainEnabled, setTerrainEnabled] = useState(true);
  const [currentPitch, setCurrentPitch] = useState(60);
  const [currentBearing, setCurrentBearing] = useState(0);
  
  // Climate layer state
  const [climateVisible, setClimateVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // Current month

  // ...existing map initialization code...

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }} 
      />

      {/* Climate Layer - manages data on map */}
      {mapRef.current && (
        <ClimateLayer
          map={mapRef.current}
          avaName={avaName}
          isVisible={climateVisible}
          currentMonth={currentMonth}
        />
      )}

      {/* Terrain Controls Panel - top right */}
      <TerrainControlsPanel
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onToggleTerrain={handleToggleTerrain}
        onBearingChange={handleBearingChange}
        onPitchChange={handlePitchChange}
        terrainEnabled={terrainEnabled}
        currentBearing={currentBearing}
        currentPitch={currentPitch}
      />

      {/* Climate Controls - bottom left */}
      <ClimateControls
        isVisible={climateVisible}
        onToggle={setClimateVisible}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />
    </div>
  );
};

export default MapLibreAVAViewer;
