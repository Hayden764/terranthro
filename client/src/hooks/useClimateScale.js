import { useState, useCallback, useRef } from 'react';
import { getTitilerStatsUrl } from '../components/maps/shared/climateConfig';

/**
 * useClimateScale
 * Manages adaptive rescale state for a climate COG layer.
 *
 * - On first activation, auto-adjusts to viewport percentiles (p2/p98)
 * - "Auto Adjust" button re-fires the same fetch on demand
 * - Returns the current rescale string + display min/max for the legend
 *
 * @param {Object} map        - MapLibre map instance (or null)
 * @param {string} avaName    - AVA slug e.g. "dundee-hills"
 * @param {number} month      - Current month (1-12)
 * @param {boolean} isActive  - Whether the climate layer is currently on
 */
const useClimateScale = (map, avaName, prismVar, month, isActive) => {
  const [rescale, setRescale] = useState(null);
  const [displayMin, setDisplayMin] = useState(null);
  const [displayMax, setDisplayMax] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasAutoAdjustedRef = useRef(false);

  const fetchAndApplyScale = useCallback(async () => {
    if (!map || !avaName || !prismVar || !month) return;

    setIsLoading(true);
    setError(null);

    try {
      const bounds = map.getBounds();
      // Use numeric values — URLSearchParams will stringify them cleanly
      const bbox = [
        parseFloat(bounds.getWest().toFixed(6)),
        parseFloat(bounds.getSouth().toFixed(6)),
        parseFloat(bounds.getEast().toFixed(6)),
        parseFloat(bounds.getNorth().toFixed(6))
      ].join(',');

      const statsUrl = getTitilerStatsUrl(avaName, prismVar, month, bbox);
      console.log('🔍 Fetching Titiler stats:', statsUrl);
      console.log('🗺️  Viewport bbox:', bbox);

      const response = await fetch(statsUrl);

      if (!response.ok) {
        const body = await response.text();
        console.error('Titiler stats error body:', body);
        throw new Error(`Titiler stats failed (${response.status})`);
      }

      const data = await response.json();
      console.log('📊 Titiler stats response:', data);

      // Titiler /cog/statistics returns { "b1": { "percentile_2": ..., "percentile_98": ... } }
      const bandKey = Object.keys(data)[0];
      const bandStats = data[bandKey];
      if (!bandStats) throw new Error('Empty stats response');

      const p2  = bandStats.percentile_2;
      const p98 = bandStats.percentile_98;

      if (p2 === undefined || p98 === undefined) {
        throw new Error('Missing percentile_2 / percentile_98 in response');
      }

      if (p98 <= p2) {
        throw new Error(`Invalid percentile range: p2=${p2} p98=${p98} — viewport may have no valid data`);
      }

      const min = parseFloat(p2.toFixed(2));
      const max = parseFloat(p98.toFixed(2));

      console.log(`✅ Auto Adjust: rescale=${min},${max} (was viewport-accurate with max_size=256)`);
      setRescale(`${min},${max}`);
      setDisplayMin(min);
      setDisplayMax(max);
    } catch (err) {
      console.error('useClimateScale: fetch failed', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [map, avaName, prismVar, month]);

  const onActivate = useCallback(() => {
    if (!hasAutoAdjustedRef.current) {
      hasAutoAdjustedRef.current = true;
      fetchAndApplyScale();
    }
  }, [fetchAndApplyScale]);

  const onDeactivate = useCallback(() => {
    hasAutoAdjustedRef.current = false;
    setRescale(null);
    setDisplayMin(null);
    setDisplayMax(null);
    setError(null);
  }, []);

  const autoAdjust = useCallback(() => {
    fetchAndApplyScale();
  }, [fetchAndApplyScale]);

  return {
    rescale,
    displayMin,
    displayMax,
    isLoading,
    error,
    autoAdjust,
    onActivate,
    onDeactivate,
  };
};

export default useClimateScale;
