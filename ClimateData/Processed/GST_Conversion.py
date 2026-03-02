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

# Accumulation array and day counter
accumulated_tmean = None
profile = None
day_count = 0

def read_tif_from_zip(zip_path):
    """Open a tif from inside a zip without fully extracting it"""
    with zipfile.ZipFile(zip_path, 'r') as z:
        tif_name = [f for f in z.namelist() if f.endswith('.tif') and not f.endswith('.aux.xml')][0]
        with z.open(tif_name) as tif_file:
            with rasterio.open(tif_file) as src:
                data = src.read(1).astype(np.float32)
                data[data == src.nodata] = np.nan
                return data, src.profile

# Loop through every day in the growing season
current = start_date
while current <= end_date:
    date_str = current.strftime("%Y%m%d")

    tmean_path = os.path.join(unprocessed_dir, f"prism_tmean_us_30s_{date_str}.zip")

    if not os.path.exists(tmean_path):
        print(f"Missing file for {date_str}, skipping...")
        current += timedelta(days=1)
        continue

    print(f"Processing {date_str}...")

    tmean, profile = read_tif_from_zip(tmean_path)

    # Sanity check on first day
    if accumulated_tmean is None:
        print(f"Sample tmean values (Celsius): {tmean[500:503, 500:503]}")
        accumulated_tmean = np.zeros_like(tmean)

    # Accumulate tmean, ignoring NaN cells
    accumulated_tmean = np.where(np.isnan(tmean), accumulated_tmean, accumulated_tmean + tmean)
    day_count += 1

    current += timedelta(days=1)

# Divide accumulated tmean by number of days to get GST
gst = accumulated_tmean / day_count
print(f"GST calculated over {day_count} days")

# Write output raster
output_path = os.path.join(output_dir, "GST_SmartHobday_2025.tif")
profile.update(dtype=rasterio.float32, count=1, nodata=np.nan)

with rasterio.open(output_path, 'w', **profile) as dst:
    dst.write(gst.astype(np.float32), 1)

print(f"Done! Output saved to {output_path}")