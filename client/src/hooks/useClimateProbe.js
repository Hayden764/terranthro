import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getTitilerPointUrl,
  getIndexTitilerPointUrl,
  WINKLER_LABELS,
  HUGLIN_LABELS,
} from '../components/maps/shared/climateConfig';

/**
 * useClimateProbe
 * Handles hover (live value tooltip) and click (pinned point modal)
 * for the Probe tool. Works across all layer types:
 *   • PRISM monthly normals  (prismVar + month)
 *   • Index continuous        (indexConfig.fileSlug + year)
 *   • Index classified        (same, but returns integer class → resolved to label)
 *
 * @param {Object}       map          - MapLibre map instance (or null)
 * @param {boolean}      probeEnabled - Only attaches listeners when true
 * @param {string|null}  prismVar     - Active PRISM variable e.g. "tdmean"
 * @param {number|null}  month        - Current month (1-12), null for index layers
 * @param {Object|null}  indexConfig  - INDEX_LAYER_TYPES entry, null for PRISM
 * @param {number}       year         - Vintage year for index layers
 */
const useClimateProbe = (map, probeEnabled, prismVar, month, indexConfig = null, year = 2025) => {
  const [hoverValue, setHoverValue] = useState(null);
  const [hoverLabel, setHoverLabel] = useState(null);   // class label for classified layers
  const [hoverScreenPos, setHoverScreenPos] = useState(null);
  const [hoverCoords, setHoverCoords] = useState(null);

  const [pinnedValue, setPinnedValue] = useState(null);
  const [pinnedLabel, setPinnedLabel] = useState(null);
  const [pinnedCoords, setPinnedCoords] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Resolve a raw integer class value to a human-readable label
  const resolveClassLabel = useCallback((rawVal) => {
    if (!indexConfig?.isClassified || rawVal === null) return null;
    const classKey = Math.round(rawVal);
    if (indexConfig.colormapData === 'winkler') return WINKLER_LABELS[classKey] || null;
    if (indexConfig.colormapData === 'huglin')  return HUGLIN_LABELS[classKey]  || null;
    return null;
  }, [indexConfig]);

  const fetchPointValue = useCallback(async (lng, lat) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      let url;
      if (indexConfig) {
        url = getIndexTitilerPointUrl(indexConfig.fileSlug, year, lng, lat);
      } else {
        if (!prismVar || !month) return { val: null, label: null };
        url = getTitilerPointUrl(prismVar, month, lng, lat);
      }

      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) return { val: null, label: null };
      const data = await res.json();
      const raw = data?.values?.[0];
      if (raw === undefined || raw === null) return { val: null, label: null };

      const val = parseFloat(raw.toFixed(2));
      const label = resolveClassLabel(val);
      return { val, label };
    } catch (e) {
      if (e.name === 'AbortError') return { val: null, label: null };
      console.warn('useClimateProbe: point fetch failed', e);
      return { val: null, label: null };
    }
  }, [prismVar, month, indexConfig, year, resolveClassLabel]);

  // Attach/detach map event listeners based on probeEnabled
  useEffect(() => {
    if (!map || !probeEnabled) {
      setHoverValue(null);
      setHoverLabel(null);
      setHoverScreenPos(null);
      setHoverCoords(null);
      return;
    }

    const onMouseMove = (e) => {
      const { lng, lat } = e.lngLat;
      setHoverScreenPos({ x: e.point.x, y: e.point.y });
      setHoverCoords({ lng, lat });

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const { val, label } = await fetchPointValue(lng, lat);
        setHoverValue(val);
        setHoverLabel(label);
      }, 80);
    };

    const onMouseLeave = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setHoverValue(null);
      setHoverLabel(null);
      setHoverScreenPos(null);
      setHoverCoords(null);
    };

    const onClick = async (e) => {
      const { lng, lat } = e.lngLat;
      const { val, label } = await fetchPointValue(lng, lat);
      if (val !== null) {
        setPinnedValue(val);
        setPinnedLabel(label);
        setPinnedCoords({ lng, lat });
        setIsPinModalOpen(true);
      }
    };

    map.on('mousemove', onMouseMove);
    map.on('mouseout', onMouseLeave);
    map.on('click', onClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('mousemove', onMouseMove);
      map.off('mouseout', onMouseLeave);
      map.off('click', onClick);
      map.getCanvas().style.cursor = '';
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [map, probeEnabled, fetchPointValue]);

  const clearPin = useCallback(() => {
    setPinnedValue(null);
    setPinnedLabel(null);
    setPinnedCoords(null);
    setIsPinModalOpen(false);
  }, []);

  return {
    hoverValue,
    hoverLabel,
    hoverScreenPos,
    hoverCoords,
    pinnedValue,
    pinnedLabel,
    pinnedCoords,
    isPinModalOpen,
    clearPin,
  };
};

export default useClimateProbe;
