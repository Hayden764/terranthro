# MapLibre 3D Terrain Viewer - Quick Reference

## Test URL
http://localhost:3000/states/oregon/avas/dundee-hills

## What Changed

### Replaced CesiumJS with MapLibre GL JS
- **Why**: CesiumJS had dependency conflicts with resium wrapper
- **Benefits**: 
  - More lightweight (smaller bundle size)
  - Better React integration (no wrapper needed)
  - Free terrain tiles (no Cesium Ion token needed)
  - Open source alternative to Mapbox GL JS

## Key Files

### MapLibreAVAViewer.jsx
- Location: `client/src/components/AVAPage/MapLibreAVAViewer.jsx`
- Uses vanilla MapLibre GL JS (no React wrapper)
- 3D terrain via Terrarium RGB tiles

### AVAPage.jsx
- Updated imports: `MapLibreAVAViewer` instead of `CesiumViewer`
- Glass morphism UI overlays unchanged

## Technical Details

### Terrain Configuration
```javascript
source: 'terrain-rgb',
tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
encoding: 'terrarium',
exaggeration: 1.5
```

### Camera Settings
- **Center**: [-123.0, 45.28] (Dundee Hills)
- **Zoom**: 13.5
- **Pitch**: 60° (tilted 3D view)
- **Bearing**: -20° (slight rotation)

### Basemap
- **Style**: Stadia Alidade Smooth Dark
- **Opacity**: 0.7 (subtle, lets terrain shine)
- **Background**: #0a0a0a (very dark for cutting-edge look)

### Fog Settings
```javascript
color: 'rgb(10, 10, 10)',
'horizon-blend': 0.1,
'high-color': 'rgb(20, 20, 30)',
'space-color': 'rgb(5, 5, 10)'
```
- Adds atmospheric depth perception
- Matches dark aesthetic

## Design Philosophy

### Cutting-Edge Aesthetic
- **Dark theme**: Near-black backgrounds (#0a0a0a)
- **Glass morphism**: Frosted glass overlays with backdrop-filter
- **Minimal UI**: No visible map controls
- **Depth**: Fog effects, 3D terrain exaggeration

### Typography
- **Font**: Inter (modern, clean)
- **Weights**: 400 (body), 500 (buttons), 600 (stats), 700 (headings)
- **Colors**: White text with alpha transparency for hierarchy

## User Interactions

### Mouse Controls
- **Left click + drag**: Rotate camera
- **Right click + drag**: Pan map
- **Scroll**: Zoom in/out
- **Two-finger pinch** (trackpad): Zoom
- **Two-finger rotate** (trackpad): Rotate

### Camera Animation
- 2-second smooth fly animation on load
- Essential flag ensures animation completes

## Troubleshooting

### Black screen / No terrain showing
1. Check browser console for tile loading errors
2. Verify Terrarium tiles are accessible (CORS)
3. Check zoom level (terrain only visible at certain zooms)
4. Ensure pitch > 0 (flat view won't show terrain)

### Poor performance
1. Reduce terrain exaggeration (try 1.0 instead of 1.5)
2. Lower maxzoom on terrain source
3. Disable fog effects
4. Check GPU acceleration in browser settings

### Tiles not loading
- Terrarium tiles require internet connection
- Check network panel in DevTools
- Fallback: Can switch to Mapbox Terrain RGB v1 (requires token)

## Next Steps

### Potential Enhancements
1. **AVA Boundary Overlay**: Add polygon outline from dundee-hills.json
2. **Vineyard Markers**: Plot vineyard locations as 3D pins
3. **Climate Layers**: Toggle precipitation, temperature overlays
4. **Hillshade**: Add custom hillshade layer for more definition
5. **Light Control**: Add sun position slider for time-of-day lighting
6. **3D Buildings**: If data available, extrude winery structures

### Data Integration
- Replace hardcoded dundee-hills.json with API call
- Fetch AVA data based on URL slug
- Support multiple AVAs dynamically

### User Preferences
- Save camera position in localStorage
- Toggle between dark/light themes
- Adjust terrain exaggeration with slider

## Dependencies

```json
{
  "maplibre-gl": "^4.7.1"  // or latest version
}
```

## Alternative Terrain Sources

### Mapbox Terrain RGB v1
```javascript
tiles: ['https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=YOUR_TOKEN']
encoding: 'mapbox'
```

### Mapzen Terrarium (Current)
```javascript
tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']
encoding: 'terrarium'
```

### Custom Terrain
- Can host your own terrain tiles
- Use GDAL to generate RGB terrain tiles from DEM
- Higher resolution for specific wine regions

## Performance Notes

- MapLibre is significantly lighter than CesiumJS (~600KB vs ~10MB)
- No Web Workers needed for basic terrain
- Works well on mobile devices
- GPU acceleration recommended but not required

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires WebGL 2.0)
- Mobile browsers: Good support on modern devices

---

**Created**: January 15, 2026
**Last Updated**: January 15, 2026
**Status**: Production Ready ✅
