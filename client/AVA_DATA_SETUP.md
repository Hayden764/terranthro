# AVA Data Integration Guide

## Overview
This project uses American Viticultural Area (AVA) GeoJSON data from the UC Davis Library repository.

## Data Source
**UC Davis AVA Repository**: https://github.com/UCDavisLibrary/ava/tree/master/avas_by_state

## Setup Instructions

### Step 1: Download AVA Files

Download the following GeoJSON files from the UC Davis repository and place them in `client/public/data/`:

#### Top Wine States (Priority):
- [ ] **California** - `ca-avas.geojson` → Save as `CA_avas.geojson`
- [ ] **Oregon** - `or-avas.geojson` → Save as `OR_avas.geojson`
- [ ] **Washington** - `wa-avas.geojson` → Save as `WA_avas.geojson`
- [ ] **New York** - `ny-avas.geojson` → Save as `NY_avas.geojson`
- [ ] **Texas** - `tx-avas.geojson` → Save as `TX_avas.geojson`
- [ ] **Virginia** - `va-avas.geojson` → Save as `VA_avas.geojson`

#### Additional Wine States:
- [ ] **Pennsylvania** - `pa-avas.geojson` → Save as `PA_avas.geojson`
- [ ] **Ohio** - `oh-avas.geojson` → Save as `OH_avas.geojson`
- [ ] **Michigan** - `mi-avas.geojson` → Save as `MI_avas.geojson`
- [ ] **Missouri** - `mo-avas.geojson` → Save as `MO_avas.geojson`
- [ ] **North Carolina** - `nc-avas.geojson` → Save as `NC_avas.geojson`
- [ ] **New Jersey** - `nj-avas.geojson` → Save as `NJ_avas.geojson`
- [ ] **Illinois** - `il-avas.geojson` → Save as `IL_avas.geojson`
- [ ] **Indiana** - `in-avas.geojson` → Save as `IN_avas.geojson`
- [ ] **Colorado** - `co-avas.geojson` → Save as `CO_avas.geojson`
- [ ] **Arizona** - `az-avas.geojson` → Save as `AZ_avas.geojson`
- [ ] **New Mexico** - `nm-avas.geojson` → Save as `NM_avas.geojson`
- [ ] **Georgia** - `ga-avas.geojson` → Save as `GA_avas.geojson`
- [ ] **Idaho** - `id-avas.geojson` → Save as `ID_avas.geojson`
- [ ] **Maryland** - `md-avas.geojson` → Save as `MD_avas.geojson`
- [ ] **Connecticut** - `ct-avas.geojson` → Save as `CT_avas.geojson`
- [ ] **Massachusetts** - `ma-avas.geojson` → Save as `MA_avas.geojson`
- [ ] **Rhode Island** - `ri-avas.geojson` → Save as `RI_avas.geojson`
- [ ] **Vermont** - `vt-avas.geojson` → Save as `VT_avas.geojson`
- [ ] **New Hampshire** - `nh-avas.geojson` → Save as `NH_avas.geojson`
- [ ] **Maine** - `me-avas.geojson` → Save as `ME_avas.geojson`
- [ ] **Wisconsin** - `wi-avas.geojson` → Save as `WI_avas.geojson`
- [ ] **Minnesota** - `mn-avas.geojson` → Save as `MN_avas.geojson`
- [ ] **Iowa** - `ia-avas.geojson` → Save as `IA_avas.geojson`
- [ ] **Kentucky** - `ky-avas.geojson` → Save as `KY_avas.geojson`
- [ ] **Tennessee** - `tn-avas.geojson` → Save as `TN_avas.geojson`
- [ ] **Oklahoma** - `ok-avas.geojson` → Save as `OK_avas.geojson`

### Step 2: File Naming Convention

**Important**: The UC Davis repository uses lowercase state abbreviations (e.g., `ca-avas.geojson`). 

Rename them to uppercase for consistency with Terranthro:
```bash
ca-avas.geojson → CA_avas.geojson
or-avas.geojson → OR_avas.geojson
wa-avas.geojson → WA_avas.geojson
```

### Step 3: Directory Structure

Your final structure should look like:
```
client/
├── public/
│   └── data/
│       ├── CA_avas.geojson
│       ├── OR_avas.geojson
│       ├── WA_avas.geojson
│       ├── NY_avas.geojson
│       ├── TX_avas.geojson
│       └── ... (all other states)
└── src/
    └── config/
        ├── stateConfig.js
        └── avaFileMap.js
```

### Step 4: Quick Download Script (Optional)

If you prefer to automate the download, you can use this bash script:

```bash
#!/bin/bash
# Download AVA files from UC Davis repository

BASE_URL="https://raw.githubusercontent.com/UCDavisLibrary/ava/master/avas_by_state"
OUTPUT_DIR="client/public/data"

# Create directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Array of state abbreviations
states=("ca" "or" "wa" "ny" "tx" "va" "pa" "oh" "mi" "mo" "nc" "nj" "il" "in" "co" "az" "nm" "ga" "id" "md" "ct" "ma" "ri" "vt" "nh" "me" "wi" "mn" "ia" "ky" "tn" "ok")

for state in "${states[@]}"; do
  # Download and rename
  curl -L "$BASE_URL/${state}-avas.geojson" -o "$OUTPUT_DIR/${state^^}_avas.geojson"
  echo "Downloaded ${state^^}_avas.geojson"
done

echo "All AVA files downloaded successfully!"
```

Save as `download-avas.sh` and run:
```bash
chmod +x download-avas.sh
./download-avas.sh
```

## Configuration

The application is already configured to load AVA data dynamically:

- **`src/config/avaFileMap.js`** - Maps state slugs to AVA file names
- **`src/config/stateConfig.js`** - State configurations with AVA file paths
- **`StatePage.jsx`** - Fetches and renders AVA data for each state

## Usage

Once files are downloaded:

1. Navigate to any wine state on the national map
2. The state page will automatically load that state's AVA boundaries
3. Hover over AVAs to see their names
4. Click AVAs to navigate to detailed AVA pages

## Troubleshooting

### Files not loading?
- Check file paths in browser DevTools Network tab
- Ensure files are in `public/data/` not `src/data/`
- Verify file names match exactly: `{STATE}_avas.geojson`

### Missing AVAs for a state?
- Check if the UC Davis repository has data for that state
- Some states may not have AVAs defined yet
- The app gracefully handles missing data by showing just the state boundary

## License

AVA data is from UC Davis Library AVA Project, which aggregates data from the Alcohol and Tobacco Tax and Trade Bureau (TTB).

**Attribution**: UC Davis Library, Alcohol and Tobacco Tax and Trade Bureau
