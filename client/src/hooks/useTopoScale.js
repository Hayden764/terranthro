import { useState, useCallback, useRef } from 'react';
import { getTopoStatsUrl } from '../components/maps/shared/topographyConfig';

/**
 * useTopoScale
 * Fetches Titiler COG statistics for a topography layer and returns
 * a rescale string + displayMin/Max for the scale bar.
 *
 * Unlike useClimateScale (which uses viewport bbox), topo stats are
 * fetched over the full raster — giving true AVA-wide min/max elevation.
 *
 * @param {string|null} avaSlug   - AVA URL slug (e.g. "dundee-hills")
 * @param {string|null} layerType - 'elevation' | 'slope' | 'aspect', or null when inactive
 */
const useTopoScale = (avaSlug, layerType) => {
  const [rescale, setRescale]       = useState(null);
  const [displayMin, setDisplayMin] = useState(null);
  const [displayMax, setDisplayMax] = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);

  // Track last fetched slug+layer so we don't re-fetch for the same pair
  const lastFetchedRef = useRef(null);

  const fetchStats = useCallback(async (slug, layer) => {
    if (!slug || !layer) return;

    // Aspect is always 0–360° by definition — no stats fetch needed
    if (layer === 'aspect') {
      setRescale('0,360');
      setDisplayMin(0);
      setDisplayMax(360);
      return;
    }

    const key = `${slug}__${layer}`;
    if (lastFetchedRef.current === key) return; // already fetched

    const statsUrl = getTopoStatsUrl(slug, layer);
    if (!statsUrl) return;

    setIsLoading(true);
    setError(null);
    lastFetchedRef.current = key;

    try {
      console.log(`📐 useTopoScale: fetching stats for ${slug} / ${layer}`);
      const response = await fetch(statsUrl);

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Titiler stats failed (${response.status}): ${body.slice(0, 200)}`);
      }

      const data = await response.json();
      const bandKey = Object.keys(data)[0];
      const bandStats = data[bandKey];
      if (!bandStats) throw new Error('Empty stats response');

      // Use true min/max — elevation and slope are physically bounded raw data
      const rawMin = bandStats.min;
      const rawMax = bandStats.max;

      if (rawMin === undefined || rawMax === undefined) {
        throw new Error('Missing min / max in stats response');
      }

      const min = parseFloat(rawMin.toFixed(1));
      const max = parseFloat(rawMax.toFixed(1));

      console.log(`✅ useTopoScale: ${layer} range = ${min} → ${max}`);
      setRescale(`${min},${max}`);
      setDisplayMin(min);
      setDisplayMax(max);
    } catch (err) {
      console.error('useTopoScale: fetch failed', err);
      setError(err.message);
      lastFetchedRef.current = null; // allow retry
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onActivate = useCallback((slug, layer) => {
    fetchStats(slug, layer);
  }, [fetchStats]);

  const onDeactivate = useCallback(() => {
    lastFetchedRef.current = null;
    setRescale(null);
    setDisplayMin(null);
    setDisplayMax(null);
    setError(null);
  }, []);

  const autoAdjust = useCallback(() => {
    lastFetchedRef.current = null; // force re-fetch
    fetchStats(avaSlug, layerType);
  }, [fetchStats, avaSlug, layerType]);

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

export default useTopoScale;
