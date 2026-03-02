# Terranthro — Progressive Terroir Visualization Platform

A progressive multi-scale terroir visualization platform for American wine regions. Navigate from national → state → AVA levels with increasing data layer complexity, 3D terrain, and real climate and topography raster data.

---

## 🍷 What It Does

Terranthro lets you explore US wine regions through three levels of geographic detail:

1. **National Globe** — All 33 US wine-producing states with interactive boundaries
2. **State View** — Every AVA within a state with a side-panel list and bi-directional hover
3. **AVA Detail** — 3D terrain viewer (MapTiler hybrid satellite) with live climate and topography raster layers

---

## ✅ Current Features

- **Three-level navigation**: National → State → AVA with URL routing (`/states/:state/avas/:ava`)
- **33 US wine states**: Complete AVA GeoJSON coverage (AR, AZ, CA, CO, CT, GA, HI, IA, ID, IL, IN, KY, LA, MA, MD, MI, MN, MO, MS, NC, NJ, NM, NY, OH, OR, PA, RI, TN, TX, VA, WA, WI, WV)
- **Basemaps**: ESRI World Imagery (national + state levels), MapTiler Hybrid (AVA level)
- **Breadcrumb navigation** with null-safe guards across all levels
- **Bi-directional hover**: Map ↔ AVA list panel synchronized highlighting
- **Climate layer (PRISM)**: Monthly mean dew-point temperature COG tiles at the AVA level — 12-month slider, toggle, and legend
- **Topography layers**: Elevation, slope, and aspect COG tiles for Oregon AVAs (28 AVAs covered)
- **Data layer panel**: Toggle UI for climate and topography at the AVA level
- **Context system**: `MapContext` + `LayerContext` wrapping all routes
- **Terrain controls**: Pitch and bearing controls on the AVA 3D view

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| Mapping | MapLibre GL JS v5 |
| Routing | React Router v7 |
| Styling | CSS Modules + Tailwind CSS (utilities) |
| Basemaps | ESRI World Imagery / MapTiler Hybrid |
| Raster tiles | Cloud Optimized GeoTIFFs (COGs) via Titiler |
| Climate data | PRISM Climate Group monthly COGs |
| Processed indices | GDD/Winkler, Huglin Index, Growing Season Temperature (GST) |
| Database (planned) | PostgreSQL 15+ with PostGIS 3.3+ |
| Backend API (planned) | Node.js + Express |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git

### Install & Run

```bash
git clone <repo-url>
cd TerranthroSite/client
npm install
npm run dev
```

Open **http://localhost:3001** in your browser.

---

## 📁 Project Structure

