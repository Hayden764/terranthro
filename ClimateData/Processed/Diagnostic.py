#!/usr/local/Caskroom/miniforge/base/bin/python
import zipfile
import numpy as np
import rasterio

zip_path = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Unprocessed/prism_tmax_us_30s_20250701.zip"

with zipfile.ZipFile(zip_path, 'r') as z:
    tif_name = [f for f in z.namelist() if f.endswith('.tif') and not f.endswith('.aux.xml')][0]
    with z.open(tif_name) as tif_file:
        with rasterio.open(tif_file) as src:
            data = src.read(1).astype('float32')
            data[data == src.nodata] = float('nan')
            print(f"Min: {np.nanmin(data):.2f}")
            print(f"Max: {np.nanmax(data):.2f}")
            print(f"Mean: {np.nanmean(data):.2f}")
            print(f"Sample values: {data[500:503, 500:503]}")