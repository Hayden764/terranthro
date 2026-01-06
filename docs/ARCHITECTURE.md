# Terranthro Architecture

## System Overview

Terranthro is a progressive multi-scale terroir visualization platform designed to explore American wine regions across three distinct levels of detail:

1. **National Level**: Overview of wine-producing states
2. **State Level**: American Viticultural Areas (AVAs) within states  
3. **AVA Level**: Detailed 3D terrain and data layer visualization

## Technical Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│  Context Providers (Map State, Layer Management)            │
├─────────────────────────────────────────────────────────────┤
│  Map Components                                             │
│  ├── NationalMap (Mapbox GL JS)                            │
│  ├── StateMap (Mapbox GL JS)                               │
│  └── AVAMap (CesiumJS 3D)                                  │
├─────────────────────────────────────────────────────────────┤
│  UI Components                                              │
│  ├── Navigation (Breadcrumb)                               │
│  ├── Layer Panel (Toggle, Opacity)                         │
│  └── Visualization (Charts, Legends)                       │
├─────────────────────────────────────────────────────────────┤
│  Services & Utilities                                       │
│  ├── API Client                                            │
│  ├── Symbol Scaling                                        │
│  └── Color Ramps                                           │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Express.js API                            │
├─────────────────────────────────────────────────────────────┤
│  Route Handlers                                             │
│  ├── /api/production (Wine production data)                │
│  ├── /api/layers (Available data layers)                   │
│  ├── /api/avas (AVA geometry)                              │
│  └── /api/climate (Time series data)                       │
├─────────────────────────────────────────────────────────────┤
│  Controllers                                               │
│  └── Business logic, data processing                       │
├─────────────────────────────────────────────────────────────┤
│  Models                                                    │
│  └── Database entity definitions                           │
├─────────────────────────────────────────────────────────────┤
│  Services                                                  │
│  ├── PostgreSQL/PostGIS Database                          │
│  ├── S3/Spaces Object Storage (COGs)                       │
│  └── Redis Cache (optional)                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                             │
│  ├── USDA NASS (Production statistics)                     │
│  ├── PRISM (Climate data)                                  │
│  ├── SSURGO (Soil data)                                    │
│  ├── 3DEP (Elevation data)                                 │
│  └── TTB (AVA boundaries)                                  │
├─────────────────────────────────────────────────────────────┤
│                  Processing Pipeline                        │
│  ├── Download & Validation                                 │
│  ├── Coordinate Transformation                             │
│  ├── Raster Processing (COG Generation)                    │
│  └── Database Loading                                      │
├─────────────────────────────────────────────────────────────┤
│                    Storage Layer                           │
│  ├── PostgreSQL + PostGIS (Vector data, metadata)         │
│  └── Object Storage (Cloud Optimized GeoTIFFs)            │
├─────────────────────────────────────────────────────────────┤
│                      API Layer                            │
│  ├── RESTful endpoints                                     │
│  ├── GeoJSON responses                                     │
│  └── COG tile serving                                      │
└─────────────────────────────────────────────────────────────┘
```

## Progressive Complexity Model

### Level 1: National View
- **Scope**: Continental United States
- **Features**: State boundaries, production symbols
- **Data**: Aggregated state-level production volumes
- **Interaction**: Click to zoom to state level

### Level 2: State View  
- **Scope**: Individual wine-producing state
- **Features**: AVA boundaries, enhanced production data
- **Data**: AVA-level production, basic climate layers
- **Interaction**: Click AVA to access detailed 3D view

### Level 3: AVA View
- **Scope**: Single American Viticultural Area
- **Features**: 3D terrain visualization, comprehensive data layers
- **Data**: High-resolution raster layers for all categories
- **Interaction**: Layer toggling, opacity control, time series

## Data Layer Categories

### Climate Layers
- **Temperature**: Monthly/annual average, min/max
- **Precipitation**: Monthly/annual totals  
- **Growing Degree Days**: Accumulated heat units
- **Frost**: First/last frost dates, frequency

### Soil Layers
- **Texture**: Sand, silt, clay percentages
- **Drainage**: Drainage class classification
- **Depth**: Depth to restrictive layer
- **pH**: Soil acidity/alkalinity
- **Organic Matter**: Soil organic carbon content

### Topographic Layers
- **Elevation**: Digital elevation model
- **Slope**: Terrain slope angle and percentage
- **Aspect**: Direction of slope face
- **Solar Exposure**: Annual solar radiation

### Geological Layers
- **Bedrock Geology**: Underlying rock formations
- **Surficial Geology**: Surface deposits
- **Age**: Geological time periods

### Wind Layers
- **Speed**: Average wind velocity
- **Direction**: Prevailing wind patterns
- **Seasonality**: Seasonal variations

## Symbol Design System

### Production Symbols
- **Shape**: Concentric circles
- **Scaling**: Square root of production volume
- **Colors**: Primary burgundy (#C41E3A)
- **Size Range**: 
  - National: 12-50px diameter
  - State: 16-70px diameter
- **Inner Circle**: 65% of outer diameter

## Performance Considerations

### Frontend Optimization
- **Component Lazy Loading**: Route-based code splitting
- **Map Tile Caching**: Aggressive browser caching of map tiles
- **State Management**: Optimized context updates
- **Bundle Size**: Tree shaking, minimal dependencies

### Backend Optimization  
- **Database Indexing**: Spatial indexes on geometry columns
- **Query Optimization**: Prepared statements, connection pooling
- **Caching Strategy**: Redis for frequently accessed data
- **CDN**: CloudFlare for static asset delivery

### Data Optimization
- **COG Format**: Cloud Optimized GeoTIFFs for fast streaming
- **Compression**: DEFLATE compression for raster data
- **Overviews**: Multiple resolution levels for zoom
- **Tiling**: 512x512 pixel tiles for optimal performance

## Security Model

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Restricted to allowed domains
- **Input Validation**: All user inputs sanitized
- **SQL Injection Protection**: Parameterized queries only

### Infrastructure Security
- **HTTPS Only**: TLS 1.2+ required for all connections
- **Database Access**: VPC-isolated database instances  
- **Secrets Management**: Environment variables for sensitive data
- **Regular Updates**: Automated security patches

## Deployment Strategy

### Development Environment
- **Local Development**: Docker Compose for full stack
- **Hot Reloading**: Vite for frontend, Nodemon for backend
- **Database**: Local PostgreSQL with PostGIS

### Production Environment
- **Frontend**: Vercel with automatic deployments
- **Backend**: DigitalOcean App Platform or Railway
- **Database**: Managed PostgreSQL with PostGIS
- **Storage**: DigitalOcean Spaces or AWS S3
- **CDN**: CloudFlare for global performance

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Frontend and backend error logging
- **Performance Metrics**: Load times, API response times
- **User Analytics**: Usage patterns, popular regions
- **Uptime Monitoring**: Service availability tracking

### Data Quality Monitoring
- **Pipeline Health**: Data processing success rates
- **Data Freshness**: Last update timestamps
- **Validation Results**: Data quality checks
- **Storage Utilization**: Object storage usage trends