```
TerranthroSite/
├── client/
│   ├── public/
│   │   ├── data/                          # AVA GeoJSON per state (33 files)
│   │   ├── climate-data/                  # PRISM COG tiles by AVA
│   │   │   └── dundee-hills/              # 12 monthly COGs (tdmean, 2020)
│   │   └── topography-data/               # Elevation/slope/aspect COGs
│   │       ├── OR/                        # 28 Oregon AVAs (complete)
│   │       ├── CA/                        # California AVAs (in progress)
│   │       └── ID/                        # Idaho AVAs (in progress)
│   └── src/
│       ├── App.jsx                        # Root routing + context providers
│       ├── components/
│       │   ├── maps/
│       │   │   ├── MapLibreNationalMap.jsx   # National globe view
│       │   │   ├── MapLibreStateMap.jsx      # State AVA overview
│       │   │   ├── MapLibreAVAViewer.jsx     # AVA 3D terrain viewer
│       │   │   └── shared/
│       │   │       ├── DataLayerPanel.jsx    # Climate + topo layer toggles
│       │   │       ├── ClimateLayer.jsx      # PRISM raster rendering
│       │   │       ├── ClimateControls.jsx   # Month slider + legend
│       │   │       ├── TopographyLayer.jsx   # Elevation/slope/aspect rendering
│       │   │       ├── TerrainControls.jsx   # Pitch/bearing UI
│       │   │       ├── climateConfig.js      # Climate layer configuration
│       │   │       └── topographyConfig.js   # Topography layer configuration
│       │   ├── layers/
│       │   │   ├── AVAListPanel.jsx          # Clickable AVA sidebar list
│       │   │   ├── LayersModal.jsx           # Layer picker modal
│       │   │   ├── LayerPanel.jsx            # Layer panel wrapper
│       │   │   ├── LayerToggle.jsx           # Toggle switch component
│       │   │   └── OpacitySlider.jsx         # Layer opacity control
│       │   ├── navigation/
│       │   │   └── Breadcrumb.jsx            # National → State → AVA breadcrumb
│       │   └── ui/
│       │       ├── LayersMenuButton.jsx      # Open layers modal button
│       │       └── ProjectionInfoModal.jsx   # Globe projection info
│       ├── config/
│       │   ├── stateConfig.js               # State bounds, metadata, AVA counts
│       │   └── avaFileMap.js                # AVA slug → GeoJSON file mapping
│       ├── context/
│       │   ├── MapContext.jsx               # Map instance + camera state
│       │   └── LayerContext.jsx             # Active layer state
│       ├── data/
│       │   ├── states.json                  # State list metadata
│       │   ├── us-states.json               # US state boundaries GeoJSON
│       │   ├── layerDefinitions.json        # Data layer definitions
│       │   └── avas/                        # Individual AVA detail JSON files
│       └── pages/
│           ├── StatePage.jsx                # /states/:stateName
│           ├── AVAPage.jsx                  # /states/:stateName/avas/:avaSlug
│           └── About.jsx                    # /about
├── ClimateData/
│   ├── Processed/                          # Computed raster indices (2025 season)
│   │   ├── GDD_Winkler_2025_accumulated.tif  # Growing Degree Days accumulated
│   │   ├── GDD_Winkler_2025_classified.tif   # Winkler I–V classification raster
│   │   ├── GST_SmartHobday_2025.tif          # Growing Season Temperature
│   │   ├── Huglin_2025.tif                   # Raw Huglin heliothermal index
│   │   ├── Huglin_2025_classified.tif        # Classified Huglin zones
│   │   └── *.py                              # Python conversion scripts
│   └── Unprocessed/
│       ├── Import_PRISM_Data.py             # PRISM data ingestion script
│       └── prism_ppt_us_30s_*.zip           # Raw PRISM precipitation downloads
├── data-pipeline/
│   └── scripts/
│       └── fetch-prism.py                  # PRISM fetch automation
├── data-sources/
│   └── ava/                               # Source AVA boundary files
├── database/
│   └── schema.sql                         # PostgreSQL + PostGIS schema
├── server/                                # Node.js + Express API (planned)
├── docker-compose.yml                     # PostgreSQL + Titiler services
└── ARCHITECTURE.md                        # Full system architecture docs
```

---

## 🗺️ Navigation Levels

### 1. National Level (`/`)
- Globe projection with all 33 wine states highlighted
- Hover tooltip showing state name
- Click to navigate to state view
- ESRI World Imagery basemap

### 2. State Level (`/states/:stateName`)
- All AVAs rendered as white-outlined polygons
- Left panel: clickable AVA list with bi-directional hover sync
- Click AVA to enter AVA detail view
- ESRI World Imagery basemap

### 3. AVA Level (`/states/:stateName/avas/:avaSlug`)
- MapTiler Hybrid satellite basemap with 3D terrain
- **Climate layer**: PRISM monthly mean temperature COGs with 12-month slider
- **Topography layers**: Elevation, slope, and aspect COGs with colormap legends
- AVA boundary overlay
- Terrain pitch/bearing controls
- Data layer panel for toggling layers on/off

---

## 🌡️ Climate & Raster Data

### PRISM Climate Layers (Active)
- **Variable**: Mean dew-point temperature (`tdmean`)
- **Coverage**: Dundee Hills AVA (Oregon) — 12 monthly COGs for year 2020
- **Format**: Cloud Optimized GeoTIFF (COG)
- **Tile server**: Titiler (Docker) at `localhost:8000`

### Computed Climate Indices (Processed, 2025 Season)

| Index | File | Description |
|---|---|---|
| GDD / Winkler | `GDD_Winkler_2025_accumulated.tif` | Growing Degree Days accumulated |
| Winkler Class | `GDD_Winkler_2025_classified.tif` | Winkler I–V classification raster |
| Huglin Index | `Huglin_2025.tif` | Raw Huglin heliothermal index |
| Huglin Class | `Huglin_2025_classified.tif` | Classified Huglin zones |
| GST | `GST_SmartHobday_2025.tif` | Growing Season Temperature (Smart-Hobday) |

