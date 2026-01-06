-- schema.sql
-- Terranthro Database Schema

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- States with wine production
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(2) NOT NULL UNIQUE,
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_states_geometry ON states USING GIST(geometry);
CREATE INDEX idx_states_centroid ON states USING GIST(centroid);

-- American Viticultural Areas
CREATE TABLE avas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state_id INTEGER REFERENCES states(id),
    ttb_id VARCHAR(50),  -- Official TTB identifier
    geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    approved_date DATE,
    area_acres NUMERIC(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_avas_geometry ON avas USING GIST(geometry);
CREATE INDEX idx_avas_centroid ON avas USING GIST(centroid);
CREATE INDEX idx_avas_state ON avas(state_id);

-- Production data by state and year
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

-- Raster layer metadata (actual rasters stored as COGs in object storage)
CREATE TABLE raster_layers (
    id SERIAL PRIMARY KEY,
    layer_type VARCHAR(50) NOT NULL,  -- 'climate', 'soil', 'terrain', etc.
    layer_name VARCHAR(100) NOT NULL,  -- 'temperature', 'precipitation', etc.
    ava_id INTEGER REFERENCES avas(id),
    time_period VARCHAR(50),  -- '2023-01', 'annual-2023', etc.
    storage_url TEXT NOT NULL,  -- S3/Spaces URL to COG file
    bbox GEOMETRY(Polygon, 4326),
    resolution_meters NUMERIC(10, 2),
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_raster_layers_ava ON raster_layers(ava_id);
CREATE INDEX idx_raster_layers_type ON raster_layers(layer_type, layer_name);

-- Vineyard parcels (detailed level)
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
