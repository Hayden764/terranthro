# Terranthro

> A multi-scale terroir visualization platform for American Viticultural Areas (AVAs).

Navigate from a national overview down to individual AVA detail with 3D terrain, PRISM climate rasters, computed growing-season indices, topography overlays, and per-AVA climate statistics — all rendered in the browser via MapLibre GL JS and Cloud Optimized GeoTIFFs served from Cloudflare R2.

**Live:** [terranthro.vercel.app](https://terranthro.vercel.app)

---

## What It Does

Three geographic levels, each with its own map and UI:

| Level | Route | What you see |
|---|---|---|
| **National** | `/` | Interactive globe with all 33 wine-producing states |
| **State** | `/:stateName` | Every AVA in the state with a searchable side-panel list |
| **AVA Detail** | `/:stateName/:avaSlug` | 3D terrain viewer with climate, index, and topography raster layers, an info panel with AVA metadata + live statistics, and a full data toolkit |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Mapping | MapLibre GL JS 5 |
| Routing | React Router 7 |
| Styling | CSS Modules + Tailwind CSS |
| Basemaps | ESRI World Imagery (national/state) · MapTiler Hybrid (AVA) |
| Raster tiles | Cloud Optimized GeoTIFFs (COGs) via [Titiler](https://developmentseed.org/titiler/) |
| COG storage | Cloudflare R2 (public bucket) |
| Climate data | PRISM Climate Group 30-arcsecond monthly normals |
| Climate indices | GDD/Winkler, Huglin, GST, GSP — computed from PRISM (Python) |
| Topography | USGS 3DEP 1/3 arc-second DEM → elevation/slope/aspect COGs |
| Per-AVA stats | Neon Postgres (serverless) — polygon-clipped statistics |
| Deployment | Vercel (frontend + serverless API routes) |

---

## Quick Start

```bash
git clone https://github.com/Hayden764/terranthro.git
cd terranthro/client
npm install
npm run dev
```

Open **http://localhost:3001**.

> The map UI, AVA boundaries, and all raster layers work immediately — COGs are served from Cloudflare R2 and Titiler is hosted on Render. No Docker required.

---

## Project Structure

```
terranthro/
├── client/                          # React + Vite frontend (Vercel)
│   ├── api/                         # Vercel serverless functions
│   │   ├── health.js
│   │   ├── avas/
│   │   │   ├── [slug].js            # GET /api/avas/:slug
│   │   │   └── state/[stateAbbrev].js
│   │   ├── climate/
│   │   │   └── [slug]/stats.js      # GET /api/climate/:slug/stats?year=
│   │   ├── layers/
│   │   │   ├── [avaId].js
│   │   │   ├── national.js
│   │   │   └── state/[stateId].js
│   │   └── lib/db.js                # Neon Postgres pool
│   ├── public/
│   │   ├── data/                    # AVA GeoJSON — 33 state files
│   │   └── topography-data/         # Local COG mirror (OR, CA, ID)
│   └── src/
│       ├── components/
│       │   ├── maps/
│       │   │   ├── MapLibreNationalMap.jsx
│       │   │   ├── MapLibreStateMap.jsx
│       │   │   ├── MapLibreAVAViewer.jsx
│       │   │   └── shared/
│       │   │       ├── InfoPanel.jsx           # AVA metadata + stats panel
│       │   │       ├── DataLayerPanel.jsx      # Layer selector
│       │   │       ├── ScalePanel.jsx          # Legend + colormap + auto-adjust
│       │   │       ├── MapToolkit.jsx          # Pan/Probe/Measure + view controls
│       │   │       ├── DesktopDock.jsx         # Desktop layout shell
│       │   │       ├── MobileDock.jsx          # Mobile layout shell
│       │   │       ├── ClimateLayer.jsx        # PRISM raster tile rendering
│       │   │       ├── IndexLayer.jsx          # Index raster tile rendering
│       │   │       ├── TopographyLayer.jsx     # Topo COG rendering
│       │   │       ├── ClimateProbeTooltip.jsx # Hover probe tooltip
│       │   │       ├── ClimatePointModal.jsx   # Pinnable probe result card
│       │   │       ├── climateConfig.js        # Layer config + Titiler URLs
│       │   │       ├── topographyConfig.js     # Topo config + AVA registry
│       │   │       └── layerInfoContent.jsx    # Layer descriptions + ranges
│       │   └── ui/
│       │       ├── WelcomeModal.jsx
│       │       └── ProjectionInfoModal.jsx
│       ├── config/
│       │   ├── stateConfig.js       # State bounds, zoom, AVA file paths
│       │   └── avaFileMap.js        # State slug → GeoJSON filename
│       ├── context/
│       │   ├── MapContext.jsx       # Map instance + camera state
│       │   └── LayerContext.jsx     # Active layer state
│       ├── hooks/
│       │   ├── useAvaClimateStats.js   # Fetches DB-backed polygon stats
│       │   ├── useClimateProbe.js      # Titiler point-query (hover + pin)
│       │   ├── useClimateScale.js      # Viewport bbox auto-scale
│       │   ├── useTopoScale.js         # Full-raster topo min/max fetch
│       │   └── useMapMeasure.js        # Geodesic distance measurement
│       └── pages/
│           ├── StatePage.jsx
│           ├── AVAPage.jsx
│           └── About.jsx
└── data-pipeline/
    └── scripts/
        ├── compute-ava-climate-stats.py  # Clip COGs to AVA polygons → Postgres
        ├── generate-terrain-cogs.py      # USGS 3DEP DEM → elevation/slope/aspect COGs
        ├── fetch-prism.py                # Download PRISM monthly normals
        ├── seed-avas.js                  # Seed AVA records into Postgres
        ├── update-topo-config.js         # Regenerate topographyConfig.js registry
        ├── upload-topography-r2.sh       # Upload topo COGs to Cloudflare R2
        └── upload-terrain-r2.sh          # Upload terrain COGs to Cloudflare R2
```

---

## Data Layers

### PRISM Climate Normals

| Layer | Variable | Status |
|---|---|---|
| Mean Temperature | `tdmean` | ✅ Active |
| Max Temperature | `tmax` | 🔲 COG pending |
| Min Temperature | `tmin` | 🔲 COG pending |
| Precipitation | `ppt` | 🔲 COG pending |

30-year normals (1991–2020) at 800 m resolution, tiled via Titiler from Cloudflare R2.

### Growing-Season Indices (2025)

| Layer | Type | Description |
|---|---|---|
| GDD Winkler | Continuous | Growing degree days Apr–Oct (base 10°C) |
| Winkler Regions | Classified | Winkler I–V+ classification |
| Huglin Index | Continuous | Heliothermal index with day-length factor, Apr–Sep |
| Huglin Classes | Classified | 8-zone Huglin climate classification |
| Growing Season Temp | Continuous | Mean daily temp Apr–Oct (Smart-Hobday) |
| Growing Season Precip | Continuous | Cumulative precipitation Apr–Oct |

### Topography

| Layer | Colormap | Unit |
|---|---|---|
| Elevation | terrain | m |
| Slope | rdylgn_r | ° |
| Aspect | hsv | ° |

COGs derived from USGS 3DEP 1/3 arc-second (~10 m) DEM. Served from Cloudflare R2.

**State coverage (registered in topographyConfig.js):**

| State | AVAs |
|---|---|
| California | 145 |
| Oregon | 17 |
| New York | 4 |
| Arkansas | 1 |

---

## AVA Info Panel

When viewing an AVA with no layer active, the right-side info panel shows:

- State + county, established date, CFR reference
- Parent AVAs ("Part of") and sub-AVAs ("Contains") with navigation links
- **2025 Growing Season** stats (where computed in DB): Winkler GDD, Huglin Index, Growing Season Temp, Growing Season Precip — each with a large mean value, min/max range bar, and p10–p90 highlight
- **Elevation Range** card (where topo COG is available): mean elevation + min/max bar fetched live from Titiler

When a layer is active, the panel switches to show the layer's scientific context, AVA-clipped statistics, formula, data source, and reference ranges.

---

## Map Toolkit

Available at the AVA level (top-right panel):

| Tool | Description |
|---|---|
| **Pan** | Default drag-to-navigate |
| **Probe** | Click any active raster to read its pixel value; shows hover tooltip + pinnable point card |
| **Measure** | Place waypoints and compute cumulative geodesic distance (km) |
| **Zoom In / Out** | Programmatic zoom |
| **Reset View** | Fly back to AVA bounds |
| **3D Terrain** | Toggle MapLibre terrain extrusion |
| **Bearing** | Rotate map 0°–360° with cardinal label |
| **Pitch** | Tilt map 0°–85° (terrain mode only) |

---

## Scale Panel

- **Continuous layers**: gradient bar with live min/max labels, 10-colormap picker (Plasma, Viridis, Inferno, Magma, RdYlGn, Blues, Reds, RdBu, Spectral, Cool), and **Auto Adjust** (samples current viewport via Titiler p2–p98)
- **Classified layers** (Winkler Regions, Huglin Classes): discrete swatches — no colormap picker
- Hidden when no layer is active

---

## Data Pipeline

Scripts in `data-pipeline/scripts/`:

```bash
# Download PRISM monthly normals
python scripts/fetch-prism.py

# Generate elevation/slope/aspect COGs from USGS 3DEP
python scripts/generate-terrain-cogs.py --state OR

# Clip COGs to AVA polygons and write stats to Postgres
python scripts/compute-ava-climate-stats.py --state OR --year 2025

# Upload topo COGs to Cloudflare R2
./scripts/upload-topography-r2.sh <bucket-name>
./scripts/upload-topography-r2.sh <bucket-name> --dry-run

# Regenerate topographyConfig.js from local tif inventory
node scripts/update-topo-config.js

# Seed AVA records into Postgres from GeoJSON
node scripts/seed-avas.js
```

---

## API Routes (Vercel Serverless)

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/avas/:slug` | Single AVA with geometry, parents, children, counties |
| `GET` | `/api/avas/state/:stateAbbrev` | All AVAs for a state |
| `GET` | `/api/climate/:slug/stats?year=` | Pre-computed polygon-clipped growing-season stats |
| `GET` | `/api/layers/:avaId` | Layer metadata for an AVA |
| `GET` | `/api/layers/national` | National layer list |
| `GET` | `/api/layers/state/:stateId` | State-level layer list |

All routes connect to Neon Postgres via `api/lib/db.js`.

---

## Data Sources

| Data | Source |
|---|---|
| AVA Boundaries | UC Davis Viticulture & Enology / TTB |
| Climate Normals | PRISM Climate Group, Oregon State University (800 m) |
| Climate Indices | Computed from PRISM via Python |
| Topography | USGS 3D Elevation Program (3DEP) — 1/3 arc-second DEM |
| Satellite Imagery | ESRI World Imagery · MapTiler Hybrid |
| Soil Data | USDA NRCS SSURGO *(planned)* |
| Geology | USGS *(planned)* |

---

## Roadmap

- [ ] PRISM COGs for `tmax`, `tmin`, `ppt`
- [ ] Expand topo COG coverage to WA and remaining CA AVAs
- [ ] 2024 and 2026 growing-season index vintages
- [ ] Soils layer (USDA SSURGO)
- [ ] Mobile layout polish
- [ ] AVA comparison view

---

## License

MIT

---

**Version:** 0.8.0 · **Updated:** March 2026
