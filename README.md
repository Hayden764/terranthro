# Terranthro - Progressive Multi-Scale Terroir Visualization Platform

A progressive multi-scale terroir visualization platform for American wine regions. Users navigate from national → state → AVA levels, with data layer complexity increasing at each zoom level.

## 🍷 Features

- **Multi-Scale Navigation**: Progressive zoom from national → state → AVA levels
- **Rich Data Layers**: Climate, soil, topography, geology, and production data
- **Interactive Maps**: Mapbox GL JS for 2D views, CesiumJS for 3D AVA details
- **Vibrant Design**: Wine-inspired color palette with clean, modern UI
- **Production Symbols**: Concentric circles scaled to wine production volume

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Mapping**: Mapbox GL JS v3, CesiumJS v1.111+
- **Styling**: CSS Modules + Tailwind CSS (utilities only)
- **State**: React Context API
- **Visualization**: D3.js v7

### Backend
- **API**: Node.js + Express
- **Database**: PostgreSQL 15+ with PostGIS 3.3+
- **Storage**: Cloud Optimized GeoTIFFs (COGs)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd terranthro
   ```

2. **Start the database**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Install dependencies**
   ```bash
   # Frontend
   cd client && npm install
   
   # Backend
   cd ../server && npm install
   ```

4. **Set up environment variables**
   ```bash
   # Client
   cp client/.env.example client/.env
   # Add your Mapbox and Cesium tokens
   
   # Server
   cp server/.env.example server/.env
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Frontend (http://localhost:3000)
   cd client && npm run dev
   
   # Terminal 2: Backend (http://localhost:5000)
   cd server && npm run dev
   ```

## 📁 Project Structure

```
terranthro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Map, Layers, Navigation, UI components
│   │   ├── context/        # React Context providers
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global and component styles
│   └── public/            # Static assets
├── server/                # Express API
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Route handlers
│   │   └── models/        # Data models
├── database/              # PostgreSQL schema and seeds
├── data-pipeline/         # Data processing scripts
└── docs/                 # Documentation
```

## 🎨 Design System

### Colors
- **Primary Burgundy**: #C41E3A (main accent)
- **Primary Gold**: #FFB81C (secondary accent)  
- **Base Cream**: #FFFEF7 (warm background)
- **Text Charcoal**: #2B2B2B (high contrast text)

### Typography
- **Primary Font**: Inter (UI, body text)
- **Display Font**: Space Grotesk (headers, labels)

## 📊 Navigation Levels

1. **National Level**: Overview of wine-producing states with production symbols
2. **State Level**: AVAs within selected state with enhanced data layers
3. **AVA Level**: Detailed 3D view with comprehensive terroir data

## 🗂️ Data Layers

### Climate
- Temperature, Precipitation, Growing Degree Days

### Soil  
- Texture, Drainage, Depth, pH

### Topography
- Elevation, Slope, Aspect, Solar Exposure

### Geology
- Bedrock Geology, Surficial Geology

## 🔧 API Endpoints

- `GET /api/production/national` - National production data
- `GET /api/production/state/:stateId` - State-level production data  
- `GET /api/layers/:avaId` - Available data layers for AVA
- `GET /api/climate/:avaId/timeseries` - Climate time series data
- `GET /api/avas/:avaId/geometry` - AVA boundary geometry

## 🚢 Deployment

### Frontend (Vercel)
- Automatic deployment from main branch
- Environment variables set in Vercel dashboard

### Backend (DigitalOcean/Railway)
- Docker-based deployment
- PostgreSQL with PostGIS extension

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- USDA NASS for production data
- PRISM Climate Group for climate data
- TTB for AVA boundaries
- Wine industry partners for domain expertise
