# Terranthro — Progressive Terroir Visualization Platform

A multi-scale terroir visualization platform for American Viticultural Areas (AVAs). Navigate from a national overview down to individual AVA detail with 3D terrain, live PRISM climate rasters, computed growing-season indices, and topography overlays — all rendered in the browser via MapLibre GL JS and Cloud Optimized GeoTIFFs.

Deployed at: **[terranthro.vercel.app](https://terranthro.vercel.app)**

---

## 🍷 What It Does

Terranthro lets you explore US wine regions across three levels of geographic detail:

1. **National View (`/`)** — All 33 US wine-producing states on an interactive globe
2. **State View (`/states/:stateName`)** — Every AVA within a state with a side-panel list
3. **AVA Detail (`/states/:stateName/avas/:avaSlug`)** — 3D terrain viewer with toggleable climate, growing-season index, and topography raster layers

---

## ✅ Current Features

### Navigation & UI
- **Three-level routing**: National → State → AVA with clean URL paths
- **Welcome modal** with "don't show again" preference saved to `localStorage`
- **Breadcrumb navigation** across all levels
- **Bi-directional hover sync**: map polygon ↔ AVA list panel highlight each other
- **Glassmorphism design system**: frosted-glass panels, backdrop blur, vivid accent colors

### AVA Map Toolkit (AVA level — top-right collapsible panel)
- **Pan** tool — default drag-to-navigate mode
- **Probe** tool — click any point on an active raster layer to read its pixel value; displays a hover tooltip and a pinnable point modal with the sampled value and coordinates
- **Measure** tool — click to place waypoints and compute cumulative geodesic distance (km); supports Clear button and Esc/double-click reset
- **Zoom in / Zoom out / Reset view** buttons
- **3D Terrain toggle** — enable/disable MapLibre terrain extrusion
- **Bearing slider** — rotate the map 0°–360° with live cardinal direction label
- **Pitch slider** — tilt the map 0°–85° (visible only when terrain is enabled)
- Panel state (expanded/collapsed) persisted via `localStorage`

### Data Layer Panel (AVA level — left collapsible panel)
- Single-selection radio across all layer categories
- **PRISM Climate Normals** — 12-month slider, one variable at a time
- **Growing-Season Indices** — year dropdown (2025), five index layers
- **Topography** — elevation, slope, aspect (panel shown only for AVAs with data)
- Deselect by clicking the active layer again

### Scale / Legend Panel (AVA level — bottom-right)
- **Continuous layers**: gradient bar with live min/max labels, colormap picker (10 options: Plasma, Viridis, Inferno, Magma, Red→Green, Blues, Reds, Red↔Blue, Spectral, Cool), and **Auto Adjust** button that samples the current viewport bbox via Titiler statistics
- **Classified layers** (Winkler Regions, Huglin Classes): discrete class swatches — no colormap picker
- Panel hidden when no layer is active

### Climate Layers — PRISM Normals

| ID | Label | Variable | Status |
|---|---|---|---|
| `tdmean` | Mean Temperature | `tdmean` | ✅ Active |
| `tmax` | Max Temperature | `tmax` | 🔲 Coming soon |
| `tmin` | Min Temperature | `tmin` | 🔲 Coming soon |
| `ppt` | Precipitation | `ppt` | 🔲 Coming soon |

Source: national 30-arcsecond PRISM COGs, tiled via Titiler. Viewport auto-scales on layer activation.

### Climate Layers — Growing-Season Indices (2025)

| ID | Label | Type | Description |
|---|---|---|---|
| `gdd_winkler_accumulated` | GDD Winkler | Continuous | Growing degree days Apr–Oct |
| `gdd_winkler_classified` | Winkler Regions | Classified | Winkler I–V classification |
| `gst_smarthobday` | Growing Season Temp | Continuous | Mean temp Apr–Oct (Smart-Hobday) |
| `huglin` | Huglin Index | Continuous | Huglin heliothermal index Apr–Sep |
| `huglin_classified` | Huglin Classes | Classified | Huglin climate classification (8 zones) |

### Topography Layers

| ID | Label | Colormap | Unit |
|---|---|---|---|
| `elevation` | Elevation | terrain | m |
| `slope` | Slope | rdylgn_r | ° |
| `aspect` | Aspect | hsv | ° |

**AVA coverage** (topography panel shown only for these):

| State | AVAs with data |
|---|---|
| Oregon | Applegate Valley, Chehalem Mountains, Columbia Gorge, Dundee Hills, Elkton Oregon, Eola-Amity Hills, Laurelwood District, Lower Long Tom, McMinnville, Mount Pisgah (Polk County), Red Hill Douglas County, Ribbon Ridge, The Rocks District of Milton-Freewater, Umpqua Valley, Van Duzer Corridor, Walla Walla Valley, Yamhill-Carlton |
| California | Alisos Canyon |

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite 5 |
| Mapping | MapLibre GL JS v5 |
| Routing | React Router v7 |
| Styling | CSS Modules + Tailwind CSS (utilities) |
| Basemaps | ESRI World Imagery (national/state) / MapTiler Hybrid (AVA) |
| Raster tiles | Cloud Optimized GeoTIFFs (COGs) via Titiler |
| Climate data | PRISM Climate Group 30-arcsecond monthly normals |
| Climate indices | GDD/Winkler, Huglin, GST — computed from PRISM (Python) |
| Topography | USGS 3DEP elevation → slope/aspect derived COGs |
| Deployment | Vercel (frontend) |
| Local tile server | Titiler (Docker) + `http-server` |
| Database (planned) | PostgreSQL 15 + PostGIS 3.3 |
| Backend API (planned) | Node.js + Express |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- Docker (for local raster tile serving)

### Frontend

```bash
git clone https://github.com/Hayden764/terranthro.git
cd terranthro/client
npm install
npm run dev
```

Open **http://localhost:3001** in your browser.

> **Note:** Map UI and AVA boundaries work without Docker. Climate and topography raster layers require the local tile stack below.

### Local Tile Stack (for raster layers)

```bash
# 1. Start Titiler (COG tile server) via Docker
docker-compose up titiler

# 2. Serve COG files via http-server
npx http-server ./client/public -p 8080 --cors
```

- Titiler: `http://localhost:8000`
- COG files: `http://localhost:8080`

---

## 📁 Project Structure

```
terranthro/
├── client/                                # React + Vite frontend (deployed to Vercel)
│   ├── public/
│   │   ├── data/                          # AVA GeoJSON per state (33 files)
│   │   ├── climate-data/
│   │   │   ├── national/                  # PRISM 30s national COGs (monthly)
│   │   │   └── indices/                   # Computed index COGs (2025 season)
│   │   └── topography-data/
│   │       ├── OR/                        # Oregon AVA COGs (17 AVAs)
│   │       └── CA/                        # California AVA COGs (Alisos Canyon)
│   └── src/
│       ├── App.jsx                        # Root routing + context providers
│       ├── components/
│       │   ├── maps/
│       │   │   ├── MapLibreNationalMap.jsx
│       │   │   ├── MapLibreStateMap.jsx
│       │   │   ├── MapLibreAVAViewer.jsx
│       │   │   └── shared/
│       │   │       ├── MapToolkit.jsx        # Pan/Probe/Measure + View controls
│       │   │       ├── DataLayerPanel.jsx    # Layer selection panel
│       │   │       ├── ScalePanel.jsx        # Legend + colormap + auto-adjust
│       │   │       ├── ClimateLayer.jsx      # PRISM raster tile rendering
│       │   │       ├── IndexLayer.jsx        # Index raster tile rendering
│       │   │       ├── TopographyLayer.jsx   # Topo COG rendering
│       │   │       ├── ClimateProbeTooltip.jsx  # Hover probe tooltip
│       │   │       ├── ClimatePointModal.jsx    # Pinnable probe result modal
│       │   │       ├── climateConfig.js      # PRISM + index layer config & URLs
│       │   │       └── topographyConfig.js   # Topo layer config & AVA registry
│       │   ├── layers/
│       │   │   ├── AVAListPanel.jsx
│       │   │   ├── LayersModal.jsx
│       │   │   ├── LayerPanel.jsx
│       │   │   ├── LayerToggle.jsx
│       │   │   └── OpacitySlider.jsx
│       │   ├── Navigation/
│       │   │   └── Breadcrumb.jsx
│       │   └── ui/
│       │       ├── LayersMenuButton.jsx
│       │       ├── WelcomeModal.jsx
│       │       └── ProjectionInfoModal.jsx
│       ├── config/
│       │   ├── stateConfig.js             # State bounds, metadata, AVA counts
│       │   └── avaFileMap.js              # AVA slug → GeoJSON file mapping
│       ├── context/
│       │   ├── MapContext.jsx             # Map instance + camera state
│       │   └── LayerContext.jsx           # Active layer state
│       ├── hooks/
│       │   ├── useClimateProbe.js         # Titiler point-query hook
│       │   ├── useClimateScale.js         # Viewport bbox auto-scale hook
│       │   └── useMapMeasure.js           # Geodesic distance measurement hook
│       ├── data/
│       │   ├── states.json
│       │   ├── us-states.json
│       │   ├── layerDefinitions.json
│       │   └── avas/                      # Individual AVA GeoJSON files
│       └── pages/
│           ├── StatePage.jsx
│           ├── AVAPage.jsx
│           └── About.jsx
├── ClimateData/
│   ├── Processed/                         # Computed index COGs (2025 season)
│   └── Unprocessed/                       # Raw PRISM downloads + ingestion scripts
├── data-pipeline/
│   └── scripts/fetch-prism.py
├── database/
│   └── schema.sql                         # PostgreSQL + PostGIS schema
├── server/                                # Node.js + Express API (planned)
├── docker-compose.yml
└── ARCHITECTURE.md
```

---

## 🌡️ Raster Data Architecture

All raster layers are served as Cloud Optimized GeoTIFFs (COGs) via two local services:

| Service | Port | Role |
|---|---|---|
| `http-server` | 8080 | Serves raw `.tif` files from `public/` |
| Titiler (Docker) | 8000 | Reads COGs and serves XYZ map tiles + statistics + point queries |

Titiler fetches COGs from `host.docker.internal:8080` (Docker-internal host resolution). MapLibre fetches rendered PNG tiles from `localhost:8000/cog/tiles/{z}/{x}/{y}.png`.

---

## 🗂️ Data Layer Status

| Category | Layers | Status |
|---|---|---|
| PRISM Mean Temperature | `tdmean` | ✅ Active |
| PRISM Max/Min/Precip | `tmax`, `tmin`, `ppt` | 🔲 Data needed |
| GDD / Winkler | Accumulated + Classified | ✅ Active (2025) |
| Growing Season Temp | Smart-Hobday | ✅ Active (2025) |
| Huglin Index | Raw + Classified | ✅ Active (2025) |
| Topography | Elevation, Slope, Aspect | ✅ Active (OR 17 AVAs + CA 1 AVA) |
| Soils | USDA SSURGO | 🔲 Planned |
| Geology | USGS bedrock | 🔲 Planned |
| Viticulture | Vineyard boundaries | 🔲 Planned |

---

## 🎨 Design System

**Glassmorphism** throughout — frosted-glass panels, `backdrop-filter: blur`, semi-transparent surfaces, thin white borders, soft multi-layered glow shadows.

### Colors

| Token | Hex | Usage |
|---|---|---|
| Primary Burgundy | `#C41E3A` | Accents, interactive elements |
| Primary Gold | `#FFB81C` | Highlights, data callouts |
| Primary Violet | `#6B2D5C` | Secondary accents |
| Base Cream | `#FFFEF7` | Warm background |
| Text Charcoal | `#2B2B2B` | Body text |

### Typography
- **Headers**: Montserrat (700 weight, uppercase)
- **Body / UI**: Inter (400–600 weight)

---

## 🚧 Known Issues

- **Titiler networking**: Docker cannot always resolve `host.docker.internal` on some macOS configs — requires manual `http-server` + Titiler startup for raster layers to work locally
- **Climate variable coverage**: Only `tdmean` (mean temperature) is currently active; `tmax`, `tmin`, and `ppt` are defined but COG files are not yet available
- **Index year**: Only the 2025 season is processed; the year dropdown currently shows 2025 only
- **Topography coverage**: 17 Oregon AVAs + 1 California AVA — remaining states not yet processed

---

## 🎯 Roadmap

### High Priority
- [ ] Add PRISM COGs for `tmax`, `tmin`, `ppt` variables
- [ ] Expand topography COG coverage to WA and remaining CA AVAs
- [ ] Resolve Titiler Docker networking for reliable local development

### Medium Priority
- [ ] Add AVA metadata panel (establishment year, grape varieties, description)
- [ ] Process 2024 and 2026 season growing-season indices
- [ ] Add soils layer (USDA SSURGO)
- [ ] Mobile-responsive layout improvements

### Future
- [ ] Node.js + Express backend API
- [ ] PostgreSQL + PostGIS for AVA metadata and spatial queries
- [ ] Cloud-hosted COG tile service (remove Docker dependency for production)
- [ ] Export / share map view functionality

---

## 🌐 Data Sources

| Data | Source | Status |
|---|---|---|
| AVA Boundaries | UC Davis Viticulture & Enology / TTB | ✅ 33 states |
| Climate (PRISM) | PRISM Climate Group (30-arcsec normals) | ✅ `tdmean` active |
| Topography | USGS 3DEP elevation data | ✅ OR (17 AVAs), CA (1 AVA) |
| Climate Indices | Computed from PRISM via Python | ✅ 2025 season |
| Satellite Imagery | ESRI World Imagery / MapTiler | ✅ Active |
| Soil Data | USDA SSURGO | 🔲 Planned |
| Geology | USGS | 🔲 Planned |

---

## 📄 License

MIT License

## 🙏 Acknowledgments

- UC Davis Department of Viticulture & Enology for AVA datasets
- PRISM Climate Group for high-resolution US climate data
- MapLibre GL JS community for open-source mapping
- ESRI for World Imagery satellite basemap tiles
- MapTiler for hybrid satellite tiles

---

**Version**: 0.7.0  
**Last Updated**: March 2026
