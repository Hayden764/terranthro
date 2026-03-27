#!/usr/local/Caskroom/miniforge/base/bin/python
"""
Growing Season Precipitation (PPT) — 2025 Vintage
===================================================
Accumulates total precipitation (mm) across the growing season
(April 1 – October 31, 2025) from daily PRISM 30-arcsecond grids.

Also produces a classified layer (5 classes by mm totals).

Outputs (written to ClimateData/Processed/):
  PPT_GrowingSeason_2025_total.tif        — continuous mm total
  PPT_GrowingSeason_2025_classified.tif   — 5-class (UInt8)

Run convert_to_cog.py afterward to push COGs into
client/public/climate-data/indices/.
"""

import os
import zipfile
import numpy as np
import rasterio
from datetime import date, timedelta

# ── Paths ──────────────────────────────────────────────────────────────────────
UNPROCESSED_DIR = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Unprocessed"
OUTPUT_DIR      = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Settings ───────────────────────────────────────────────────────────────────
START_DATE = date(2025, 4, 1)
END_DATE   = date(2025, 10, 31)

# PPT classification thresholds (mm over the growing season).
# Rough US wine-region benchmarks:
#   < 100 mm  → Very Dry  (Class 1) — drought / arid
#   100–250   → Dry       (Class 2) — e.g. Napa, most CA
#   250–450   → Moderate  (Class 3) — e.g. Willamette, Finger Lakes
#   450–650   → Wet       (Class 4) — e.g. Willamette high-rainfall years
#   > 650 mm  → Very Wet  (Class 5) — rare / problematic for viticulture
PPT_BREAKS  = [100, 250, 450, 650]   # mm boundaries between 5 classes
CLASS_NAMES = {
    1: "Very Dry (<100 mm)",
    2: "Dry (100–250 mm)",
    3: "Moderate (250–450 mm)",
    4: "Wet (450–650 mm)",
    5: "Very Wet (>650 mm)",
}

# ── Helpers ────────────────────────────────────────────────────────────────────
def read_ppt_from_zip(zip_path: str):
    """
    Read precipitation data (mm) from a PRISM daily zip.
    PRISM ppt is already in mm — no unit conversion needed.
    Returns (data_array, rasterio_profile).
    """
    with zipfile.ZipFile(zip_path, "r") as z:
        tif_names = [
            f for f in z.namelist()
            if f.endswith(".tif") and not f.endswith(".aux.xml")
        ]
        if not tif_names:
            raise ValueError(f"No .tif found in {zip_path}")
        tif_name = tif_names[0]
        with z.open(tif_name) as tif_file:
            with rasterio.open(tif_file) as src:
                data = src.read(1).astype(np.float32)
                nodata = src.nodata
                if nodata is not None:
                    data[data == nodata] = np.nan
                return data, src.profile


def classify_ppt(total_mm: np.ndarray, breaks: list) -> np.ndarray:
    """
    Classify a continuous PPT array into discrete integer classes (1-based).
    NaN cells stay NaN (returned as float32 with NaN, caller handles nodata).
    """
    out = np.ones_like(total_mm, dtype=np.float32)
    for i, threshold in enumerate(breaks, start=2):
        out = np.where(total_mm >= threshold, float(i), out)
    out[np.isnan(total_mm)] = np.nan
    return out


# ── Main accumulation loop ──────────────────────────────────────────────────────
print(f"🌧  Growing Season PPT Accumulation: {START_DATE} → {END_DATE}")
print(f"   Source: {UNPROCESSED_DIR}")
print()

accumulated_ppt = None
profile = None
days_processed = 0
days_missing = 0

current = START_DATE
while current <= END_DATE:
    date_str = current.strftime("%Y%m%d")
    zip_path = os.path.join(UNPROCESSED_DIR, f"prism_ppt_us_30s_{date_str}.zip")

    if not os.path.exists(zip_path):
        print(f"  ⚠️  Missing: prism_ppt_us_30s_{date_str}.zip — skipping")
        days_missing += 1
        current += timedelta(days=1)
        continue

    try:
        ppt_day, day_profile = read_ppt_from_zip(zip_path)
    except Exception as e:
        print(f"  ❌ Error reading {date_str}: {e} — skipping")
        days_missing += 1
        current += timedelta(days=1)
        continue

    # First valid day — initialise accumulator and capture profile
    if accumulated_ppt is None:
        accumulated_ppt = np.zeros_like(ppt_day)
        profile = day_profile
        print(f"  Raster shape : {ppt_day.shape}")
        print(f"  Sample values (should be mm, 0–50 range): {ppt_day[500:503, 500:503]}")
        print()

    # Add daily ppt; skip NaN cells (treat as 0 rain, same as GDD scripts)
    accumulated_ppt = np.where(
        np.isnan(ppt_day),
        accumulated_ppt,
        accumulated_ppt + ppt_day,
    )

    days_processed += 1
    if days_processed % 30 == 0:
        print(f"  ✓ Processed {days_processed} days (latest: {date_str})")

    current += timedelta(days=1)

if accumulated_ppt is None:
    print("❌ No PPT files found — aborting.")
    raise SystemExit(1)

print(f"\n  Days processed : {days_processed}")
print(f"  Days missing   : {days_missing}")
print(f"  PPT range      : {np.nanmin(accumulated_ppt):.1f} – {np.nanmax(accumulated_ppt):.1f} mm")
print(f"  PPT mean       : {np.nanmean(accumulated_ppt):.1f} mm")

# ── Write continuous total ──────────────────────────────────────────────────────
total_path = os.path.join(OUTPUT_DIR, "PPT_GrowingSeason_2025_total.tif")
profile.update(dtype=rasterio.float32, count=1, nodata=np.nan)

with rasterio.open(total_path, "w", **profile) as dst:
    dst.write(accumulated_ppt.astype(np.float32), 1)

size_mb = os.path.getsize(total_path) / 1024 / 1024
print(f"\n✅ Total PPT saved  → {total_path}  ({size_mb:.1f} MB)")

# ── Write classified layer ──────────────────────────────────────────────────────
classified_f32 = classify_ppt(accumulated_ppt, PPT_BREAKS)

classified_path = os.path.join(OUTPUT_DIR, "PPT_GrowingSeason_2025_classified.tif")
class_profile = profile.copy()
class_profile.update(dtype=rasterio.uint8, count=1, nodata=255)

with rasterio.open(classified_path, "w", **class_profile) as dst:
    out_uint8 = np.where(np.isnan(classified_f32), 255, classified_f32).astype(np.uint8)
    dst.write(out_uint8, 1)

size_mb = os.path.getsize(classified_path) / 1024 / 1024
print(f"✅ Classified PPT   → {classified_path}  ({size_mb:.1f} MB)")

# ── Class distribution summary ──────────────────────────────────────────────────
valid_pixels = np.sum(~np.isnan(accumulated_ppt))
print("\n  Class distribution:")
for cls, label in CLASS_NAMES.items():
    out_uint8 = np.where(np.isnan(classified_f32), 255, classified_f32).astype(np.uint8)
    count = int(np.sum(out_uint8 == cls))
    pct = count / valid_pixels * 100
    print(f"    Class {cls} — {label:30s}  {count:>9,} px  ({pct:.1f}%)")

print("""
Next steps:
  1. Add these two entries to convert_to_cog.py FILES list:
       ("PPT_GrowingSeason_2025_total.tif",       "ppt_growing_season_2025_total",       False),
       ("PPT_GrowingSeason_2025_classified.tif",  "ppt_growing_season_2025_classified",  True),
  2. Run: python convert_to_cog.py
  3. COGs land in client/public/climate-data/indices/
""")