### Topography Data (Active)

- **Layers**: `elevation.tif`, `slope.tif`, `aspect.tif`
- **Coverage**: 28 Oregon AVAs fully processed; CA and ID in progress
- **Format**: COG (directory naming uses underscores: `ribbon_ridge/`, `dundee_hills/`, etc.)
- **Tile server**: Titiler via local http-server (`localhost:8080`)

---

## 🗂️ Data Layer Panel Status

| Category | Status | Notes |
|---|---|---|
| **Climate** | ✅ Active | PRISM monthly COG tiles, month slider, toggle |
| **Topography** | ✅ Active | Elevation/slope/aspect COG tiles, colormap legends |
| **Soils** | 🔲 Planned | USDA SSURGO data |
| **Geology** | 🔲 Planned | USGS bedrock and surficial deposits |
| **Viticulture** | 🔲 Planned | Vineyard boundaries, varieties |

---

## 🎨 Design System

### Colors

| Token | Hex | Usage |
|---|---|---|
| Primary Burgundy | `#C41E3A` | Accents, interactive elements |
| Primary Gold | `#FFB81C` | Highlights, data callouts |
| Primary Violet | `#6B2D5C` | Secondary accents |
| Base Cream | `#FFFEF7` | Warm background |
| Text Charcoal | `#2B2B2B` | Body text |

### Typography
- **Headers**: Montserrat (600 weight)
- **Body**: Inter (400–500 weight)

---

## 🚧 Known Issues

- **Titiler networking**: Docker container cannot always resolve `host.docker.internal` on some macOS configurations — COG tile serving requires manual `http-server` + Titiler startup
- **AVA slug ↔ directory mismatch**: AVA slugs use hyphens (`ribbon-ridge`) but topography directories use underscores (`ribbon_ridge`) — fix needed in `TopographyLayer.jsx`
- **Climate coverage**: Only Dundee Hills has per-AVA PRISM COGs; other AVAs fall back to US-wide 30-arcsecond tiles
- **Topography coverage**: OR fully covered (28 AVAs); CA and ID only partially covered

---

## 🎯 Roadmap

### High Priority
- [ ] Fix AVA slug → directory name conversion (hyphen → underscore) in `TopographyLayer.jsx`
- [ ] Resolve Titiler Docker networking for reliable local COG tile serving
- [ ] Expand topography COGs to WA, CA (full), and additional states
- [ ] Expand per-AVA PRISM climate COGs beyond Dundee Hills

### Medium Priority
- [ ] Integrate processed climate indices (Winkler, Huglin, GST) as toggleable map layers
- [ ] Add AVA metadata (establishment dates, grape varieties, descriptions)
- [ ] Build legend components for all active data layers
- [ ] Add soils layer (USDA SSURGO)

### Future
- [ ] Node.js + Express backend API
- [ ] PostgreSQL + PostGIS for AVA metadata and spatial queries
- [ ] User authentication and saved map views
- [ ] Export and share functionality
- [ ] Mobile-responsive layout improvements

---

## 🌐 Data Sources

| Data | Source | Status |
|---|---|---|
| AVA Boundaries | UC Davis Viticulture & Enology / TTB | ✅ Integrated (33 states) |
| Climate (PRISM) | PRISM Climate Group | ✅ Partial (Dundee Hills) |
| Topography (COGs) | USGS 3DEP elevation data | ✅ Partial (OR complete) |
| Climate Indices | Computed from PRISM (Python scripts) | ✅ Processed (2025 season) |
| Satellite Imagery | ESRI World Imagery / MapTiler | ✅ Active |
| Soil Data | USDA SSURGO | 🔲 Planned |
| Geology | USGS | 🔲 Planned |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- UC Davis Department of Viticulture & Enology for AVA datasets
- PRISM Climate Group for high-resolution US climate data
- MapLibre GL JS community for open-source mapping
- ESRI for World Imagery satellite basemap tiles
- MapTiler for hybrid satellite tiles at AVA level

---

**Version**: 0.6.0  
**Branch**: `climate-layer-integration`  
**Last Updated**: March 2026
