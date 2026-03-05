#!/usr/local/Caskroom/miniforge/base/bin/python
"""
Convert processed climate index TIFs to Cloud Optimized GeoTIFFs (COGs)
and copy them into client/public/climate-data/indices/

Output naming convention:
  {name}_{year}_cog.tif   e.g. gdd_winkler_accumulated_2025_cog.tif

Continuous layers   → Float32, no special treatment
Classified layers   → UInt8, preserved as-is (1–8 discrete classes)
"""

import os
import subprocess
import shutil

PROCESSED_DIR = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Processed"
OUTPUT_DIR    = "/Volumes/T7/Terranthro/TerranthroSite/client/public/climate-data/indices"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# (source_filename, output_slug, is_classified)
FILES = [
    ("GDD_Winkler_2025_accumulated.tif",  "gdd_winkler_accumulated_2025",  False),
    ("GDD_Winkler_2025_classified.tif",   "gdd_winkler_classified_2025",   True),
    ("GST_SmartHobday_2025.tif",          "gst_smarthobday_2025",          False),
    ("Huglin_2025.tif",                   "huglin_2025",                   False),
    ("Huglin_2025_classified.tif",        "huglin_classified_2025",        True),
]

for src_name, slug, is_classified in FILES:
    src_path = os.path.join(PROCESSED_DIR, src_name)
    dst_name = f"{slug}_cog.tif"
    dst_path = os.path.join(OUTPUT_DIR, dst_name)

    if not os.path.exists(src_path):
        print(f"⚠️  SKIP (not found): {src_name}")
        continue

    print(f"🔄 Converting {src_name} → {dst_name} ...")

    # Build gdal_translate command
    # COG creation options: tiled + LZW + overview levels
    cmd = [
        "gdal_translate",
        src_path, dst_path,
        "-of", "COG",
        "-co", "COMPRESS=LZW",
        "-co", "PREDICTOR=2" if not is_classified else "PREDICTOR=1",
        "-co", "OVERVIEWS=AUTO",
        "-co", "RESAMPLING=NEAREST" if is_classified else "RESAMPLING=AVERAGE",
        "-co", "TILING_SCHEME=GoogleMapsCompatible",  # WebMercator-aligned tiles
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"  ❌ ERROR:\n{result.stderr}")
    else:
        size_mb = os.path.getsize(dst_path) / 1024 / 1024
        print(f"  ✅ Done — {size_mb:.1f} MB → {dst_path}")

print("\n✅ All done.")
print(f"Files in {OUTPUT_DIR}:")
for f in sorted(os.listdir(OUTPUT_DIR)):
    if f.endswith(".tif"):
        size = os.path.getsize(os.path.join(OUTPUT_DIR, f)) / 1024 / 1024
        print(f"  {f}  ({size:.1f} MB)")
