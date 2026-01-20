# Terranthro - Progressive Terroir Visualization Platform

A progressive multi-scale terroir visualization platform for American wine regions using MapLibre GL JS. Navigate seamlessly from national → state → AVA levels with 3D terrain visualization and interactive data layers.

## 🍷 Current Features (v0.5.0)

- **Three-Level Navigation**: National globe → State AVAs → Individual AVA 3D terrain
- **MapLibre GL JS**: Open-source mapping with globe projection and smooth camera transitions
- **32 US Wine States**: Complete AVA coverage from UC Davis dataset
- **3D Terrain Visualization**: Interactive terrain viewer with cardinal direction controls
- **Data Layer Framework**: 5-category panel structure (topography, climate, soils, geology, viticulture)
- **Bi-directional Hover**: Synchronized map and panel interactions
- **Mobile Responsive**: Hamburger menus and adaptive layouts

## 🏗️ Technology Stack

### Current Implementation
- **Framework**: React 18 + Vite
- **Mapping**: MapLibre GL JS v4+ (globe projection support)
- **Basemap**: ESRI World Imagery satellite tiles
- **Routing**: React Router v6
- **Styling**: Custom CSS with Montserrat/Inter typography
- **Data**: UC Davis AVA GeoJSON files, state configuration JSON

### Planned Backend
- **Database**: PostgreSQL 15+ with PostGIS 3.3+
- **Raster Storage**: Cloud Optimized GeoTIFFs (COGs) on AWS S3
- **API**: Node.js + Express

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### Installation

1. **Clone the repository**
```bash
   git clone <repo-url>
   cd TerranthroSite
```

2. **Install dependencies**
```bash
   cd client
   npm install
```

3. **Start development server**
```bash
   npm run dev
```

4. **Open browser**
```
   http://localhost:5173
```

## 📁 Project Structure
```
TerranthroSite/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapLibreNationalMap.jsx    # National globe view
│   │   │   │   └── MapLibreStateMap.jsx       # State AVA overview
│   │   │   ├── AVAPage/
│   │   │   │   └── MapLibreAVAViewer.jsx      # 3D AVA terrain viewer
│   │   │   ├── Layers/
│   │   │   │   ├── AVAListPanel.jsx           # Clickable AVA list
│   │   │   │   └── DataLayersPanel.jsx        # 5-category data layers
│   │   │   └── Navigation/
│   │   │       └── CardinalControls.jsx       # N/E/S/W view buttons
│   │   ├── config/
│   │   │   ├── stateConfig.js                 # State metadata & bounds
│   │   │   └── avaFileMap.js                  # AVA data file mapping
│   │   ├── pages/
│   │   │   ├── HomePage.jsx                   # National map
│   │   │   ├── StatePage.jsx                  # State map
│   │   │   └── AVAPage.jsx                    # AVA detail
│   │   └── styles/
│   └── public/
│       └── data/
│           ├── OR_avas.geojson                # Oregon AVAs
│           ├── CA_avas.geojson                # California AVAs
│           └── [28 more state files]          # All US wine states
└── README.md
```

## 🎨 Design System

### Colors
- **Primary Burgundy**: #C41E3A (accents, interactive elements)
- **Base Cream**: #FFFEF7 (warm background)
- **Text Charcoal**: #2B2B2B (high contrast)
- **White Borders**: #FFFFFF (AVA boundaries, state outlines)

### Typography
- **Headers**: Montserrat (600 weight)
- **Body**: Inter (400-500 weight)

## 📊 Navigation Levels

### 1. National Level (Globe Projection)
- 32 US wine-producing states with white borders
- Hover effects with state name display
- Click to zoom to state view
- Smooth camera transition to state level

### 2. State Level (Regional View)
- All AVAs within state as white-outlined polygons
- Top-center hover name display
- Left panel with clickable AVA list
- Bi-directional hover highlighting (map ↔ list)
- Click AVA to load 3D terrain viewer

### 3. AVA Level (3D Terrain Viewer)
- MapLibre 3D terrain with satellite basemap
- Cardinal direction controls (N/E/S/W preset views)
- Data layers panel (5 categories, currently framework only)
- AVA information panel (title, location)
- White AVA boundary overlay on terrain

## 🗂️ Data Layer Categories (Framework Ready)

### Topography
- Elevation contours
- Slope analysis
- Aspect (sun exposure)
- Hillshade

### Climate
- Temperature (mean, min, max)
- Precipitation
- Growing Degree Days (GDD)
- Frost risk zones

### Soils
- SSURGO soil classifications
- Drainage classes
- Depth to bedrock
- Soil texture

### Geology
- Bedrock geology
- Surficial deposits
- Geologic age

### Viticulture
- Vineyard boundaries
- Planted varieties
- Elevation zones

## 🚧 Recent Changes (v0.5.0)

### MapLibre GL JS Migration
- ✅ Removed Mapbox GL JS dependency
- ✅ Implemented MapLibre v4 with globe projection
- ✅ Migrated all three map levels to MapLibre
- ✅ Fixed camera state persistence across navigation
- ✅ Resolved zoom level and styling issues

### Data Integration
- ✅ Added all 32 US wine state AVA GeoJSON files
- ✅ Created state configuration system
- ✅ Built AVA file mapping for dynamic loading
- ✅ Added comprehensive state metadata

### UI/UX Improvements
- ✅ Bi-directional hover (panel and map sync)
- ✅ Smooth camera transitions between levels
- ✅ Mobile-responsive hamburger menus
- ✅ Cardinal direction view controls on AVA pages
- ✅ Top-center hover labels on state maps

## 🎯 Next Steps

### High Priority
- [ ] Wire up data layer raster tiles (climate, soils, topography)
- [ ] Populate AVA metadata (establishment dates, varieties, descriptions)
- [ ] Host terrain tiles on AWS S3/CloudFront
- [ ] Implement COG tile serving for data layers

### Medium Priority
- [ ] Add vineyard boundary data
- [ ] Create data layer toggle functionality
- [ ] Build legend components for active layers
- [ ] Add temporal sliders for climate data

### Future Enhancements
- [ ] Backend API development (Node.js + Express)
- [ ] PostgreSQL + PostGIS integration
- [ ] User authentication and saved views
- [ ] Export/share functionality

## 🌐 Data Sources

- **AVA Boundaries**: UC Davis Wine Chemistry & Enology, TTB
- **Climate Data**: PRISM Climate Group (planned)
- **Soil Data**: USDA SSURGO (planned)
- **Terrain**: USGS 3DEP elevation data (planned)
- **Satellite Imagery**: ESRI World Imagery

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/DataLayers`)
3. Commit your changes (`git commit -m 'Add climate data layer integration'`)
4. Push to the branch (`git push origin feature/DataLayers`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- UC Davis Department of Viticulture & Enology for AVA datasets
- MapLibre GL JS community for open-source mapping tools
- ESRI for satellite basemap tiles
- Wine industry partners for domain expertise

---

**Version**: 0.5.0-maplibre  
**Last Updated**: January 2026
