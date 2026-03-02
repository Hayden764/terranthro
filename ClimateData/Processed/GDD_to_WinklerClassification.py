#!/usr/local/Caskroom/miniforge/base/bin/python
import os
import numpy as np
import rasterio
from datetime import date

# ─────────────────────────────────────────
# CONFIGURATION — only edit this section
# ─────────────────────────────────────────
YEAR        = 2025
START_MONTH = 4   # April
END_MONTH   = 10  # October
BASE_TEMP   = 50.0  # Winkler base temp in Fahrenheit

UNPROCESSED_DIR = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Unprocessed"
PROCESSED_DIR   = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Processed"
# ─────────────────────────────────────────

# Auto-build dates and output paths from config
start_date   = date(YEAR, START_MONTH, 1)
end_date     = date(YEAR, END_MONTH, 31) if END_MONTH in [1,3,5,7,8,10,12] else date(YEAR, END_MONTH, 30)
input_path   = os.path.join(PROCESSED_DIR, f"GDD_Winkler_{YEAR}_accumulated.tif")
output_path  = os.path.join(PROCESSED_DIR, f"GDD_Winkler_{YEAR}_classified.tif")

os.makedirs(PROCESSED_DIR, exist_ok=True)

def classify_winkler(gdd):
    classified = np.zeros_like(gdd, dtype=np.uint8)
    classified[gdd >= 0]    = 1   # Below Region Ia (0-1499)
    classified[gdd >= 1500] = 2   # Region Ia  (1500-2000)
    classified[gdd >= 2001] = 3   # Region Ib  (2001-2500)
    classified[gdd >= 2501] = 4   # Region II  (2501-3000)
    classified[gdd >= 3001] = 5   # Region III (3001-3500)
    classified[gdd >= 3501] = 6   # Region IV  (3501-4000)
    classified[gdd >= 4001] = 7   # Region V   (4001-4900)
    classified[gdd >  4900] = 8   # Above Region V
    classified[np.isnan(gdd)] = 0 # nodata
    return classified

labels = {
    0: "No Data",
    1: "Below Region Ia (0-1499 GDD)",
    2: "Region Ia  (1500-2000 GDD)",
    3: "Region Ib  (2001-2500 GDD)",
    4: "Region II  (2501-3000 GDD)",
    5: "Region III (3001-3500 GDD)",
    6: "Region IV  (3501-4000 GDD)",
    7: "Region V   (4001-4900 GDD)",
    8: "Above Region V (4900+ GDD)"
}

print(f"Reading {YEAR} GDD raster...")
with rasterio.open(input_path) as src:
    gdd = src.read(1).astype(np.float32)
    gdd[gdd == src.nodata] = np.nan
    profile = src.profile

print(f"Classifying {YEAR} into Winkler regions...")
classified = classify_winkler(gdd)

print(f"\nWinkler Classification Summary — {YEAR}:")
print("-" * 40)
for class_val, label in labels.items():
    pixel_count = np.sum(classified == class_val)
    print(f"  {label}: {pixel_count:,} pixels")

profile.update(dtype=rasterio.uint8, count=1, nodata=0)

print("\nWriting classified raster...")
with rasterio.open(output_path, 'w', **profile) as dst:
    dst.write(classified, 1)

print(f"Done! Output saved to {output_path}")