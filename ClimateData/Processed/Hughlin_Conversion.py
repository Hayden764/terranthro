#!/usr/local/Caskroom/miniforge/base/bin/python
import os
import zipfile
import numpy as np
import rasterio
from datetime import date, timedelta

# ─────────────────────────────────────────
# CONFIGURATION — only edit this section
# ─────────────────────────────────────────
YEAR        = 2025
START_MONTH = 4  # April
END_MONTH   = 9  # September (Huglin ends Sept 30, not Oct 31)

UNPROCESSED_DIR = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Unprocessed"
PROCESSED_DIR   = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Processed"
# ─────────────────────────────────────────

start_date  = date(YEAR, START_MONTH, 1)
end_date    = date(YEAR, END_MONTH, 30)  # Sept always ends on 30
output_path = os.path.join(PROCESSED_DIR, f"Huglin_{YEAR}.tif")

os.makedirs(PROCESSED_DIR, exist_ok=True)

def read_tif_from_zip(zip_path):
    """Open a tif from inside a zip without fully extracting it"""
    with zipfile.ZipFile(zip_path, 'r') as z:
        tif_name = [f for f in z.namelist() if f.endswith('.tif') and not f.endswith('.aux.xml')][0]
        with z.open(tif_name) as tif_file:
            with rasterio.open(tif_file) as src:
                data = src.read(1).astype(np.float32)
                data[data == src.nodata] = np.nan
                return data, src.profile

def build_k_raster(profile):
    """
    Build a k coefficient raster based on latitude.
    Every pixel gets its own k value interpolated from the Huglin table.
    """
    height = profile['height']
    width  = profile['width']
    transform = profile['transform']

    # Build array of latitude values for every pixel row
    # transform * (col, row) gives (x, y) in the raster's CRS
    rows, cols = np.meshgrid(np.arange(height), np.arange(width), indexing='ij')
    # For a geographic CRS (WGS84), y coordinate = latitude
    lats = transform.f + (rows * transform.e)  # transform.f = top y, transform.e = pixel height (negative)

    # Huglin k coefficient lookup table
    lat_breaks = np.array([40, 42, 44, 46, 48, 50])
    k_values   = np.array([1.00, 1.02, 1.03, 1.04, 1.05, 1.06])

    # Interpolate k for every pixel latitude
    k_raster = np.interp(lats, lat_breaks, k_values)

    # Clamp: below 40N stays at 1.00, above 50N stays at 1.06
    k_raster = np.clip(k_raster, 1.00, 1.06)

    return k_raster.astype(np.float32)

# Accumulation array, k raster, and profile
accumulated_hi = None
k_raster       = None
profile        = None

# Loop through every day in the growing season
current = start_date
while current <= end_date:
    date_str = current.strftime("%Y%m%d")

    tmax_path  = os.path.join(UNPROCESSED_DIR, f"prism_tmax_us_30s_{date_str}.zip")
    tmean_path = os.path.join(UNPROCESSED_DIR, f"prism_tmean_us_30s_{date_str}.zip")

    if not os.path.exists(tmax_path) or not os.path.exists(tmean_path):
        print(f"Missing files for {date_str}, skipping...")
        current += timedelta(days=1)
        continue

    print(f"Processing {date_str}...")

    tmax,  profile = read_tif_from_zip(tmax_path)
    tmean, _       = read_tif_from_zip(tmean_path)

    # Build k raster once on first valid day
    if k_raster is None:
        print("Building latitude-based k coefficient raster...")
        k_raster = build_k_raster(profile)
        print(f"Sample k values (should range 1.00-1.06): {k_raster[500:503, 500:503]}")
        accumulated_hi = np.zeros_like(tmax)

    # Huglin formula — temperatures already in Celsius, base temp is 10°C
    # Floor each term at 0 before summing
    tmean_term = np.maximum(tmean - 10, 0)
    tmax_term  = np.maximum(tmax  - 10, 0)
    daily_hi   = ((tmean_term + tmax_term) / 2) * k_raster

    # Accumulate, ignoring NaN cells
    accumulated_hi = np.where(np.isnan(daily_hi), accumulated_hi, accumulated_hi + daily_hi)

    current += timedelta(days=1)

# Write output raster
print("Writing Huglin Index raster...")
profile.update(dtype=rasterio.float32, count=1, nodata=np.nan)

with rasterio.open(output_path, 'w', **profile) as dst:
    dst.write(accumulated_hi.astype(np.float32), 1)

print(f"Done! Output saved to {output_path}")