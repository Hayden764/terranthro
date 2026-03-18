import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import TerrainControlsPanel from "./shared/MapToolkit";
import ClimateLayer from "./shared/ClimateLayer";
import ScalePanel from "./shared/ScalePanel";
import ClimateProbeTooltip from "./shared/ClimateProbeTooltip";
import ClimatePointModal from "./shared/ClimatePointModal";
import IndexLayer from "./shared/IndexLayer";
import TopographyLayer from "./shared/TopographyLayer";
import DataLayerPanel from "./shared/DataLayerPanel";
import MobileDock from "./shared/MobileDock";
import DesktopDock from "./shared/DesktopDock";
import InfoPanel from "./shared/InfoPanel";
import useClimateScale from "../../hooks/useClimateScale";
import useClimateProbe from "../../hooks/useClimateProbe";
import useMapMeasure from "../../hooks/useMapMeasure";
import useTopoScale from "../../hooks/useTopoScale";
import { useAvaClimateStats } from "../../hooks/useAvaClimateStats";
import { CLIMATE_LAYER_TYPES, INDEX_LAYER_TYPES } from "./shared/climateConfig";
import { TOPO_LAYER_TYPES } from "./shared/topographyConfig";
import { getStateConfig } from "../../config/stateConfig";

const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

/**
 * MapLibre AVA Viewer Component
 * Displays AVA detail map with 3D terrain and interactive controls
 */
