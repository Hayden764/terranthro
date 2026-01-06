/**
 * Calculate symbol size based on production volume
 * Uses square root scaling for better visual perception
 */
export const calculateSymbolSize = (tons, level) => {
  const configs = {
    national: {
      minTons: 1000,
      maxTons: 4000000,
      minSize: 12,
      maxSize: 50,
      innerRatio: 0.65
    },
    state: {
      minTons: 500,
      maxTons: 500000,
      minSize: 16,
      maxSize: 70,
      innerRatio: 0.65
    }
  };

  const config = configs[level];
  
  // Clamp tons to min/max range
  const clampedTons = Math.max(
    config.minTons,
    Math.min(tons, config.maxTons)
  );
  
  // Square root scaling for area perception
  const normalizedValue = Math.sqrt(
    (clampedTons - config.minTons) / (config.maxTons - config.minTons)
  );
  
  const outerSize = config.minSize + 
    (normalizedValue * (config.maxSize - config.minSize));
  
  const innerSize = outerSize * config.innerRatio;
  
  return {
    outer: Math.round(outerSize),
    inner: Math.round(innerSize)
  };
};
