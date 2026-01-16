import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

const CesiumViewer = ({ avaData }) => {
  const cesiumContainer = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Create Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      terrain: Cesium.Terrain.fromWorldTerrain(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      selectionIndicator: false,
      infoBox: false,
      fullscreenButton: false
    });

    viewerRef.current = viewer;

    // Configure terrain
    viewer.scene.globe.terrainExaggeration = 1.5;
    viewer.scene.globe.enableLighting = true;

    // Fly to Dundee Hills area
    // Actual Dundee Hills coordinates: roughly -123.0°W, 45.28°N
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        -123.0,    // Longitude (Dundee Hills)
        45.28,     // Latitude (Dundee Hills)
        5000       // Altitude in meters (5km up for good view)
      ),
      orientation: {
        heading: Cesium.Math.toRadians(0),    // North-facing
        pitch: Cesium.Math.toRadians(-45),    // Looking down at 45°
        roll: 0.0
      },
      duration: 2  // 2 second fly animation
    });

    // Cleanup
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [avaData]);

  return (
    <div 
      ref={cesiumContainer}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default CesiumViewer;
