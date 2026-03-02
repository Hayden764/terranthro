import requests
import time
from datetime import date, timedelta
import os

base_url = "https://services.nacse.org/prism/data/get/us/800m"
variables = ["tmax", "tmin", "tmean", "ppt"]
start_date = date(2025, 4, 1)
end_date = date(2025, 10, 31)
output_dir = "/Volumes/T7/Terranthro/TerranthroSite/ClimateData/Unprocessed"

os.makedirs(output_dir, exist_ok=True)

current = start_date
while current <= end_date:
    date_str = current.strftime("%Y%m%d")
    
    for var in variables:
        url = f"{base_url}/{var}/{date_str}"
        
        # Build expected filename to check before requesting
        expected_filename = f"prism_{var}_us_800m_{date_str}.zip"
        filepath = os.path.join(output_dir, expected_filename)

        if os.path.exists(filepath):
            print(f"Already exists, skipping {var} {date_str}")
            continue

        print(f"Downloading {var} for {date_str}...")
        response = requests.get(url, stream=True)
        
        # Override with actual filename from header if available
        cd = response.headers.get("Content-Disposition", "")
        if "filename=" in cd:
            filename = cd.split("filename=")[-1].strip('"')
            filepath = os.path.join(output_dir, filename)
        
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        time.sleep(2)
    
    current += timedelta(days=1)

print("Done!")