# Terranthro Architecture Documentation

**Last Updated:** January 2025  
**Version:** 1.0.0

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Architecture](#data-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Navigation & Routing](#navigation--routing)
7. [Component Structure](#component-structure)
8. [State Management](#state-management)
9. [Data Visualization](#data-visualization)
10. [API & Services](#api--services)
11. [File Structure](#file-structure)
12. [Design System](#design-system)
13. [Development Workflow](#development-workflow)
14. [Deployment](#deployment)

---

## Project Overview

**Terranthro** is a progressive multi-scale terroir visualization platform for American wine regions. The platform enables users to explore wine appellations (AVAs - American Viticultural Areas) through an interactive, hierarchical navigation system with increasingly detailed data at each zoom level.

### Core Features

- **Multi-scale Navigation**: National → State → AVA hierarchy with nested sub-AVAs
- **3D Terrain Visualization**: MapLibre GL JS with terrain rendering for AVA detail views
- **Climate Data Overlay**: PRISM climate data (temperature, precipitation) rendered via Titiler COG server
- **Interactive Controls**: Terrain pitch/bearing controls, climate layer toggle, time-series animation
- **Hierarchical AVA System**: Support for nested AVAs using UC Davis GeoJSON `within` field

### Target Users

- Wine enthusiasts exploring terroir characteristics
- Industry professionals researching appellations
- Educators teaching about wine regions
- Researchers analyzing climate and geography impacts on viticulture

---

## Technology Stack

### Frontend

- **Framework**: React 18+ with Vite build tool
- **Mapping Library**: MapLibre GL JS v3 (open-source fork of Mapbox GL JS)
- **3D Rendering**: CesiumJS v1.111+ (future enhancement)
- **Routing**: React Router v6 (with splat routes for nested AVA navigation)
- **Styling**: CSS Modules + Tailwind CSS (utilities only)
- **Language**: JavaScript (ES6+)

### Backend

- **Runtime**: Node.js (Express server for API endpoints)
- **Database**: PostgreSQL 15+ with PostGIS 3.3+ extension
- **Tile Server**: Titiler (Docker container on port 8000)
- **Static File Server**: Vite dev server (port 3001) / Nginx (production)

### Data Storage

- **Raster Data**: Cloud Optimized GeoTIFFs (COGs) stored in `/public/climate-data/`
- **Vector Data**: GeoJSON files for AVA boundaries in `/public/data/`
- **Base Maps**: Esri World Imagery satellite tiles (external service)
- **Terrain Tiles**: Terrarium DEM tiles from AWS S3 (external service)

### DevOps

- **Version Control**: Git with GitHub
- **Package Manager**: npm
- **Development Server**: Vite (HMR enabled)
- **Containerization**: Docker (for Titiler service)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Browser                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            React Application (Vite)                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │  MapLibre    │  │   Context    │  │  React   │  │   │
│  │  │  GL JS Map   │  │   Providers  │  │  Router  │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Static File Server                        │
│              (Vite Dev Server / Nginx Prod)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  GeoJSON     │  │  COG Files   │  │  Static      │      │
│  │  AVA Data    │  │  (Climate)   │  │  Assets      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ COG URLs
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Titiler COG Tile Server (Docker)               │
│                    localhost:8000                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  /cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png       │    │
│  │  - Reads COG from URL                               │    │
│  │  - Applies colormap (plasma, viridis, etc.)        │    │
│  │  - Rescales data range                              │    │
│  │  - Returns PNG tile                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Tile requests (XYZ)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Esri World  │  │  Terrarium   │  │  Future:     │      │
│  │  Imagery     │  │  DEM Tiles   │  │  PostgreSQL  │      │
│  │  Basemap     │  │  (AWS S3)    │  │  PostGIS API │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **Page Load**: Browser requests React app from Vite/Nginx
2. **AVA Data**: React fetches GeoJSON (e.g., `/data/OR_avas.geojson`)
3. **Map Render**: MapLibre GL JS renders basemap + AVA boundaries
4. **Climate Layer**: When enabled, MapLibre requests tiles from Titiler:
   - Titiler fetches COG from static server (e.g., `/climate-data/dundee-hills/prism_tdmean_...`)
   - Titiler processes COG and returns PNG tiles
   - MapLibre displays tiles as raster layer

---

## Data Architecture

### AVA Hierarchy Model

AVAs are organized hierarchically using the UC Davis GeoJSON dataset's `within` field:

```javascript
// Top-level AVA (no parent)
{
  "properties": {
    "name": "Willamette Valley",
    "ava_id": "willamette_valley",
    "within": null,  // or empty string
    "state": "OR"
  }
}

// Sub-AVA (direct child)
{
  "properties": {
    "name": "Dundee Hills",
    "ava_id": "dundee_hills",
    "within": "Willamette Valley",  // parent name
    "state": "OR"
  }
}

// Nested Sub-AVA (grandchild)
{
  "properties": {
    "name": "Ballard Canyon",
    "ava_id": "ballard_canyon",
    "within": "Central Coast|Santa Ynez Valley",  // pipe-delimited parent chain
    "state": "CA"
  }
}
```

**Key Principles:**
- `within: null` → Top-level AVA (shown on state maps)
- `within: "Parent Name"` → Direct child of "Parent Name"
- `within: "GrandParent|Parent"` → Last entry is direct parent
- Parent relationships are matched by **exact name** comparison

### Climate Data Structure

#### File Naming Convention
```
prism_tdmean_{ava-slug}_{YYYYMM}_avg_30y_cog.tif
```

**Examples:**
- `prism_tdmean_dundee-hills_202001_avg_30y_cog.tif` (January 2020, Dundee Hills)
- `prism_tdmean_eola-amity-hills_202007_avg_30y_cog.tif` (July 2020, Eola-Amity Hills)

#### Directory Structure
```
public/
  climate-data/
    dundee-hills/
      prism_tdmean_dundee-hills_202001_avg_30y_cog.tif
      prism_tdmean_dundee-hills_202002_avg_30y_cog.tif
      ...
      prism_tdmean_dundee-hills_202012_avg_30y_cog.tif
    eola-amity-hills/
      prism_tdmean_eola-amity-hills_202001_avg_30y_cog.tif
      ...
```

#### COG Specifications
- **Format**: GeoTIFF with Cloud Optimized layout
- **Projection**: WGS84 (EPSG:4326) or Web Mercator (EPSG:3857)
- **Data Type**: Float32 (temperature in °C)
- **Compression**: Deflate
- **Tiling**: 512x512 internal tiles
- **Overviews**: Precomputed pyramid levels
- **NoData**: -9999 or NaN

#### Data Range
- **Temperature**: -22°C to 26°C (PRISM mean temperature)
- **Titiler Rescale**: `rescale=-22,26` in URL query params
- **Colormap**: `plasma` (purple → yellow color ramp)

### GeoJSON Structure

#### State-Level Files
```
public/
  data/
    OR_avas.geojson      # Oregon AVAs
    CA_avas.geojson      # California AVAs
    WA_avas.geojson      # Washington AVAs
```

#### FeatureCollection Schema
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ava_id": "dundee_hills",
        "name": "Dundee Hills",
        "aka": null,
        "created": "2004-09-01",
        "removed": null,
        "county": "Yamhill",
        "state": "OR",
        "within": "Willamette Valley",
        "contains": null,
        "petitioner": "...",
        "cfr_author": "...",
        "cfr_index": "9.123"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    }
  ]
}
```

---

## Frontend Architecture

### React Application Structure

#### Entry Point
```javascript
// main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

#### Root Component
```javascript
// App.jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<MapContainer />} />
    <Route path="/states/:stateName" element={<StatePage />} />
    <Route path="/states/:stateName/avas/*" element={<AVAPage />} />
    <Route path="/about" element={<About />} />
  </Routes>
</BrowserRouter>
```

### Context Providers

#### MapContext
**Purpose**: Manages global map state for the national map view

**State:**
- `mapInstance` - MapLibre GL JS map object
- `selectedState` - Currently selected state (for highlighting)
- Camera position (center, zoom, bearing, pitch)

**Methods:**
- `setMapInstance(map)`
- `selectState(stateName)`
- `flyToState(stateName)`

#### LayerContext
**Purpose**: Manages layer visibility and configuration for the national map

**State:**
- `visibleLayers` - Array of active layer IDs
- `layerOpacity` - Object mapping layer ID to opacity (0-1)
- `layerOrder` - Z-index ordering of layers

**Methods:**
- `toggleLayer(layerId)`
- `setLayerOpacity(layerId, opacity)`
- `reorderLayers(newOrder)`

---

## Navigation & Routing

### Route Structure

#### National Level
```
URL: /
Component: MapContainer → MapLibreNationalMap
Features:
  - Shows all US states with AVA data
  - Clickable state polygons
  - Breadcrumb: "National"
  - No climate layers (future enhancement)
```

#### State Level
```
URL: /states/:stateName
Component: StatePage → MapLibreStateMap
Features:
  - Shows top-level AVAs only (within === null)
  - Flat 2D map (no terrain)
  - Clickable AVA polygons
  - Side panel with AVA list
  - Breadcrumb: "National > Oregon"
Example: /states/oregon
```

#### AVA Level (Intermediate - Parent with Children)
```
URL: /states/:stateName/avas/:slug1/:slug2/...
Component: AVAPage (MODE A)
Features:
  - Shows direct children of current AVA
  - Flat 2D map (no terrain)
  - Clickable child AVA polygons
  - Side panel listing children
  - Breadcrumb: "National > Oregon > Willamette Valley"
Example: /states/oregon/avas/willamette-valley
```

#### AVA Level (Leaf - No Children)
```
URL: /states/:stateName/avas/:slug1/:slug2/.../leafSlug
Component: AVAPage (MODE B) → MapLibreAVAViewer
Features:
  - 3D terrain viewer (pitch up to 85°)
  - Climate data overlay (PRISM temperature)
  - Terrain controls panel
  - Climate controls (month selector, play/pause)
  - Breadcrumb: "National > Oregon > Willamette Valley > Dundee Hills"
Example: /states/oregon/avas/willamette-valley/dundee-hills
```

### URL Slug Conversion

**Function:** `toSlug(name)`
```javascript
// "Dundee Hills" → "dundee-hills"
// "Sta. Rita Hills" → "sta-rita-hills"
// "Eola-Amity Hills" → "eola-amity-hills"
```

**Reverse:** `featureFromSlug(featureCollection, slug)`
- Matches against `properties.name` (slugified) or `properties.ava_id`

### Navigation Helpers

#### Hierarchy Utilities (`utils/avaHierarchy.js`)

1. **`parseWithin(withinStr)`**
   - Input: `"Central Coast|Santa Ynez Valley"`
   - Output: `["Central Coast", "Santa Ynez Valley"]`

2. **`isTopLevel(feature)`**
   - Returns: `true` if `within` is null/empty

3. **`getDirectParentName(feature)`**
   - Returns: Last entry in `within` chain or `null`

4. **`getChildrenOf(featureCollection, parentName)`**
   - Returns: Features where direct parent === `parentName`

5. **`getTopLevel(featureCollection)`**
   - Returns: New FeatureCollection with only top-level features

6. **`buildBreadcrumbs(slugs, stateName, featureCollection)`**
   - Returns: Array of `{ label, path }` objects for breadcrumb UI

---

## Component Structure

### Page Components

#### `/pages/AVAPage.jsx` (Dual-Mode)

**Mode Detection:**
```javascript
const children = getChildrenOf(allFeatures, currentFeature.properties.name);
const isLeaf = children.length === 0;

if (isLeaf) {
  return <MapLibreAVAViewer avaData={currentFeature} />;
} else {
  return <IntermediatePageUI />;
}
```

**Mode A (Intermediate):**
- Breadcrumb component
- MapLibre map showing child AVAs (flat, no terrain)
- Side panel with child AVA list
- Click handlers navigate to `/states/:stateName/avas/:path/:childSlug`

**Mode B (Leaf):**
- Renders `<MapLibreAVAViewer />` with full 3D terrain
- All existing panels (terrain controls, climate controls, etc.)

#### `/pages/StatePage.jsx`

**Data Loading:**
```javascript
const fileName = avaFileMap[stateName]; // e.g., "OR_avas.geojson"
fetch(`/data/${fileName}`)
  .then(r => r.json())
  .then(data => {
    const topLevelOnly = getTopLevel(data);
    setAvaData(topLevelOnly);
  });
```

**Components:**
- `<MapLibreStateMap />` - Map viewer
- `<AVAListPanel />` - Side panel with AVA names
- `<Breadcrumb />` - Navigation trail

### Map Components

#### `/components/Map/MapLibreNationalMap.jsx`

**Initialization:**
```javascript
new maplibregl.Map({
  container: mapContainerRef.current,
  style: {
    sources: {
      'esri-satellite': { ... },
      'us-states': { type: 'geojson', data: statesGeoJSON }
    },
    layers: [
      { id: 'satellite-layer', type: 'raster', source: 'esri-satellite' },
      { id: 'state-fills', type: 'fill', source: 'us-states', paint: {...} },
      { id: 'state-outlines', type: 'line', source: 'us-states', paint: {...} }
    ]
  },
  center: [-98, 39],
  zoom: 4
})
```

**Interactions:**
- Click on state → `navigate(/states/${stateName})`
- Hover → Highlight state outline
- Context menu → Future feature (open in new tab, etc.)

#### `/components/Map/MapLibreStateMap.jsx`

**Key Features:**
- Filters to top-level AVAs only
- Flat 2D projection (no terrain)
- Uses same satellite basemap
- AVA polygons with white outline (#FFFFFF, 0.1 opacity fill)

**Click Handler:**
```javascript
map.on('click', 'ava-fills', (e) => {
  const avaName = e.features[0].properties.name;
  const slug = toSlug(avaName);
  navigate(`/states/${stateName}/avas/${slug}`);
});
```

#### `/components/AVAPage/MapLibreAVAViewer.jsx`

**3D Terrain Setup:**
```javascript
map.addSource('terrainSource', {
  type: 'raster-dem',
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium',
  tileSize: 256,
  maxzoom: 15
});

map.setTerrain({ 
  source: 'terrainSource', 
  exaggeration: 2.0 
});

map.setPitch(60);  // Default 3D tilt
```

**Components:**
- AVA boundary (white outline)
- Satellite basemap
- 3D terrain (Terrarium tiles)
- Climate raster layer (conditional)
- Terrain controls panel
- Climate controls panel

### Climate Components

#### `/components/AVAPage/ClimateLayer.jsx`

**Headless Component** (returns `null`)

**Purpose:** Manages climate raster layer on MapLibre map

**Props:**
- `map` - MapLibre map instance
- `avaId` - AVA slug (e.g., "dundee-hills")
- `avaHierarchy` - `{ id, parentId, level }`
- `isVisible` - Boolean toggle
- `currentMonth` - Integer 1-12

**Titiler URL Construction:**
```javascript
const year = 2020;
const monthStr = String(currentMonth).padStart(2, '0');
const cogUrl = `http://host.docker.internal:8080/climate-data/dundee-hills/prism_tdmean_dundee-hills_${year}${monthStr}_avg_30y_cog.tif`;
const encodedCogUrl = encodeURIComponent(cogUrl);
const tileUrl = `http://localhost:8000/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png?url=${encodedCogUrl}&rescale=-22,26&colormap_name=plasma`;

map.addSource('climate-raster-source', {
  type: 'raster',
  tiles: [tileUrl],
  tileSize: 256
});

map.addLayer({
  id: 'climate-raster-layer',
  type: 'raster',
  source: 'climate-raster-source',
  paint: {
    'raster-opacity': isVisible ? 0.7 : 0
  }
});
```

**Layer Management:**
- Removes/re-adds source when `currentMonth` changes
- Updates opacity when `isVisible` toggles
- Inserts layer below AVA boundary for proper stacking

#### `/components/AVAPage/ClimateControls.jsx`

**UI Component**

**Features:**
- Month selector (slider or dropdown)
- Play/Pause button for time animation
- Opacity slider (0-100%)
- Toggle visibility button
- Legend showing color ramp with temp labels

**State:**
```javascript
const [currentMonth, setCurrentMonth] = useState(1);  // January
const [isPlaying, setIsPlaying] = useState(false);
const [opacity, setOpacity] = useState(0.7);
```

**Animation Logic:**
```javascript
useEffect(() => {
  if (!isPlaying) return;
  
  const interval = setInterval(() => {
    setCurrentMonth(m => m === 12 ? 1 : m + 1);
  }, 1000);  // 1 second per month
  
  return () => clearInterval(interval);
}, [isPlaying]);
```

### UI Components

#### `/components/AVAPage/TerrainControlsPanel.jsx`

**Controls:**
- **Pitch Slider**: 0° to 85° (0 = flat, 85 = steep tilt)
- **Bearing Slider**: 0° to 360° (rotation)
- **Terrain Toggle**: Enable/disable 3D terrain
- **Exaggeration Slider**: 1.0 to 3.0 (vertical scale)
- **Reset View Button**: Return to default camera

**Integration:**
```javascript
const handlePitchChange = (value) => {
  map.easeTo({ pitch: value, duration: 300 });
  setCurrentPitch(value);
};
```

#### `/components/Navigation/Breadcrumb.jsx`

**Rendering:**
```javascript
{breadcrumbs.map((crumb, i) => (
  <span key={i}>
    {i < breadcrumbs.length - 1 ? (
      <>
        <Link to={crumb.path}>{crumb.label}</Link>
        <span> &gt; </span>
      </>
    ) : (
      <span className="current">{crumb.label}</span>
    )}
  </span>
))}
```

**Styling:**
- Positioned absolute (top-left on desktop, top-full-width on mobile)
- Semi-transparent background (#FFFEF7 @ 95% opacity)
- Burgundy links (#C41E3A), charcoal current page (#2B2B2B)

---

## State Management

### React Context Pattern

**MapContext** (`/context/MapContext.jsx`)
```javascript
const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [cameraPosition, setCameraPosition] = useState({
    center: [-98, 39],
    zoom: 4,
    pitch: 0,
    bearing: 0
  });

  const value = {
    mapInstance,
    setMapInstance,
    selectedState,
    setSelectedState,
    cameraPosition,
    setCameraPosition
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMapContext = () => useContext(MapContext);
```

**Usage:**
```javascript
const { mapInstance, setMapInstance, selectedState } = useMapContext();
```

### Local Component State

**AVAPage:**
```javascript
const [allFeatures, setAllFeatures] = useState(null);
const [currentFeature, setCurrentFeature] = useState(null);
const [children, setChildren] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**MapLibreAVAViewer:**
```javascript
const [terrainEnabled, setTerrainEnabled] = useState(true);
const [currentPitch, setCurrentPitch] = useState(60);
const [currentBearing, setCurrentBearing] = useState(0);
const [isTransitioning, setIsTransitioning] = useState(false);
const [mapLoaded, setMapLoaded] = useState(false);
const [climateVisible, setClimateVisible] = useState(false);
const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
```

### URL-Driven State

**React Router Params:**
```javascript
// /states/oregon/avas/willamette-valley/dundee-hills
const { stateName } = useParams();          // "oregon"
const wildcardPath = useParams()['*'];       // "willamette-valley/dundee-hills"
const slugs = wildcardPath.split('/');       // ["willamette-valley", "dundee-hills"]
const leafSlug = slugs[slugs.length - 1];    // "dundee-hills"
```

**Location State:**
```javascript
// Pass camera state between pages
navigate(`/states/${stateName}/avas/${slug}`, {
  state: {
    previousCamera: {
      center: map.getCenter(),
      zoom: map.getZoom(),
      pitch: map.getPitch(),
      bearing: map.getBearing()
    }
  }
});

// Retrieve on destination page
const location = useLocation();
const previousCamera = location.state?.previousCamera;
```

---

## Data Visualization

### Map Layers Stack (Bottom to Top)

1. **Satellite Basemap** (Esri World Imagery)
   - Z-index: 0
   - Always visible
   - Opacity: 100%

2. **3D Terrain** (Terrarium DEM)
   - Z-index: N/A (applied to map, not a layer)
   - Toggle: `terrainEnabled` state
   - Exaggeration: 1.0 to 3.0

3. **Climate Raster Layer** (Titiler tiles)
   - Z-index: 1
   - Toggle: `climateVisible` state
   - Opacity: 0-100% (default 70%)

4. **AVA Boundaries** (GeoJSON)
   - Z-index: 2
   - Fill: #FFFFFF @ 10% opacity
   - Outline: #FFFFFF @ 90% opacity, 2-3px width

5. **State Boundaries** (National map only)
   - Z-index: 3
   - Fill: #FFFFFF @ 5% opacity
   - Outline: #FFFFFF @ 60% opacity, 1px width

### Color Palette

**Terranthro Brand Colors:**
```css
:root {
  --color-burgundy: #C41E3A;    /* Primary accent, links, CTAs */
  --color-gold: #FFB81C;        /* Secondary accent, highlights */
  --color-violet: #6B2D5C;      /* Tertiary accent, hover states */
  --color-cream: #FFFEF7;       /* Background, panels */
  --color-charcoal: #2B2B2B;    /* Text, borders */
}
```

**Climate Data Colormap (Plasma):**
- -22°C → Purple (#0D0887)
- -10°C → Blue (#6A00A8)
- 0°C → Magenta (#B12A90)
- 10°C → Orange (#E16462)
- 20°C → Yellow (#FCA636)
- 26°C → Light Yellow (#F0F921)

### Typography

**Font Stack:**
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

**Headings:**
- H1: 2rem (32px), font-weight 700
- H2: 1.5rem (24px), font-weight 600
- H3: 1.25rem (20px), font-weight 600
- Body: 1rem (16px), font-weight 400

---

## API & Services

### Titiler COG Tile Server

**Base URL:** `http://localhost:8000` (development)

**Endpoint:** `/cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png`

**Query Parameters:**
- `url` (required): Encoded URL to COG file
- `rescale`: Data range (e.g., `-22,26`)
- `colormap_name`: Color ramp (e.g., `plasma`, `viridis`, `rdylgn`)
- `bidx`: Band index (default 1)
- `nodata`: NoData value override

**Example Request:**
```
http://localhost:8000/cog/tiles/WebMercatorQuad/12/656/1435.png?
  url=http%3A%2F%2Fhost.docker.internal%3A8080%2Fclimate-data%2Fdundee-hills%2Fprism_tdmean_dundee-hills_202001_avg_30y_cog.tif&
  rescale=-22%2C26&
  colormap_name=plasma
```

**Docker Setup:**
```bash
docker run --rm -p 8000:8000 ghcr.io/developmentseed/titiler:latest
```

**Network Configuration:**
- COG URLs use `host.docker.internal:8080` so Titiler (running in Docker) can access host's Vite server
- Client uses `localhost:8000` to access Titiler from browser

### Static File Server

**Development:** Vite dev server on `localhost:3001`

**URLs:**
- `/data/OR_avas.geojson` → GeoJSON data
- `/climate-data/dundee-hills/prism_tdmean_dundee-hills_202001_avg_30y_cog.tif` → COG files

**Production:** Nginx serving `/public` directory

---

## File Structure

```
TerranthroSite/
├── client/                          # Frontend React application
│   ├── public/                      # Static assets
│   │   ├── data/                    # GeoJSON files
│   │   │   ├── OR_avas.geojson
│   │   │   ├── CA_avas.geojson
│   │   │   └── WA_avas.geojson
│   │   └── climate-data/            # COG files
│   │       ├── dundee-hills/
│   │       │   ├── prism_tdmean_dundee-hills_202001_avg_30y_cog.tif
│   │       │   └── ...
│   │       └── eola-amity-hills/
│   │           └── ...
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── AVAPage/             # AVA detail page components
│   │   │   │   ├── ClimateLayer.jsx
│   │   │   │   ├── ClimateControls.jsx
│   │   │   │   ├── MapLibreAVAViewer.jsx
│   │   │   │   ├── TerrainControlsPanel.jsx
│   │   │   │   └── climateConfig.js
│   │   │   │
│   │   │   ├── Map/                 # Map viewer components
│   │   │   │   ├── MapLibreNationalMap.jsx
│   │   │   │   ├── MapLibreStateMap.jsx
│   │   │   │   └── MapLibreNationalMap.module.css
│   │   │   │
│   │   │   ├── Navigation/          # Navigation components
│   │   │   │   ├── Breadcrumb.jsx
│   │   │   │   └── Breadcrumb.module.css
│   │   │   │
│   │   │   ├── Layers/              # Layer control components
│   │   │   │   ├── LayersModal.jsx
│   │   │   │   └── LayerToggle.jsx
│   │   │   │
│   │   │   └── UI/                  # Reusable UI components
│   │   │       ├── LayersMenuButton.jsx
│   │   │       ├── ProjectionInfoModal.jsx
│   │   │       └── Button.jsx
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   ├── MapContext.jsx
│   │   │   └── LayerContext.jsx
│   │   │
│   │   ├── pages/                   # Page-level components
│   │   │   ├── AVAPage.jsx          # Dual-mode AVA page
│   │   │   ├── AVAPage.module.css
│   │   │   ├── StatePage.jsx
│   │   │   └── About.jsx
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── avaHierarchy.js      # Hierarchy parsing logic
│   │   │   └── avaFileMap.js        # State-to-file mapping
│   │   │
│   │   ├── styles/                  # Global styles
│   │   │   └── globals.css
│   │   │
│   │   ├── App.jsx                  # Root component
│   │   └── main.jsx                 # Entry point
│   │
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Backend (future)
│   ├── routes/
│   ├── controllers/
│   └── models/
│
├── data-sources/                    # Raw data (not in repo)
│   └── ava/
│       └── avas/                    # UC Davis GeoJSON source files
│           ├── ballard_canyon.geojson
│           └── ...
│
├── .github/
│   └── copilot-instructions.md
│
├── .gitignore
├── README.md
└── ARCHITECTURE.md                  # This file
```

---

## Design System

### Component Styling Guidelines

**Use CSS Modules for Component-Specific Styles:**
```jsx
import styles from './MyComponent.module.css';

<div className={styles.container}>
  <button className={styles.primaryButton}>Click</button>
</div>
```

**Use Tailwind Only for Utilities:**
```jsx
<div className="flex items-center justify-between p-4">
  <span className="text-sm font-semibold">Label</span>
</div>
```

### Responsive Breakpoints

```css
/* Mobile-first approach */
/* Base styles: 320px+ (mobile) */

@media (min-width: 768px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1440px) {
  /* Large desktop */
}
```

### Animation Guidelines

**Transitions:**
```css
.element {
  transition: all 0.2s ease-in-out;
}

.map-transition {
  transition: opacity 0.3s, transform 0.3s;
}
```

**MapLibre Animations:**
```javascript
map.easeTo({
  center: [-123.0, 44.0],
  zoom: 10,
  pitch: 60,
  bearing: 0,
  duration: 1000,  // milliseconds
  easing: (t) => t  // linear, or custom easing function
});
```

---

## Development Workflow

### Local Setup

1. **Clone Repository:**
   ```bash
   git clone <repo-url>
   cd TerranthroSite
   ```

2. **Install Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Start Titiler (Docker):**
   ```bash
   docker run --rm -p 8000:8000 ghcr.io/developmentseed/titiler:latest
   ```

4. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   - App: http://localhost:3001
   - Titiler: http://localhost:8000

### Development Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Run Prettier
```

### Adding a New AVA

1. **Obtain GeoJSON:**
   - Source: UC Davis AVA Project
   - Ensure `within` field is populated correctly

2. **Add to State File:**
   ```bash
   # Append to existing state GeoJSON
   # OR merge using QGIS/ogr2ogr
   ```

3. **Create Climate Data Directory:**
   ```bash
   mkdir public/climate-data/new-ava-slug
   ```

4. **Generate COG Files:**
   ```python
   # Use GDAL/rasterio to clip national PRISM to AVA boundary
   # Convert to COG format
   # Save with naming convention: prism_tdmean_new-ava-slug_YYYYMM_avg_30y_cog.tif
   ```

5. **Test Navigation:**
   - Visit state page
   - Click AVA (if top-level) or navigate via parent
   - Verify 3D terrain loads
   - Enable climate layer, cycle through months

### Debugging Tips

**MapLibre Console Errors:**
```javascript
map.on('error', (e) => {
  console.error('MapLibre error:', e);
});
```

**Titiler Request Failures:**
- Check Docker container is running: `docker ps`
- Verify COG file exists at specified path
- Test Titiler directly in browser: `http://localhost:8000/docs`
- Check network tab for failed tile requests

**GeoJSON Loading Issues:**
- Open browser Network tab, filter by `.geojson`
- Verify file is served with correct MIME type (`application/json`)
- Check console for CORS errors (should not occur with Vite dev server)

---

## Deployment

### Production Build

```bash
cd client
npm run build
```

Output: `client/dist/` directory with optimized static files

### Environment Variables

**Development (`.env.development`):**
```
VITE_TITILER_URL=http://localhost:8000
VITE_API_URL=http://localhost:5000
```

**Production (`.env.production`):**
```
VITE_TITILER_URL=https://titiler.terranthro.com
VITE_API_URL=https://api.terranthro.com
```

### Docker Deployment (Future)

```dockerfile
# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
  listen 80;
  server_name terranthro.com;
  root /usr/share/nginx/html;
  index index.html;

  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Static assets with caching
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Data files
  location /data/ {
    expires 1d;
    add_header Cache-Control "public";
  }

  # Climate data (large files)
  location /climate-data/ {
    expires 7d;
    add_header Cache-Control "public";
  }
}
```

### CDN Configuration (Future)

- Serve static assets (CSS, JS, images) from CDN
- Keep GeoJSON and COG files on origin server (too large/dynamic for CDN)
- Use CloudFront or similar for global distribution

---

## Future Enhancements

### Phase 2: Backend API

- PostgreSQL + PostGIS database for AVA data
- REST API for querying AVAs, climate data, wineries
- User accounts and saved locations
- AVA comparison tool

### Phase 3: Advanced Visualization

- CesiumJS integration for true 3D globe navigation
- Soil layer overlay (SSURGO data)
- Vineyard parcel data (where available)
- Historical climate trends (time-series charts)

### Phase 4: User Features

- User-contributed photos/notes per AVA
- Winery directory with locations
- Wine review integration
- Export/share functionality (PDF reports, embeddable maps)

---

## Maintenance & Updates

### Keeping AVA Data Current

- UC Davis updates AVA boundaries periodically
- Check for new releases: https://github.com/UCDavisLibrary/ava
- Re-generate state GeoJSON files
- Update `within` relationships if TTB changes parent AVAs

### Climate Data Updates

- PRISM releases new 30-year normals every decade
- Current: 1991-2020 normals
- Next update: ~2031 (2001-2030 normals)
- Regenerate all COG files when new data available

### Dependency Updates

```bash
npm outdated              # Check for updates
npm update                # Update minor/patch versions
npm install <pkg>@latest  # Update specific package to latest
```

**Critical Dependencies:**
- `maplibre-gl` - Map rendering (monitor for breaking changes)
- `react-router-dom` - Routing (test navigation thoroughly after updates)
- `react` - Core framework (follow React upgrade guides)

---

## Contributors

### Core Team
- **Project Lead:** [Name]
- **Frontend Developer:** [Name]
- **Data Engineer:** [Name]

### Data Sources
- **AVA Boundaries:** UC Davis Library, AVA Project
- **Climate Data:** PRISM Climate Group, Oregon State University
- **Terrain Data:** Mapzen Terrarium (AWS S3)
- **Satellite Imagery:** Esri World Imagery

### License

[Specify License Here - e.g., MIT, Apache 2.0]

---

## Glossary

- **AVA**: American Viticultural Area (wine appellation)
- **COG**: Cloud Optimized GeoTIFF (efficient web-friendly raster format)
- **DEM**: Digital Elevation Model (terrain height data)
- **GeoJSON**: Geographic data format based on JSON
- **MapLibre**: Open-source map rendering library (fork of Mapbox GL JS)
- **PRISM**: Parameter-elevation Regressions on Independent Slopes Model (climate dataset)
- **Terrarium**: DEM tile format (RGB-encoded elevation)
- **Titiler**: Dynamic tile server for COG files
- **TTB**: Alcohol and Tobacco Tax and Trade Bureau (US agency that approves AVAs)

---

**End of Architecture Documentation**

*For questions or clarifications, please contact the development team or open an issue on GitHub.*
