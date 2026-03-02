import { useState, useEffect } from 'react';

/**
 * Terrain Controls Panel Component
 * Collapsible panel with zoom, reset, terrain, bearing, and pitch controls
 * 
 * @param {Object} props
 * @param {Function} props.onZoomIn - Callback to zoom in
 * @param {Function} props.onZoomOut - Callback to zoom out
 * @param {Function} props.onResetView - Callback to reset camera view
 * @param {Function} props.onToggleTerrain - Callback when 3D terrain is toggled
 * @param {Function} props.onBearingChange - Callback when camera bearing changes
 * @param {Function} props.onPitchChange - Callback when camera pitch changes
 * @param {boolean} props.terrainEnabled - Whether 3D terrain is enabled
 * @param {number} props.currentBearing - Current camera bearing angle (0-360°)
 * @param {number} props.currentPitch - Current camera pitch angle (0-85°)
 */
const TerrainControlsPanel = ({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleTerrain,
  onBearingChange,
  onPitchChange,
  terrainEnabled = true,
  currentBearing = 0,
  currentPitch = 60
}) => {
  // Initialize expanded state from localStorage or screen size
  const [isExpanded, setIsExpanded] = useState(() => {
    const stored = localStorage.getItem('terrainControlsExpanded');
    if (stored !== null) return stored === 'true';
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  });

  // Persist expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('terrainControlsExpanded', isExpanded.toString());
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  // Convert bearing to cardinal direction
  const getCardinalDirection = (bearing) => {
    const directions = [
      'N', 'NNE', 'NE', 'ENE',
      'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW',
      'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  };

  // Collapsed state - compact button
  if (!isExpanded) {
    return (
      <button
        onClick={toggleExpanded}
        className="absolute top-20 right-4 z-50 w-12 h-12 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
        aria-label="Open terrain controls"
        aria-expanded="false"
      >
        <span className="text-xl" role="img" aria-label="Terrain">⛰️</span>
      </button>
    );
  }

  // Expanded state - full panel
  return (
    <div className="absolute top-20 right-4 z-50 w-64 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-xl p-4 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide">
          Terrain Controls
        </h3>
        <button
          onClick={toggleExpanded}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded"
          aria-label="Collapse terrain controls"
          aria-expanded="true"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
          Zoom
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={onZoomIn}
            className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-xl font-medium shadow-sm"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={onZoomOut}
            className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-xl font-medium shadow-sm"
            aria-label="Zoom out"
          >
            −
          </button>
          
          {/* Reset View Button */}
          <button
            onClick={onResetView}
            className="w-10 h-10 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 flex items-center justify-center text-lg shadow-sm ml-auto"
            aria-label="Reset view"
            title="Reset view"
          >
            ↻
          </button>
        </div>
      </div>

      {/* 3D Terrain Toggle */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <label className="flex items-center cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={terrainEnabled}
              onChange={(e) => onToggleTerrain(e.target.checked)}
              className="sr-only"
              aria-label="Toggle 3D terrain"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                terrainEnabled ? 'bg-teal-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  terrainEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
            3D Terrain
          </span>
        </label>
      </div>

      {/* Camera Bearing Slider - Always visible */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <label
          htmlFor="bearing-slider"
          className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2"
        >
          Camera Bearing: <span className="text-teal-600 font-bold">{currentBearing}° ({getCardinalDirection(currentBearing)})</span>
        </label>
        
        <div className="space-y-1">
          <input
            id="bearing-slider"
            type="range"
            min="0"
            max="360"
            step="1"
            value={currentBearing}
            onChange={(e) => onBearingChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            style={{
              background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(currentBearing / 360) * 100}%, #e5e7eb ${(currentBearing / 360) * 100}%, #e5e7eb 100%)`
            }}
            aria-label="Camera bearing angle"
            aria-valuemin="0"
            aria-valuemax="360"
            aria-valuenow={currentBearing}
            aria-valuetext={`${currentBearing} degrees ${getCardinalDirection(currentBearing)}`}
          />
        </div>
      </div>

      {/* Camera Pitch Slider - Only visible when terrain is enabled */}
      {terrainEnabled && (
        <div className="transition-all duration-200">
          <label
            htmlFor="pitch-slider"
            className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2"
          >
            Camera Pitch: <span className="text-teal-600 font-bold">{currentPitch}°</span>
          </label>
          
          <div className="space-y-1">
            <input
              id="pitch-slider"
              type="range"
              min="0"
              max="85"
              step="1"
              value={currentPitch}
              onChange={(e) => onPitchChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(currentPitch / 85) * 100}%, #e5e7eb ${(currentPitch / 85) * 100}%, #e5e7eb 100%)`
              }}
              aria-label="Camera pitch angle"
              aria-valuemin="0"
              aria-valuemax="85"
              aria-valuenow={currentPitch}
              aria-valuetext={`${currentPitch} degrees`}
            />
            
            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>0°</span>
              <span>85°</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for slider thumb */}
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #14b8a6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default TerrainControlsPanel;
