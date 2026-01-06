# Terranthro Project Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
Terranthro is a progressive multi-scale terroir visualization platform for American wine regions. Users navigate from national → state → AVA levels, with data layer complexity increasing at each zoom level.

## Technology Stack
- **Frontend**: React 18+ with Vite, Mapbox GL JS v3, CesiumJS v1.111+
- **Styling**: CSS Modules + Tailwind CSS (utilities only)
- **Backend**: Node.js + Express, PostgreSQL 15+ with PostGIS 3.3+
- **Data**: Cloud Optimized GeoTIFFs (COGs) stored in object storage

## Design System
Use the vibrant color palette defined in the specification:
- Primary burgundy: #C41E3A
- Primary gold: #FFB81C  
- Primary violet: #6B2D5C
- Base cream: #FFFEF7
- Text charcoal: #2B2B2B

## Code Guidelines
- Use CSS Modules for component-specific styles
- Apply Tailwind only for utility classes
- Follow the exact file structure defined in the specification
- Implement concentric circle production symbols with specified sizing
- Use the three-level navigation system: National → State → AVA
- Maintain data layer complexity appropriate to each zoom level
