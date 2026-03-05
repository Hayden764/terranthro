import { useState, useEffect, useRef, useCallback } from 'react';

const MEASURE_SOURCE_ID = 'measure-source';
const MEASURE_LINE_ID   = 'measure-line';
const MEASURE_DOT_ID    = 'measure-dots';

/**
 * useMapMeasure
 * Click to place waypoints on the map. Draws a geodesic line and
 * shows cumulative distance. Double-click or Escape clears the session.
 *
 * @param {Object}  map            - MapLibre map instance (or null)
 * @param {boolean} measureEnabled - Only attaches listeners when true
 * @returns {Object}
 *   points        {Array<{lng,lat}>} - Placed waypoints
 *   totalDistance {number|null}      - Total distance in km (null if < 2 points)
 *   segmentDistances {Array<number>} - Per-segment km values
 *   clearMeasure  {Function}         - Reset all points
 */
const useMapMeasure = (map, measureEnabled) => {
  const [points, setPoints] = useState([]);
  const pointsRef = useRef([]);  // keep ref in sync for use inside event handlers

  // Sync ref whenever state changes
  useEffect(() => { pointsRef.current = points; }, [points]);

  // ── Geometry helpers ──────────────────────────────────────────────────────

  /** Haversine distance between two {lng,lat} points, returns km */
  const haversine = (a, b) => {
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const sin2 = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(sin2));
  };

  const fmtKm = (km) =>
    km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(2)} km`;

  // ── Map source / layer management ─────────────────────────────────────────

  const updateMapGeometry = useCallback((pts) => {
    if (!map) return;
    try {
      const src = map.getSource(MEASURE_SOURCE_ID);
      if (!src) return;

      const lineCoords = pts.map(p => [p.lng, p.lat]);
      const dotFeatures = pts.map((p, i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: { index: i },
      }));

      src.setData({
        type: 'FeatureCollection',
        features: [
          ...(pts.length >= 2 ? [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: lineCoords },
            properties: {},
          }] : []),
          ...dotFeatures,
        ],
      });
    } catch (e) { /* map removed */ }
  }, [map]);

  const addMapLayers = useCallback(() => {
    if (!map || map.getSource(MEASURE_SOURCE_ID)) return;
    try {
      map.addSource(MEASURE_SOURCE_ID, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      // Dashed line
      map.addLayer({
        id: MEASURE_LINE_ID,
        type: 'line',
        source: MEASURE_SOURCE_ID,
        filter: ['==', '$type', 'LineString'],
        paint: {
          'line-color': '#FFB81C',
          'line-width': 2,
          'line-dasharray': [4, 3],
          'line-opacity': 0.9,
        },
      });

      // Waypoint dots
      map.addLayer({
        id: MEASURE_DOT_ID,
        type: 'circle',
        source: MEASURE_SOURCE_ID,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#FFB81C',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
          'circle-opacity': 1,
        },
      });
    } catch (e) { console.warn('useMapMeasure: layer add error', e); }
  }, [map]);

  const removeMapLayers = useCallback(() => {
    if (!map) return;
    try {
      if (map.getLayer(MEASURE_DOT_ID))    map.removeLayer(MEASURE_DOT_ID);
      if (map.getLayer(MEASURE_LINE_ID))   map.removeLayer(MEASURE_LINE_ID);
      if (map.getSource(MEASURE_SOURCE_ID)) map.removeSource(MEASURE_SOURCE_ID);
    } catch (e) { /* already gone */ }
  }, [map]);

  // ── Event listeners ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!map || !measureEnabled) {
      removeMapLayers();
      setPoints([]);
      pointsRef.current = [];
      return;
    }

    addMapLayers();
    map.getCanvas().style.cursor = 'crosshair';

    const onClick = (e) => {
      const { lng, lat } = e.lngLat;
      const next = [...pointsRef.current, { lng, lat }];
      pointsRef.current = next;
      setPoints(next);
      updateMapGeometry(next);
    };

    const onDblClick = (e) => {
      e.preventDefault();
      // double-click = finish session, clear
      pointsRef.current = [];
      setPoints([]);
      updateMapGeometry([]);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        pointsRef.current = [];
        setPoints([]);
        updateMapGeometry([]);
      }
    };

    map.on('click', onClick);
    map.on('dblclick', onDblClick);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      map.off('click', onClick);
      map.off('dblclick', onDblClick);
      window.removeEventListener('keydown', onKeyDown);
      map.getCanvas().style.cursor = '';
      removeMapLayers();
    };
  }, [map, measureEnabled, addMapLayers, removeMapLayers, updateMapGeometry]);

  // ── Derived values ────────────────────────────────────────────────────────

  const segmentDistances = points.length >= 2
    ? points.slice(1).map((p, i) => haversine(points[i], p))
    : [];

  const totalDistance = segmentDistances.length > 0
    ? segmentDistances.reduce((a, b) => a + b, 0)
    : null;

  const clearMeasure = useCallback(() => {
    setPoints([]);
    pointsRef.current = [];
    updateMapGeometry([]);
  }, [updateMapGeometry]);

  return {
    points,
    totalDistance,
    segmentDistances,
    fmtKm,
    clearMeasure,
  };
};

export default useMapMeasure;
