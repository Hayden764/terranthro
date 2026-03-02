#!/usr/local/Caskroom/miniforge/base/bin/python
import os
import numpy as np
import rasterio

# ─────────────────────────────────────────
# CONFIGURATION — only edit this section
# ─────────────────────────────────────────
YEAR = 2025

PROCESSED_DIR = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Processed"
# ─────────────────────────────────────────

input_path  = os.path.join(PROCESSED_DIR, f"Huglin_{YEAR}.tif")
output_path = os.path.join(PROCESSED_DIR, f"Huglin_{YEAR}_classified.tif")

def classify_huglin(hi):
    """Classify Huglin Index array into climate classes"""
    classified = np.zeros_like(hi, dtype=np.uint8)

    classified[hi >= 0]    = 1   # Too Cold       (below 1000)
    classified[hi >= 1000] = 2   # Very Cool      (1000-1199)
    classified[hi >= 1200] = 3   # Cool           (1200-1399)
    classified[hi >= 1400] = 4   # Temperate      (1400-1599)
    classified[hi >= 1600] = 5   # Warm Temperate (1600-1799)
    classified[hi >= 1800] = 6   # Warm           (1800-1999)
    classified[hi >= 2000] = 7   # Hot            (2000-2399)
    classified[hi >= 2400] = 8   # Very Hot       (2400+)
    classified[np.isnan(hi)] = 0 # nodata

    return classified

labels = {
    0: "No Data",
    1: "Too Cold        (below 1000 HI)",
    2: "Very Cool       (1000-1199 HI)",
    3: "Cool            (1200-1399 HI)",
    4: "Temperate       (1400-1599 HI)",
    5: "Warm Temperate  (1600-1799 HI)",
    6: "Warm            (1800-1999 HI)",
    7: "Hot             (2000-2399 HI)",
    8: "Very Hot        (2400+ HI)",
}

print(f"Reading {YEAR} Huglin raster...")
with rasterio.open(input_path) as src:
    hi = src.read(1).astype(np.float32)
    hi[hi == src.nodata] = np.nan
    profile = src.profile

print(f"Classifying {YEAR} into Huglin classes...")
classified = classify_huglin(hi)

print(f"\nHuglin Classification Summary — {YEAR}:")
print("-" * 45)
for class_val, label in labels.items():
    pixel_count = np.sum(classified == class_val)
    print(f"  {label}: {pixel_count:,} pixels")

profile.update(dtype=rasterio.uint8, count=1, nodata=0)

print("\nWriting classified raster...")
with rasterio.open(output_path, 'w', **profile) as dst:
    dst.write(classified, 1)

print(f"Done! Output saved to {output_path}")