-- schema.sql
-- Terranthro Database Schema v2
-- Full TTB metadata, PostGIS geometry, relational relationships

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ─────────────────────────────────────────────
-- States
-- geometry is nullable so we can seed state records before loading boundaries
-- ─────────────────────────────────────────────
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(2) NOT NULL UNIQUE,
    geometry GEOMETRY(MultiPolygon, 4326),
    centroid GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_states_geometry ON states USING GIST(geometry);
CREATE INDEX idx_states_centroid ON states USING GIST(centroid);

-- ─────────────────────────────────────────────
-- Counties (normalized from pipe-delimited strings)
-- ─────────────────────────────────────────────
CREATE TABLE counties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id INTEGER REFERENCES states(id),
    UNIQUE(name, state_id)
);

CREATE INDEX idx_counties_state ON counties(state_id);

-- ─────────────────────────────────────────────
-- AVAs — full TTB metadata
-- slug: filename without .geojson extension (e.g. "columbia_valley")
--       used as the URL-safe identifier throughout the API
-- ava_id: raw TTB identifier from GeoJSON (e.g. "columbia_valley_19841213")
-- ─────────────────────────────────────────────
CREATE TABLE avas (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    ava_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    aka TEXT,
    created DATE,
    removed DATE,
    petitioner TEXT,
    cfr_author VARCHAR(255),
    cfr_index VARCHAR(50),
    cfr_revision_history TEXT,
    approved_maps TEXT,
    boundary_description TEXT,
    used_maps TEXT,
    valid_start DATE,
    valid_end DATE,
    lcsh VARCHAR(255),
    sameas TEXT,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_avas_geometry ON avas USING GIST(geometry);
CREATE INDEX idx_avas_centroid ON avas USING GIST(centroid);
CREATE INDEX idx_avas_slug ON avas(slug);
CREATE INDEX idx_avas_name ON avas(name);

-- ─────────────────────────────────────────────
-- AVA ↔ States junction
-- An AVA can span multiple states (e.g. Columbia Valley: OR + WA)
-- ─────────────────────────────────────────────
CREATE TABLE ava_states (
    ava_id INTEGER REFERENCES avas(id) ON DELETE CASCADE,
    state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
    PRIMARY KEY (ava_id, state_id)
);

CREATE INDEX idx_ava_states_state ON ava_states(state_id);

-- ─────────────────────────────────────────────
-- AVA ↔ Counties junction
-- ─────────────────────────────────────────────
CREATE TABLE ava_counties (
    ava_id INTEGER REFERENCES avas(id) ON DELETE CASCADE,
    county_id INTEGER REFERENCES counties(id) ON DELETE CASCADE,
    PRIMARY KEY (ava_id, county_id)
);

CREATE INDEX idx_ava_counties_ava ON ava_counties(ava_id);

-- ─────────────────────────────────────────────
-- AVA hierarchy (parent/child relationships)
-- Derived from pipe-delimited "within" / "contains" fields
-- ─────────────────────────────────────────────
CREATE TABLE ava_hierarchy (
    parent_id INTEGER REFERENCES avas(id) ON DELETE CASCADE,
    child_id INTEGER REFERENCES avas(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_id, child_id)
);

CREATE INDEX idx_ava_hierarchy_parent ON ava_hierarchy(parent_id);
CREATE INDEX idx_ava_hierarchy_child ON ava_hierarchy(child_id);

-- ─────────────────────────────────────────────
-- Production data by state and year (unchanged)
-- ─────────────────────────────────────────────
CREATE TABLE production (
    id SERIAL PRIMARY KEY,
    state_id INTEGER REFERENCES states(id),
    ava_id INTEGER REFERENCES avas(id) NULL,  -- NULL for state-level data
    year INTEGER NOT NULL,
    tons_crushed NUMERIC(12, 2),
    acres_bearing NUMERIC(10, 2),
    data_source VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(state_id, ava_id, year)
);

CREATE INDEX idx_production_state_year ON production(state_id, year);
CREATE INDEX idx_production_ava_year ON production(ava_id, year);

-- ─────────────────────────────────────────────
-- Raster layer metadata (COGs stored in object storage, URLs here)
-- Unchanged from original schema
-- ─────────────────────────────────────────────
CREATE TABLE raster_layers (
    id SERIAL PRIMARY KEY,
    layer_type VARCHAR(50) NOT NULL,   -- 'climate', 'soil', 'terrain', etc.
    layer_name VARCHAR(100) NOT NULL,  -- 'temperature', 'precipitation', etc.
    ava_id INTEGER REFERENCES avas(id),
    time_period VARCHAR(50),           -- '2023-01', 'annual-2023', etc.
    storage_url TEXT NOT NULL,         -- S3/Spaces URL to COG file
    bbox GEOMETRY(Polygon, 4326),
    resolution_meters NUMERIC(10, 2),
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_raster_layers_ava ON raster_layers(ava_id);
CREATE INDEX idx_raster_layers_type ON raster_layers(layer_type, layer_name);

-- ─────────────────────────────────────────────
-- Vineyard parcels (unchanged)
-- ─────────────────────────────────────────────
CREATE TABLE vineyard_parcels (
    id SERIAL PRIMARY KEY,
    ava_id INTEGER REFERENCES avas(id),
    parcel_id VARCHAR(100),
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    area_acres NUMERIC(10, 2),
    primary_variety VARCHAR(100),
    owner_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parcels_geometry ON vineyard_parcels USING GIST(geometry);
CREATE INDEX idx_parcels_ava ON vineyard_parcels(ava_id);

-- ─────────────────────────────────────────────
-- Pre-computed per-AVA statistics
-- Derived from rasters; raw raster files stay in object storage.
-- These tables are populated by separate ETL scripts (after initial seed).
-- ─────────────────────────────────────────────

-- Climate statistics (PRISM, ERA5, etc.)
-- year IS NULL  = 30-year climatological normal
-- month IS NULL = annual aggregate (Jan–Dec)
CREATE TABLE ava_climate_stats (
    id SERIAL PRIMARY KEY,
    ava_id INTEGER REFERENCES avas(id) ON DELETE CASCADE,
    year INTEGER,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    variable VARCHAR(50) NOT NULL,  -- 'tmax','tmin','tmean','ppt','gdd_winkler','huglin','huglin_class','gst'
    mean NUMERIC(10, 4),
    min NUMERIC(10, 4),
    max NUMERIC(10, 4),
    std_dev NUMERIC(10, 4),
    p10 NUMERIC(10, 4),
    p90 NUMERIC(10, 4),
    unit VARCHAR(20),               -- '°F', 'inches', '°F·days', etc.
    data_source VARCHAR(100),       -- 'PRISM', 'ERA5', etc.
    computed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(ava_id, year, month, variable)
);

CREATE INDEX idx_climate_stats_ava ON ava_climate_stats(ava_id);
CREATE INDEX idx_climate_stats_variable ON ava_climate_stats(variable, year, month);

-- Topography statistics (derived from elevation DEMs, e.g. 3DEP 10m)
CREATE TABLE ava_topo_stats (
    id SERIAL PRIMARY KEY,
    ava_id INTEGER REFERENCES avas(id) ON DELETE CASCADE UNIQUE,
    elevation_min_ft NUMERIC(10, 2),
    elevation_max_ft NUMERIC(10, 2),
    elevation_mean_ft NUMERIC(10, 2),
    slope_mean_deg NUMERIC(8, 4),
    slope_max_deg NUMERIC(8, 4),
    aspect_dominant_deg NUMERIC(8, 2),  -- prevailing aspect in degrees (0–360)
    solar_exposure_mean NUMERIC(10, 4), -- MJ/m²
    data_source VARCHAR(100),           -- '3DEP 10m', 'SRTM', etc.
    computed_at TIMESTAMP DEFAULT NOW()
);

-- Soil statistics (derived from SSURGO / gSSURGO)
CREATE TABLE ava_soil_stats (
    id SERIAL PRIMARY KEY,
    ava_id INTEGER REFERENCES avas(id) ON DELETE CASCADE UNIQUE,
    dominant_texture VARCHAR(100),      -- e.g. 'Silty clay loam'
    ph_mean NUMERIC(5, 2),
    ph_min NUMERIC(5, 2),
    ph_max NUMERIC(5, 2),
    drainage_dominant VARCHAR(100),     -- e.g. 'Well drained'
    depth_mean_in NUMERIC(10, 2),
    organic_matter_pct NUMERIC(8, 4),
    data_source VARCHAR(100),           -- 'SSURGO', 'gSSURGO'
    computed_at TIMESTAMP DEFAULT NOW()
);
