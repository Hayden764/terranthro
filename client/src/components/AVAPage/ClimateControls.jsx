import { useState } from 'react';
import { 
  MONTH_ABBR, 
  MONTH_NAMES,
  LEGEND_TEMPS,
  LEGEND_COLORS
} from './climateConfig';

/**
 * Climate Controls Component
 * UI controls for PRISM climate layer - month slider, toggle, and legend
 * 
 * @param {Object} props
 * @param {boolean} props.isVisible - Whether climate layer is visible
 * @param {Function} props.onToggle - Callback when visibility toggled
 * @param {number} props.currentMonth - Current month (1-12)
 * @param {Function} props.onMonthChange - Callback when month changes
 */
const ClimateControls = ({
  isVisible = false,
  onToggle,
  currentMonth = 1,
  onMonthChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFahrenheit, setIsFahrenheit] = useState(false);

  // Convert Celsius to Fahrenheit
  const toFahrenheit = (celsius) => Math.round((celsius * 9/5) + 32);

  // Temperature values for legend
  const tempValues = [0, 10, 20, 30, 40]; // Celsius
  const displayTemps = isFahrenheit 
    ? tempValues.map(toFahrenheit) 
    : tempValues;

  return (
    <div className="absolute bottom-4 left-4 z-40 bg-white/95 backdrop-blur-sm border border-gray-300 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
          Climate Data (PRISM)
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} 
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3" style={{ minWidth: '280px' }}>
          {/* Toggle Switch */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Show Temperature
            </span>
            <label className="relative inline-block">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                  isVisible ? 'bg-teal-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    isVisible ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Month Slider */}
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Month: <span className="text-teal-600 font-bold">{MONTH_NAMES[currentMonth - 1]}</span>
            </label>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={currentMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((currentMonth - 1) / 11) * 100}%, #e5e7eb ${((currentMonth - 1) / 11) * 100}%, #e5e7eb 100%)`
              }}
              disabled={!isVisible}
            />
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{MONTH_ABBR[0]}</span>
              <span>{MONTH_ABBR[3]}</span>
              <span>{MONTH_ABBR[6]}</span>
              <span>{MONTH_ABBR[9]}</span>
              <span>{MONTH_ABBR[11]}</span>
            </div>
          </div>

          {/* Legend */}
          {isVisible && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Temperature
                </div>
                {/* Celsius/Fahrenheit Toggle */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setIsFahrenheit(false)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      !isFahrenheit 
                        ? 'bg-teal-500 text-white font-medium' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    °C
                  </button>
                  <button
                    onClick={() => setIsFahrenheit(true)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      isFahrenheit 
                        ? 'bg-teal-500 text-white font-medium' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    °F
                  </button>
                </div>
              </div>
              {/* Continuous gradient bar with new color scheme */}
              <div 
                className="w-full h-6 rounded-sm mb-1"
                style={{
                  background: 'linear-gradient(to right, #2813ED 0%, #13EDED 25%, #18B445 50%, #EDED13 75%, #ED1313 100%)'
                }}
              />
              <div className="flex justify-between text-xs text-gray-600">
                {displayTemps.map((temp, idx) => (
                  <span key={idx}>{temp}°</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom slider thumb CSS */}
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

        input[type='range']:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ClimateControls;
