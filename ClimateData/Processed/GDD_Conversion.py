#!/usr/local/Caskroom/miniforge/base/bin/python
import os
import zipfile
import numpy as np
import rasterio
from datetime import date, timedelta

# Paths
unprocessed_dir = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Unprocessed"
output_dir = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Processed"
os.makedirs(output_dir, exist_ok=True)

# Settings
start_date = date(2025, 4, 1)
end_date = date(2025, 10, 31)
base_temp = 50.0  # Winkler base temp in Fahrenheit

# Accumulation array and raster metadata, initialized on first valid day
accumulated_gdd = None
profile = None

def read_tif_from_zip(zip_path):
    """Open a tif from inside a zip without fully extracting it"""
    with zipfile.ZipFile(zip_path, 'r') as z:
        tif_name = [f for f in z.namelist() if f.endswith('.tif') and not f.endswith('.aux.xml')][0]
        with z.open(tif_name) as tif_file:
            with rasterio.open(tif_file) as src:
                data = src.read(1).astype(np.float32)
                data[data == src.nodata] = np.nan  # mask nodata values
                return data, src.profile

# Loop through every day in the growing season
current = start_date
while current <= end_date:
    date_str = current.strftime("%Y%m%d")

    tmax_path = os.path.join(unprocessed_dir, f"prism_tmax_us_30s_{date_str}.zip")
    tmin_path = os.path.join(unprocessed_dir, f"prism_tmin_us_30s_{date_str}.zip")

    if not os.path.exists(tmax_path) or not os.path.exists(tmin_path):
        print(f"Missing files for {date_str}, skipping...")
        current += timedelta(days=1)
        continue

    print(f"Processing {date_str}...")

    tmax, profile = read_tif_from_zip(tmax_path)
    tmin, _       = read_tif_from_zip(tmin_path)

    # Sanity check on first day — confirm values are Celsius range
    if accumulated_gdd is None:
        print(f"Sample tmax values (should be Celsius, ~15-35): {tmax[500:503, 500:503]}")

    # Convert Celsius to Fahrenheit
    tmax_f = (tmax * 9/5) + 32
    tmin_f = (tmin * 9/5) + 32

    # GDD formula: ((tmax + tmin) / 2) - base_temp, floored at 0
    daily_gdd = np.maximum(((tmax_f + tmin_f) / 2) - base_temp, 0)

    # Initialize accumulation array on first valid day
    if accumulated_gdd is None:
        accumulated_gdd = np.zeros_like(daily_gdd)

    # Add today's GDD, ignoring NaN cells
    accumulated_gdd = np.where(np.isnan(daily_gdd), accumulated_gdd, accumulated_gdd + daily_gdd)

    current += timedelta(days=1)

# Write output raster
output_path = os.path.join(output_dir, "GDD_Winkler_2025_accumulated.tif")
profile.update(dtype=rasterio.float32, count=1, nodata=np.nan)

with rasterio.open(output_path, 'w', **profile) as dst:
    dst.write(accumulated_gdd.astype(np.float32), 1)

print(f"Done! Output saved to {output_path}")