/**
 * layerInfoContent.js
 * Descriptive metadata for every data layer displayed in InfoPanel.
 * Keyed by layer ID (must match CLIMATE_LAYER_TYPES, INDEX_LAYER_TYPES, TOPO_LAYER_TYPES).
 *
 * Each entry shape:
 *   icon    — emoji used as a visual anchor
 *   why     — plain-language explanation of what the layer shows & why it matters for viticulture
 *   formula — the calculation shown in monospace (string or JSX-ready string)
 *   period  — temporal coverage of the data
 *   source  — attribution
 *   ranges  — (optional) array of { label, desc } reference thresholds
 */

export const LAYER_INFO = {

  // ── PRISM Climate Normals ────────────────────────────────────────────────

  tdmean: {
    icon: '🌡️',
    why: 'Mean daily temperature drives vine phenology, sugar accumulation, and acidity balance. Cooler means preserve natural acidity while warmer sites accelerate ripening — understanding the average thermal regime helps identify which varieties thrive in each AVA.',
    formula: 'T̄ = (Tmax + Tmin) / 2\n\n30-year average (1991–2020) of daily mean temperature for each calendar month.',
    period: '1991–2020 PRISM Climate Normals',
    source: 'PRISM Climate Group, Oregon State University (800m gridded normals)',
    ranges: [
      { label: '< 10 °C',    desc: 'Too cool for most Vitis vinifera varieties; suitable for cold-hardy hybrids.' },
      { label: '10–14 °C',   desc: 'Cool-climate window — Pinot Noir, Riesling, Chardonnay.' },
      { label: '14–18 °C',   desc: 'Moderate — Cabernet Franc, Merlot, Syrah.' },
      { label: '18–22 °C',   desc: 'Warm — Zinfandel, Grenache, Mourvèdre.' },
      { label: '> 22 °C',    desc: 'Hot climate; requires heat-tolerant varieties or high-elevation sites.' },
    ],
  },

  tmax: {
    icon: '🔆',
    why: 'Maximum daily temperature reflects daytime heat accumulation that drives sugar production. Extreme midday heat can cause sunburn, reduce anthocyanins, and stall fermentation. Comparing Tmax across months reveals heat-spike risk periods.',
    formula: 'Average of daily Tmax for each calendar month\n\n30-year average (1991–2020).',
    period: '1991–2020 PRISM Climate Normals',
    source: 'PRISM Climate Group, Oregon State University (800m gridded normals)',
    ranges: [
      { label: '< 20 °C',    desc: 'Cool days — slow, even ripening; low sunburn risk.' },
      { label: '20–30 °C',   desc: 'Ideal daytime range for most premium red and white varieties.' },
      { label: '30–35 °C',   desc: 'Hot — stress risk begins; vine may shut down photosynthesis.' },
      { label: '> 35 °C',    desc: 'Extreme heat; high risk of berry shriveling and quality loss.' },
    ],
  },

  tmin: {
    icon: '❄️',
    why: 'Minimum temperature sets the floor for vine dormancy, frost risk, and cold hardiness requirements. Warm nights can prevent acid retention and elevate alcohol; cold nights preserve aromatics and freshness in warm climates.',
    formula: 'Average of daily Tmin for each calendar month\n\n30-year average (1991–2020).',
    period: '1991–2020 PRISM Climate Normals',
    source: 'PRISM Climate Group, Oregon State University (800m gridded normals)',
    ranges: [
      { label: '< −15 °C',   desc: 'Critical cold — risk of bud and trunk damage during dormancy.' },
      { label: '−15–0 °C',   desc: 'Normal winter cold; most V. vinifera varieties tolerate this range.' },
      { label: '0–10 °C',    desc: 'Cool nights during growing season — good acid retention.' },
      { label: '> 15 °C',    desc: 'Warm nights; may limit acid development and increase pH.' },
    ],
  },

  ppt: {
    icon: '🌧️',
    why: 'Precipitation timing and volume shape disease pressure, irrigation need, and harvest decisions. Mediterranean-pattern AVAs (wet winters, dry summers) produce concentrated fruit; summer rain regions require careful canopy management.',
    formula: 'Total monthly precipitation (mm)\n\n30-year average (1991–2020).',
    period: '1991–2020 PRISM Climate Normals',
    source: 'PRISM Climate Group, Oregon State University (800m gridded normals)',
    ranges: [
      { label: '< 25 mm/mo',  desc: 'Arid — irrigation essential; low disease pressure.' },
      { label: '25–75 mm/mo', desc: 'Semi-arid to moderate; supplemental irrigation often needed.' },
      { label: '75–150 mm/mo', desc: 'Adequate rainfall; canopy management critical in summer.' },
      { label: '> 150 mm/mo', desc: 'High rainfall; elevated fungal disease risk, dilution concerns at harvest.' },
    ],
  },

  // ── Growing-Season Indices ───────────────────────────────────────────────

  gdd_winkler_accumulated: {
    icon: '📈',
    why: 'Winkler Growing Degree Days measure total heat accumulation through the growing season. This continuous value shows the raw thermal energy available for ripening — higher GDD means hotter sites capable of fully ripening later-season varieties.',
    formula: 'GDD = Σ [Apr 1 – Oct 31] max(T̄ᵢ − 10°C, 0)\n\nwhere T̄ᵢ = (Tmax + Tmin) / 2 for each day i.',
    period: 'Growing season April – October',
    source: 'Terranthro — computed from PRISM daily data (4 km)',
    ranges: [
      { label: '< 1500 GDD',    desc: 'Region Ia — too cool for most V. vinifera.' },
      { label: '1500–2000 GDD', desc: 'Region Ia — Pinot Noir, Riesling, Chardonnay.' },
      { label: '2001–2500 GDD', desc: 'Region Ib — Pinot Noir, Merlot, Chardonnay.' },
      { label: '2501–3000 GDD', desc: 'Region II — Cabernet Sauvignon, Merlot, Syrah.' },
      { label: '3001–3500 GDD', desc: 'Region III — Zinfandel, Grenache, Mourvèdre.' },
      { label: '3501–4000 GDD', desc: 'Region IV — table grapes, very ripe reds.' },
      { label: '> 4000 GDD',    desc: 'Region V — extreme heat; premium wine difficult.' },
    ],
  },

  gdd_winkler_classified: {
    icon: '🗺️',
    why: 'Winkler Regions translate raw GDD accumulation into discrete climate classes used by viticulturists worldwide to match variety selection to site potential. The classification was developed at UC Davis and remains the most widely cited framework for California viticulture.',
    formula: 'Region = classify(GDD)\n\nIa ≤ 2000 · Ib ≤ 2500 · II ≤ 3000 · III ≤ 3500 · IV ≤ 4000 · V > 4000\n\nGDD = Σ [Apr–Oct] max((Tmax+Tmin)/2 − 10, 0)',
    period: 'Growing season April – October',
    source: 'Terranthro — computed from PRISM daily data; Winkler et al. (1974)',
    ranges: [
      { label: 'Region Ia',  desc: '≤ 2000 GDD — Sparkling wines, Riesling, Pinot Noir.' },
      { label: 'Region Ib',  desc: '2001–2500 — Chardonnay, Merlot, Pinot Noir.' },
      { label: 'Region II',  desc: '2501–3000 — Cabernet Sauvignon, Syrah, Merlot.' },
      { label: 'Region III', desc: '3001–3500 — Zinfandel, Grenache, Mourvèdre.' },
      { label: 'Region IV',  desc: '3501–4000 — Table grapes, fortified wines.' },
      { label: 'Region V',   desc: '> 4000 — Extremely hot; fine wine production challenging.' },
    ],
  },

  gst_smarthobday: {
    icon: '🌡️',
    why: 'Growing Season Temperature (GST) is a simple, internationally recognized index correlating mean growing-season temperature with wine style. Developed by Smart & Hobday (1980), it is widely used in climate-change viticulture research to benchmark regions globally.',
    formula: 'GST = mean(T̄ᵢ) for Apr 1 – Oct 31\n\nwhere T̄ᵢ = (Tmax + Tmin) / 2.',
    period: 'Growing season April – October',
    source: 'Terranthro — computed from PRISM daily data; Smart & Hobday (1980)',
    ranges: [
      { label: '< 13 °C',   desc: 'Too cool — marginal viticulture.' },
      { label: '13–15 °C',  desc: 'Cool — Riesling, Pinot Noir, sparkling.' },
      { label: '15–17 °C',  desc: 'Moderate cool — Chardonnay, Cabernet Franc.' },
      { label: '17–19 °C',  desc: 'Moderate warm — Merlot, Cabernet Sauvignon.' },
      { label: '19–21 °C',  desc: 'Warm — Syrah, Grenache, Zinfandel.' },
      { label: '> 21 °C',   desc: 'Hot — full-bodied reds, fortified styles.' },
    ],
  },

  huglin: {
    icon: '☀️',
    why: 'The Huglin Heliothermal Index weights daytime maximum temperature more heavily than nighttime minimum, capturing the contribution of solar heat during daylight hours when photosynthesis occurs. It is the dominant ripening index used in European and Southern Hemisphere viticulture research.',
    formula: 'HI = Σ [Apr 1 – Sep 30] [(T̄ᵢ − 10) + (Tmax,i − 10)] / 2 × d\n\nwhere d = day-length coefficient (1.02–1.06 by latitude); T̄ᵢ = (Tmax + Tmin) / 2.',
    period: 'Growing season April – September',
    source: 'Terranthro — computed from PRISM daily data; Huglin (1978)',
    ranges: [
      { label: '< 1000',       desc: 'Too cold — no commercial viticulture.' },
      { label: '1000–1199',    desc: 'Very cool — Müller-Thurgau, early Riesling.' },
      { label: '1200–1399',    desc: 'Cool — Riesling, Pinot Noir, Chardonnay.' },
      { label: '1400–1599',    desc: 'Temperate — Merlot, Cabernet Franc.' },
      { label: '1600–1799',    desc: 'Warm temperate — Cabernet Sauvignon.' },
      { label: '1800–1999',    desc: 'Warm — Syrah, Grenache.' },
      { label: '2000–2399',    desc: 'Hot — Mourvèdre, Zinfandel.' },
      { label: '> 2400',       desc: 'Very hot — fortified and table grape territory.' },
    ],
  },

  ppt_growing_season_2025: {
    icon: '🌧️',
    why: 'Total growing-season precipitation (April–October) reveals how much natural rainfall a vineyard receives during the critical ripening window. Low summer rainfall produces concentrated, disease-free fruit; high rainfall requires vigilant canopy management and fungal disease control.',
    formula: 'PPT = Σ [Apr 1 – Oct 31] daily precipitation (mm)\n\nComputed from PRISM daily 4 km gridded precipitation for the 2025 growing season.',
    period: 'Growing season April – October 2025',
    source: 'Terranthro — computed from PRISM daily data (4 km)',
    ranges: [
      { label: '< 100 mm',      desc: 'Arid growing season — irrigation essential; very low disease pressure.' },
      { label: '100–250 mm',    desc: 'Semi-arid — supplemental irrigation typically needed.' },
      { label: '250–500 mm',    desc: 'Moderate — most established vineyards can be dry-farmed.' },
      { label: '500–750 mm',    desc: 'Wet — careful canopy management required; fungal risk.' },
      { label: '> 750 mm',      desc: 'Very wet — high disease pressure; harvest timing critical.' },
    ],
  },

  huglin_classified: {
    icon: '🌍',
    why: 'The classified Huglin map assigns each pixel to one of eight discrete climate classes, making it straightforward to compare the Terranthro AVA against European benchmark appellations and global wine regions that use HI as their primary climate descriptor.',
    formula: 'HI = Σ [Apr–Sep] [(T̄ᵢ − 10) + (Tmax,i − 10)] / 2 × d\n\nClass boundaries: <1000 · 1000 · 1200 · 1400 · 1600 · 1800 · 2000 · 2400+',
    period: 'Growing season April – September',
    source: 'Terranthro — computed from PRISM daily data; Huglin (1978)',
    ranges: [
      { label: 'Too Cold',     desc: '< 1000 HI — below minimum threshold.' },
      { label: 'Very Cool',    desc: '1000–1199 — Champagne, Mosel.' },
      { label: 'Cool',         desc: '1200–1399 — Burgundy, Alsace.' },
      { label: 'Temperate',    desc: '1400–1599 — Bordeaux (cool years).' },
      { label: 'Warm Temp',    desc: '1600–1799 — Bordeaux (warm years), Rioja.' },
      { label: 'Warm',         desc: '1800–1999 — Southern Rhône, Tuscany.' },
      { label: 'Hot',          desc: '2000–2399 — Barossa Valley, Napa Valley.' },
      { label: 'Very Hot',     desc: '≥ 2400 — Extreme Mediterranean climates.' },
    ],
  },

  // ── Topography ───────────────────────────────────────────────────────────

  elevation: {
    icon: '⛰️',
    why: 'Elevation drives temperature lapse rates (~6°C per 1,000 m), enabling growers to find cooler mesoclimates within warm regions. Higher sites often extend the growing season\'s cool nights, preserving acidity and aromatics while ripening fruit during warm days.',
    formula: 'Height above mean sea level (meters)\n\nDerived from the USGS 3DEP 1/3 arc-second (~10 m) digital elevation model.',
    period: 'Current (3DEP)',
    source: 'USGS 3D Elevation Program (3DEP) — 1/3 arc-second DEM',
    ranges: [
      { label: '0–200 m',    desc: 'Valley floor — warmer; drainage frost risk.' },
      { label: '200–500 m',  desc: 'Foothills — balanced diurnal range.' },
      { label: '500–1000 m', desc: 'Mid-elevation — cooler; suits Pinot Noir, Chardonnay.' },
      { label: '> 1000 m',   desc: 'High altitude — intense UV, thin air, extreme diurnals.' },
    ],
  },

  slope: {
    icon: '📐',
    why: 'Slope angle affects drainage, air circulation, and the angle at which sunlight strikes the canopy. Well-drained slopes reduce waterlogging, and gentle to moderate slopes maximize solar interception while preventing erosion and easing mechanization.',
    formula: 'Slope (°) = arctan(rise / run)\n\nComputed from the USGS 3DEP DEM using a Horn (1981) gradient algorithm.',
    period: 'Current (3DEP)',
    source: 'USGS 3D Elevation Program (3DEP) — derived from 1/3 arc-second DEM',
    ranges: [
      { label: '0–5°',    desc: 'Flat — pooling risk; mechanization easy.' },
      { label: '5–15°',   desc: 'Gentle slope — ideal for most vineyards; good drainage.' },
      { label: '15–30°',  desc: 'Moderate — excellent drainage; some mechanization limits.' },
      { label: '> 30°',   desc: 'Steep — erosion risk; typically hand-harvested terraces.' },
    ],
  },

  aspect: {
    icon: '🧭',
    why: 'Aspect (compass direction a slope faces) determines how much direct sunlight a vineyard receives and at what time of day. In the Northern Hemisphere, south-facing slopes receive more solar radiation and are warmer; north-facing slopes stay cooler and are preferred in hot climates.',
    formula: 'Aspect (°) = arctan2(dz/dy, −dz/dx) × (180/π)\n\n0° = North, 90° = East, 180° = South, 270° = West.\nComputed from the USGS 3DEP DEM.',
    period: 'Current (3DEP)',
    source: 'USGS 3D Elevation Program (3DEP) — derived from 1/3 arc-second DEM',
    ranges: [
      { label: 'N (315–45°)',   desc: 'Cooler, less direct sun — ideal in warm climates.' },
      { label: 'E (45–135°)',   desc: 'Morning sun — dries dew quickly, avoids afternoon heat.' },
      { label: 'S (135–225°)',  desc: 'Maximum solar exposure — warms cool-climate sites.' },
      { label: 'W (225–315°)', desc: 'Afternoon sun — risk of excessive heat in warm regions.' },
    ],
  },
};