const MapLibreAVAViewer = ({ avaData }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const boundsRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const location = useLocation();
  const { stateName, avaSlug } = useParams();
  
  // Terrain controls state
  const [terrainEnabled, setTerrainEnabled] = useState(true);
  const [currentPitch, setCurrentPitch] = useState(60);
  const [currentBearing, setCurrentBearing] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Climate layer state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [activeYear, setActiveYear] = useState(2025);

  // Active map tool — 'pan' | 'probe' | 'measure'
  const [activeTool, setActiveTool] = useState('pan');

  // When layer changes, reset tool to pan
  const handleLayerChange = (layer) => {
    setActiveLayer(layer);
    setActiveTool('pan');
  };

  // AVA hover highlight — called from InfoPanel when user hovers a parent/child pill
  const hoverGeoCacheRef  = useRef({});   // slug → GeoJSON Feature
  const stateGeoJsonCache = useRef({});   // stateFile → FeatureCollection
  const currentHoverSlug  = useRef(null); // tracks the slug that "owns" the current render

  const clearHoverLayers = (map) => {
    if (map.getLayer('ava-hover-line'))  map.removeLayer('ava-hover-line');
    if (map.getLayer('ava-hover-glow'))  map.removeLayer('ava-hover-glow');
    if (map.getLayer('ava-hover-fill'))  map.removeLayer('ava-hover-fill');
    if (map.getSource('ava-hover'))      map.removeSource('ava-hover');
  };

  /**
   * Resolve an AVA feature by slug.
   * 1. Try the REST API (works when backend is running).
   * 2. Fall back to searching the current state's static GeoJSON in /data/.
   */
  const resolveAvaFeature = async (slug) => {
    // Return cached result immediately
    if (hoverGeoCacheRef.current[slug]) return hoverGeoCacheRef.current[slug];

    // ── 1. API attempt ────────────────────────────────────────────
    try {
      const res = await fetch(`/api/avas/${slug}`);
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const feature = await res.json();
          if (feature?.geometry) {
            hoverGeoCacheRef.current[slug] = feature;
            return feature;
          }
        }
      }
    } catch (_) { /* fall through */ }

    // ── 2. Static GeoJSON fallback ────────────────────────────────
    const stateConfig = getStateConfig(stateName);
    if (!stateConfig?.avaFile) return null;

    try {
      // Load + cache the whole state file (only fetched once)
      if (!stateGeoJsonCache.current[stateConfig.avaFile]) {
        const res = await fetch(stateConfig.avaFile);
        if (!res.ok) return null;
        stateGeoJsonCache.current[stateConfig.avaFile] = await res.json();
      }
      const collection = stateGeoJsonCache.current[stateConfig.avaFile];

      // Match by converting feature name → slug and comparing
      const nameToSlug = (name) => name.toLowerCase().replace(/[\s/]+/g, '_').replace(/[^a-z0-9_]/g, '');
      const feature = collection.features?.find(f => {
        const name = f.properties?.name || '';
        return nameToSlug(name) === slug || nameToSlug(name) === slug.replace(/-/g, '_');
      });

      if (feature?.geometry) {
        hoverGeoCacheRef.current[slug] = feature;
        return feature;
      }
    } catch (_) { /* silently ignore */ }

    return null;
  };

  const handleAvaHover = async (slug) => {
    const map = mapRef.current;
    if (!map) return;

    // Always clear the previous highlight immediately
    clearHoverLayers(map);
    currentHoverSlug.current = slug;

    if (!slug) return;

    try {
      const feature = await resolveAvaFeature(slug);

      // Bail if the user moved to a different item while we were fetching
      if (currentHoverSlug.current !== slug) return;
      if (!mapRef.current) return;
      if (!feature?.geometry) return;

      // Clear again before adding (guards against parallel calls)
      clearHoverLayers(map);

      map.addSource('ava-hover', { type: 'geojson', data: feature });

      // Soft fill
      map.addLayer({
        id: 'ava-hover-fill',
        type: 'fill',
        source: 'ava-hover',
        paint: { 'fill-color': '#38bdf8', 'fill-opacity': 0.10 },
      });

      // Glow
      map.addLayer({
        id: 'ava-hover-glow',
        type: 'line',
        source: 'ava-hover',
        paint: { 'line-color': '#38bdf8', 'line-width': 12, 'line-opacity': 0.20, 'line-blur': 8 },
      });

      // Crisp outline
      map.addLayer({
        id: 'ava-hover-line',
        type: 'line',
        source: 'ava-hover',
        paint: { 'line-color': '#38bdf8', 'line-width': 2.5, 'line-opacity': 1.0 },
      });
    } catch (e) {
      // silently ignore — hover is non-critical
    }
  };

  // Unified layer selection — one active layer (climate / index / topo) at a time
  const [activeLayer, setActiveLayer] = useState(null);

  // Per-layer-type colormap overrides (user-selectable)
  const [climateColormap, setClimateColormap] = useState('plasma');
  const [indexColormap, setIndexColormap] = useState('plasma');

  // Derived values from activeLayer
  const activeClimateConfig = CLIMATE_LAYER_TYPES[activeLayer] || null;
  const activeIndexConfig   = INDEX_LAYER_TYPES[activeLayer]   || null;
  const climateVisible      = activeClimateConfig !== null;
  const indexVisible        = activeIndexConfig   !== null;
  const activeTopoLayer     = TOPO_LAYER_TYPES[activeLayer] ? activeLayer : null;
  const prismVar            = activeClimateConfig?.prismVar || 'tdmean';

  // Effective colormaps — user override takes precedence, fallback to config default
  const effectiveClimateColormap = climateColormap;
  const effectiveIndexColormap   = activeIndexConfig?.isClassified
    ? null   // classified layers use JSON colormapData, no user colormap
    : indexColormap;

  // Topo layer visibility
  const topoVisible = activeTopoLayer !== null;

  // Active layer info for ScalePanel
  const anyLayerVisible = climateVisible || indexVisible || topoVisible;
  const activeTopoConfig  = topoVisible ? TOPO_LAYER_TYPES[activeTopoLayer] : null;
  const activePanelConfig = activeClimateConfig || activeIndexConfig || activeTopoConfig || null;

  // Adaptive scale for PRISM layers
  const {
    rescale: climateRescale,
    displayMin: climateMin,
    displayMax: climateMax,
    isLoading: climateScaleLoading,
    error: climateScaleError,
    autoAdjust: climateAutoAdjust,
    onActivate: onClimateScaleActivate,
    onDeactivate: onClimateScaleDeactivate,
  } = useClimateScale(mapRef.current, prismVar, currentMonth, climateVisible);

  // Adaptive scale for index layers (continuous only)
  const {
    rescale: indexRescale,
    displayMin: indexMin,
    displayMax: indexMax,
    isLoading: indexScaleLoading,
    error: indexScaleError,
    autoAdjust: indexAutoAdjust,
    onActivate: onIndexScaleActivate,
    onDeactivate: onIndexScaleDeactivate,
  } = useClimateScale(
    mapRef.current,
    null,
    null,
    indexVisible && !activeIndexConfig?.isClassified,
    activeIndexConfig,
    activeYear,
  );

  // Adaptive scale for topo layers
  const {
    rescale: topoRescale,
    displayMin: topoMin,
    displayMax: topoMax,
    isLoading: topoScaleLoading,
    error: topoScaleError,
    autoAdjust: topoAutoAdjust,
    onActivate: onTopoScaleActivate,
    onDeactivate: onTopoScaleDeactivate,
  } = useTopoScale(avaSlug, activeTopoLayer);

  // Unified scale state for ScalePanel
  const rescale       = climateVisible ? climateRescale      : topoVisible ? topoRescale      : indexRescale;
  const displayMin    = climateVisible ? climateMin          : topoVisible ? topoMin          : indexMin;
  const displayMax    = climateVisible ? climateMax          : topoVisible ? topoMax          : indexMax;
  const scaleLoading  = climateVisible ? climateScaleLoading : topoVisible ? topoScaleLoading : indexScaleLoading;
  const scaleError    = climateVisible ? climateScaleError   : topoVisible ? topoScaleError   : indexScaleError;
  const autoAdjust    = climateVisible ? climateAutoAdjust   : topoVisible ? topoAutoAdjust   : indexAutoAdjust;

  // AVA-clipped stats from Neon DB — override viewport range in ScalePanel when on an AVA page
  const LAYER_TO_DB_VAR = {
    gdd_winkler_accumulated: 'gdd_winkler',
    huglin:                  'huglin',
    gst_smarthobday:         'gst',
    ppt_growing_season_2025: 'ppt',
  };
  const dbSlug = avaSlug ? avaSlug.replace(/-/g, '_') : null;
  const { stats: avaDbStats } = useAvaClimateStats(dbSlug, 2025);
  const activeDbVarKey = activeLayer ? LAYER_TO_DB_VAR[activeLayer] : null;
  const activeDbStat   = activeDbVarKey && avaDbStats ? avaDbStats[activeDbVarKey] : null;

  // When DB stats exist: use absolute min/max so scale and map tiles match exactly.
  // effectiveRescale feeds BOTH the Titiler tile URL and the ScalePanel display.
  const effectiveRescale = activeDbStat
    ? `${parseFloat(activeDbStat.min.toFixed(2))},${parseFloat(activeDbStat.max.toFixed(2))}`
    : rescale;
  const scaleMin = activeDbStat ? activeDbStat.min : displayMin;
  const scaleMax = activeDbStat ? activeDbStat.max : displayMax;

  // Fire auto-adjust on first toggle-on; reset on toggle-off — PRISM
  const prevClimateVisibleRef = useRef(false);
  useEffect(() => {
    if (climateVisible && !prevClimateVisibleRef.current) {
      onClimateScaleActivate();
    } else if (!climateVisible && prevClimateVisibleRef.current) {
      onClimateScaleDeactivate();
    }
    prevClimateVisibleRef.current = climateVisible;
  }, [climateVisible, onClimateScaleActivate, onClimateScaleDeactivate]);

  // Fire auto-adjust on first toggle-on; reset on toggle-off — Index (continuous only)
  const prevIndexVisibleRef = useRef(false);
  useEffect(() => {
    const isContinuousIndex = indexVisible && !activeIndexConfig?.isClassified;
    if (isContinuousIndex && !prevIndexVisibleRef.current) {
      onIndexScaleActivate();
    } else if (!isContinuousIndex && prevIndexVisibleRef.current) {
      onIndexScaleDeactivate();
    }
    prevIndexVisibleRef.current = isContinuousIndex;
  }, [indexVisible, activeIndexConfig, onIndexScaleActivate, onIndexScaleDeactivate]);

  // Fire activate/deactivate when topo layer changes
  const prevTopoLayerRef = useRef(null);
  useEffect(() => {
    if (activeTopoLayer && activeTopoLayer !== prevTopoLayerRef.current) {
      onTopoScaleActivate(avaSlug, activeTopoLayer);
    } else if (!activeTopoLayer && prevTopoLayerRef.current) {
      onTopoScaleDeactivate();
    }
    prevTopoLayerRef.current = activeTopoLayer;
  }, [activeTopoLayer, avaSlug, onTopoScaleActivate, onTopoScaleDeactivate]);

  // Probe tool — works on PRISM and all index layers
  const probeEnabled = activeTool === 'probe' && anyLayerVisible;
  const {
    hoverValue,
    hoverLabel,
    hoverScreenPos,
    pinnedValue,
    pinnedLabel,
    pinnedCoords,
    isPinModalOpen,
    clearPin,
  } = useClimateProbe(
    mapRef.current,
    probeEnabled,
    climateVisible ? prismVar : null,
    climateVisible ? currentMonth : null,
    indexVisible ? activeIndexConfig : null,
    activeYear,
  );

  // Measure tool
  const measureEnabled = activeTool === 'measure' && anyLayerVisible;
  const { points: measurePoints, totalDistance, fmtKm, clearMeasure } = useMapMeasure(
    mapRef.current,
    measureEnabled,
  );

  // Disable map drag when probe or measure is active
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (activeTool === 'pan') {
      map.dragPan.enable();
      map.scrollZoom.enable();
    } else {
      map.dragPan.disable();
      // keep scroll zoom so user can still zoom
    }
  }, [activeTool]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!avaData) {
      console.warn('MapLibreAVAViewer: No avaData provided');
      return;
    }

    // Handle both full GeoJSON FeatureCollection and single Feature
    const geometry = avaData.geometry || (avaData.features && avaData.features[0]?.geometry);
    if (!geometry) {
      console.warn('MapLibreAVAViewer: No geometry found in avaData', avaData);
      return;
    }

    // Create a proper GeoJSON object for the source
    const geoJsonData = avaData.type === 'Feature' 
      ? avaData 
      : { type: 'Feature', properties: avaData.properties || {}, geometry };

    // Calculate initial center and bounds from geometry
    let initialCenter = [-120, 38];
    const bounds = new maplibregl.LngLatBounds();
    
    try {
      const processCoords = (coords) => {
        coords.forEach(coord => bounds.extend(coord));
      };
      
      if (geometry.type === 'Polygon') {
        processCoords(geometry.coordinates[0]);
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => processCoords(polygon[0]));
      }
      
      if (!bounds.isEmpty()) {
        initialCenter = bounds.getCenter().toArray();
        boundsRef.current = bounds;
      }
    } catch (e) {
      console.warn('Could not calculate bounds:', e);
    }

    // Initialize map with MapTiler hybrid basemap
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://api.maptiler.com/maps/hybrid-v4/style.json?key=MxVkcANRbOpQXn3scb8K',
      center: initialCenter,
      zoom: 10,
      pitch: 0,
      bearing: 0,
      minPitch: 0,
      maxPitch: 85
    });

    mapRef.current = map;

    map.on('load', () => {
      console.log('Map loaded, adding AVA layer');
      setMapLoaded(true);

      // Add terrain source for 3D terrain
      map.addSource('terrainSource', {
        type: 'raster-dem',
        tiles: [
          'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
        ],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15
      });

      // Enable terrain by default with 60° pitch
      map.setTerrain({ source: 'terrainSource', exaggeration: 2.0 });
      map.setPitch(60);

      // Add AVA boundary
      map.addSource('ava-boundary', {
        type: 'geojson',
        data: geoJsonData
      });

      // AVA boundary fill — faint warm tint (frosted pane)
      map.addLayer({
        id: 'ava-boundary-fill',
        type: 'fill',
        source: 'ava-boundary',
        paint: {
          'fill-color': '#FFB81C',
          'fill-opacity': 0.05
        }
      });

      // AVA boundary — outer glow pass (wide, soft, warm)
      map.addLayer({
        id: 'ava-boundary-glow',
        type: 'line',
        source: 'ava-boundary',
        paint: {
          'line-color': '#FFD97A',
          'line-width': 14,
          'line-opacity': 0.15,
          'line-blur': 7
        }
      });

      // AVA boundary — crisp warm ivory line on top
      map.addLayer({
        id: 'ava-boundary-line',
        type: 'line',
        source: 'ava-boundary',
        paint: {
          'line-color': '#FFE8A0',
          'line-width': 2.5,
          'line-opacity': 0.85
        }
      });

      // Fit to AVA bounds
      if (boundsRef.current && !boundsRef.current.isEmpty()) {
        map.fitBounds(boundsRef.current, {
          padding: 80,
          duration: 1000
        });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [avaData]);

  // Handler: Zoom in
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn({ duration: 300 });
    }
  };

  // Handler: Zoom out
  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut({ duration: 300 });
    }
  };

  // Handler: Reset view to initial state (bearing 0, pitch 60 — matches load state)
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.easeTo({
        bearing: 0,
        pitch: 60,
        duration: 800
      });
      setCurrentPitch(60);
      setCurrentBearing(0);

      // Fit to AVA bounds
      if (boundsRef.current && !boundsRef.current.isEmpty()) {
        setTimeout(() => {
          mapRef.current.fitBounds(boundsRef.current, {
            padding: 80,
            duration: 1000
          });
        }, 100);
      }
    }
  };

  // Handler: Toggle 3D terrain
  const handleToggleTerrain = (enabled) => {
    const map = mapRef.current;
    if (!map) return;

    if (enabled) {
      // First, ensure terrain source exists
      if (!map.getSource('terrainSource')) {
        map.addSource('terrainSource', {
          type: 'raster-dem',
          tiles: [
            'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
          ],
          encoding: 'terrarium',
          tileSize: 256,
          maxzoom: 15
        });
      }

      // Enable terrain with exaggeration
      map.setTerrain({
        source: 'terrainSource',
        exaggeration: 2.0
      });
    } else {
      // Disable terrain
      map.setTerrain(null);

      // Reset pitch to 0 when disabling
      map.easeTo({ pitch: 0, duration: 500 });
      setCurrentPitch(0);
    }

    setTerrainEnabled(enabled);
  };

  // Handler: Change camera bearing
  const handleBearingChange = (bearing) => {
    if (mapRef.current) {
      mapRef.current.setBearing(bearing);
      setCurrentBearing(bearing);
    }
  };

  // Handler: Change camera pitch
  const handlePitchChange = (pitch) => {
    if (mapRef.current) {
      mapRef.current.setPitch(pitch);
      setCurrentPitch(pitch);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: '100%' }} 
      />

      {/* Loading indicator during transition */}
      {isTransitioning && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0, 0, 0, 0.75)',
            color: '#FFFFFF',
            padding: '16px 32px',
            borderRadius: '8px',
            zIndex: 1000,
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            pointerEvents: 'none',
            animation: 'fadeInOut 2s ease-in-out'
          }}
        >
          Zooming to AVA...
        </div>
      )}

      {/* Climate Layer - PRISM monthly normals */}
      {mapLoaded && mapRef.current && (
        <ClimateLayer
          map={mapRef.current}
          isVisible={climateVisible}
          currentMonth={currentMonth}
          rescale={climateVisible ? effectiveRescale : climateRescale}
          prismVar={prismVar}
          colormap={effectiveClimateColormap}
        />
      )}

      {/* Index Layer - growing season indices */}
      {mapLoaded && mapRef.current && (
        <IndexLayer
          map={mapRef.current}
          isVisible={indexVisible}
          fileSlug={activeIndexConfig?.fileSlug}
          year={activeYear}
          cogFilename={activeIndexConfig?.cogFilename || null}
          isClassified={activeIndexConfig?.isClassified || false}
          colormapData={activeIndexConfig?.colormapData || null}
          colormap={effectiveIndexColormap || 'plasma'}
          rescaleDefault={activeIndexConfig?.rescaleDefault || '0,5000'}
          rescale={indexVisible ? effectiveRescale : indexRescale}
        />
      )}

      {/* Topography Layer - manages slope/aspect/elevation on map */}
      {mapLoaded && mapRef.current && (
        <TopographyLayer
          map={mapRef.current}
          avaSlug={avaSlug}
          activeLayer={activeTopoLayer}
          rescale={topoRescale}
        />
      )}

      {/* Desktop Dock — left-edge vertical strip + floating modal */}
      {!isMobile && (
        <DesktopDock
          anyLayerVisible={anyLayerVisible}
          colormap={topoVisible ? (activeTopoConfig?.colormap || 'terrain') : climateVisible ? effectiveClimateColormap : effectiveIndexColormap || 'plasma'}
          isClassified={activeIndexConfig?.isClassified || false}
          info={
            <InfoPanel
              avaData={avaData}
              activeLayer={activeLayer}
              displayMin={displayMin}
              displayMax={displayMax}
              unit={activePanelConfig?.unit || ''}
              currentMonth={currentMonth}
              stateName={avaSlug ? stateName : undefined}
              dbSlug={avaSlug ? avaSlug.replace(/-/g, '_') : null}
              onAvaHover={handleAvaHover}
            />
          }
          toolkit={
            <TerrainControlsPanel
              map={mapRef.current}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={handleResetView}
              onToggleTerrain={handleToggleTerrain}
              onBearingChange={handleBearingChange}
              onPitchChange={handlePitchChange}
              terrainEnabled={terrainEnabled}
              currentBearing={currentBearing}
              currentPitch={currentPitch}
              activeTool={activeTool}
              onToolChange={setActiveTool}
              anyLayerVisible={anyLayerVisible}
              totalDistance={totalDistance}
              onClearMeasure={clearMeasure}
              fmtKm={fmtKm}
              measurePointCount={measurePoints.length}
              mobileSheetMode={true}
            />
          }
          dataLayer={
            <DataLayerPanel
              activeLayer={activeLayer}
              onLayerChange={handleLayerChange}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              activeYear={activeYear}
              onYearChange={setActiveYear}
              avaSlug={avaSlug || ''}
              mobileSheetMode={true}
            />
          }
          scale={
            <ScalePanel
              isVisible={anyLayerVisible}
              layerLabel={activePanelConfig?.label || ''}
              unit={activePanelConfig?.unit || ''}
              isClassified={activeIndexConfig?.isClassified || false}
              colormapData={activeIndexConfig?.colormapData || null}
              colormap={topoVisible ? (activeTopoConfig?.colormap || 'terrain') : climateVisible ? effectiveClimateColormap : effectiveIndexColormap || 'plasma'}
              onColormapChange={topoVisible ? () => {} : climateVisible ? setClimateColormap : setIndexColormap}
              readOnlyColormap={topoVisible}
              displayMin={scaleMin}
              displayMax={scaleMax}
              avaClipped={!!activeDbStat}
              isLoading={scaleLoading}
              error={scaleError}
              onAutoAdjust={autoAdjust}
              showAutoAdjust={topoVisible ? true : !activeIndexConfig?.isClassified}
              mobileSheetMode={true}
            />
          }
        />
      )}

      {/* Mobile Dock — bottom-center bar + slide-up sheets */}
      {isMobile && (
        <MobileDock
          anyLayerVisible={anyLayerVisible}
          colormap={topoVisible ? (activeTopoConfig?.colormap || 'terrain') : climateVisible ? effectiveClimateColormap : effectiveIndexColormap || 'plasma'}
          isClassified={activeIndexConfig?.isClassified || false}
          info={
            <InfoPanel
              avaData={avaData}
              activeLayer={activeLayer}
              displayMin={displayMin}
              displayMax={displayMax}
              unit={activePanelConfig?.unit || ''}
              currentMonth={currentMonth}
              stateName={avaSlug ? stateName : undefined}
              dbSlug={avaSlug ? avaSlug.replace(/-/g, '_') : null}
              mobileSheetMode={true}
              onAvaHover={handleAvaHover}
            />
          }
          toolkit={
            <TerrainControlsPanel
              map={mapRef.current}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetView={handleResetView}
              onToggleTerrain={handleToggleTerrain}
              onBearingChange={handleBearingChange}
              onPitchChange={handlePitchChange}
              terrainEnabled={terrainEnabled}
              currentBearing={currentBearing}
              currentPitch={currentPitch}
              activeTool={activeTool}
              onToolChange={setActiveTool}
              anyLayerVisible={anyLayerVisible}
              totalDistance={totalDistance}
              onClearMeasure={clearMeasure}
              fmtKm={fmtKm}
              measurePointCount={measurePoints.length}
              mobileSheetMode={true}
            />
          }
          dataLayer={
            <DataLayerPanel
              activeLayer={activeLayer}
              onLayerChange={handleLayerChange}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              activeYear={activeYear}
              onYearChange={setActiveYear}
              avaSlug={avaSlug || ''}
              mobileSheetMode={true}
            />
          }
          scale={
            <ScalePanel
              isVisible={anyLayerVisible}
              layerLabel={activePanelConfig?.label || ''}
              unit={activePanelConfig?.unit || ''}
              isClassified={activeIndexConfig?.isClassified || false}
              colormapData={activeIndexConfig?.colormapData || null}
              colormap={topoVisible ? (activeTopoConfig?.colormap || 'terrain') : climateVisible ? effectiveClimateColormap : effectiveIndexColormap || 'plasma'}
              onColormapChange={topoVisible ? () => {} : climateVisible ? setClimateColormap : setIndexColormap}
              readOnlyColormap={topoVisible}
              displayMin={scaleMin}
              displayMax={scaleMax}
              avaClipped={!!activeDbStat}
              isLoading={scaleLoading}
              error={scaleError}
              onAutoAdjust={autoAdjust}
              showAutoAdjust={topoVisible ? true : !activeIndexConfig?.isClassified}
              mobileSheetMode={true}
            />
          }
        />
      )}
      <ClimateProbeTooltip
        isActive={probeEnabled}
        value={hoverValue}
        screenPos={hoverScreenPos}
        unit={activePanelConfig?.unit || ''}
        label={hoverLabel || activePanelConfig?.label || ''}
      />

      {/* Pinned point modal — right side below toolkit */}
      <ClimatePointModal
        isOpen={isPinModalOpen}
        onClose={clearPin}
        value={pinnedValue}
        valueLabel={pinnedLabel}
        coords={pinnedCoords}
        unit={activePanelConfig?.unit || ''}
        label={activePanelConfig?.label || ''}
        currentMonth={currentMonth}
        isClassified={activeIndexConfig?.isClassified || false}
      />

      {/* CSS for fade animation */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MapLibreAVAViewer;
