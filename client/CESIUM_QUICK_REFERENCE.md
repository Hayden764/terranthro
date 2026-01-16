# 🚀 CesiumJS AVA Viewer - Quick Reference

## 🔗 Test URL
```
http://localhost:3000/states/oregon/avas/dundee-hills
```

## 📁 Key Files
- **Viewer**: `/client/src/components/AVAPage/CesiumViewer.jsx`
- **Page**: `/client/src/components/AVAPage/AVAPage.jsx`
- **Data**: `/client/src/data/dundee-hills.json`
- **Route**: `/client/src/App.jsx` (line 62)

## 🎨 Design System

### Glass Morphism Style
```css
background: rgba(0, 0, 0, 0.6)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.1)
border-radius: 16px
```

### Typography
- **Font**: Inter, sans-serif
- **Heading**: 32px, 700 weight
- **Body**: 14px, 400 weight
- **Labels**: 11px, uppercase, 0.05em spacing

### Colors
- **Background**: #000 (pure black)
- **Text**: white / rgba(255, 255, 255, 0.7)
- **Borders**: rgba(255, 255, 255, 0.1)
- **Accent**: #C41E3A (burgundy, subtle use)

## 🗺️ Cesium Settings
```javascript
terrainExaggeration: 1.5
enableLighting: true
cameraAltitude: 8000m
pitch: -30°
heading: -20°
animationDuration: 3s
```

## 🎮 Controls
- **Rotate**: Left click + drag
- **Pan**: Right click + drag  
- **Zoom**: Scroll wheel
- **Tilt**: Middle click + drag

## 📝 To-Do
1. Replace placeholder Dundee Hills coordinates with real UC Davis data
2. Link AVAs from state map to detail pages
3. Add more AVA JSON files
4. Implement dynamic data loading from API
5. Add vineyard/winery markers
6. Optimize for mobile

## ✅ Status
**READY TO TEST** - All code complete, no errors
