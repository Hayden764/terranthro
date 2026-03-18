/**
 * Static info content for the AVA Info Panel.
 * Each entry maps to a layer id and contains:
 *   title       — display name
 *   icon        — emoji shorthand
 *   formula     — calculation description
 *   period      — temporal scope
 *   source      — data provenance
 *   why         — viticulture relevance
 *   ranges      — optional array of { label, value, desc } reference ranges
 */

export const LAYER_INFO = {
  // ── PRISM Monthly ─────────────────────────────────────────────────────────
  tdmean: {
    title: 'Mean Temperature',
    icon: '🌡',
    formula: '(T\u2098\u2090\u2093 + T\u2098\u1d35\u207f) \u00f7 2, averaged daily over the month',
    period: '30-year normals (1991\u20132020), monthly resolution',
    source: 'PRISM Climate Group, Oregon State University \u2014 800\u202fm gridded normals',
    why: 'Primary driver of vine development and fruit ripening. Values too low cause stress and delayed budbreak; values too high accelerate sugar accumulation faster than flavour development. Cool-climate regions (10\u201315\u00b0C growing season mean) tend to produce high-acid, aromatic wines; warm regions (18\u00b0C+) favour full-bodied, lower-acid styles.',
    ranges: [
      { label: '< 10\u00b0C', desc: 'Too cool for most Vitis vinifera' },
      { label: '10\u201313\u00b0C', desc: 'Cool \u2014 Pinot Noir, Riesling, Chardonnay' },
      { label: '13\u201316\u00b0C', desc: 'Moderate \u2014 Cab Franc, Merlot, Syrah' },
      { label: '16\u201320\u00b0C', desc: 'Warm \u2014 Cabernet Sauvignon, Zinfandel' },
      { label: '> 20\u00b0C', desc: 'Hot \u2014 table grapes, fortified wines' },
    ],
  },

  // ── Topography ────────────────────────────────────────────────────────────
  elevation: {
    title: 'Elevation',
    icon: '⛰',
    formula: 'Raw height above mean sea level from a digital elevation model (DEM)',
    period: 'Static \u2014 derived from USGS 3DEP survey data',
    source: 'USGS 3D Elevation Program (3DEP) \u2014 1/3 arc-second (\u223c10\u202fm resolution)',
    why: 'Elevation affects temperature via the environmental lapse rate (\u22126.5\u00b0C per 1\u202000\u202fm). Higher sites are cooler and may escape valley fog and frost. In warm climates, elevated vineyards provide critical diurnal temperature variation that preserves acidity and aromatic complexity.',
    ranges: [
      { label: '0\u2013150\u202fm', desc: 'Valley floor \u2014 frost-prone, often fertile soils' },
      { label: '150\u2013400\u202fm', desc: 'Hillside \u2014 ideal drainage, cold-air drainage' },
      { label: '400\u2013700\u202fm', desc: 'Upper slope \u2014 cool, high-acid potential' },
      { label: '> 700\u202fm', desc: 'Mountain \u2014 extreme diurnal swings, short seasons' },
    ],
  },

  slope: {
    title: 'Slope',
    icon: '📐',
    formula: 'arctan(\u221a(dz/dx)\u00b2 + (dz/dy)\u00b2) \u2014 Horn\u2019s method gradient magnitude',
    period: 'Static \u2014 derived from elevation DEM',
    source: 'Computed from USGS 3DEP DEM using Horn\u2019s 3\u00d73 window algorithm',
    why: 'Steep slopes promote water drainage and soil warming but limit mechanisation. Gentle slopes are easier to farm. Moderate slopes (5\u201320\u00b0) optimise drainage without erosion risk. In cold-climate regions, slopes also promote cold-air drainage that reduces frost risk compared to flat valley floors.',
    ranges: [
      { label: '0\u20135\u00b0', desc: 'Flat \u2014 frost-prone, machinery-friendly' },
      { label: '5\u201315\u00b0', desc: 'Gentle slope \u2014 excellent drainage, easy farming' },
      { label: '15\u201325\u00b0', desc: 'Moderate \u2014 terracing may be needed' },
      { label: '25\u201335\u00b0', desc: 'Steep \u2014 manual harvest, erosion risk' },
      { label: '> 35\u00b0', desc: 'Very steep \u2014 heroic viticulture (Mosel, Priorat)' },
    ],
  },

  aspect: {
    title: 'Aspect',
    icon: '🧭',
    formula: 'atan2(dz/dy, \u2212dz/dx) \u2014 Horn\u2019s method gradient direction',
    period: 'Static \u2014 derived from elevation DEM',
    source: 'Computed from USGS 3DEP DEM using Horn\u2019s 3\u00d73 window algorithm',
    why: 'In the Northern Hemisphere, south- and southwest-facing slopes receive more direct solar radiation, making them warmer and better for ripening. North-facing slopes are cooler and may be used to preserve acidity in warm regions. East-facing slopes warm up quickly in the morning; west-facing slopes accumulate afternoon heat.',
    ranges: [
      { label: 'N (315\u2013360\u00b0 / 0\u201345\u00b0)', desc: 'Coolest \u2014 useful in hot climates' },
      { label: 'E (45\u2013135\u00b0)', desc: 'Morning sun \u2014 moderate warmth' },
      { label: 'S (135\u2013225\u00b0)', desc: 'Maximum radiation \u2014 warmest in N. Hemisphere' },
      { label: 'W (225\u2013315\u00b0)', desc: 'Afternoon heat accumulation' },
    ],
  },

  // ── Growing-Season Indices ────────────────────────────────────────────────
  gdd_winkler_accumulated: {
    title: 'GDD Winkler (Continuous)',
    icon: '🌱',
    formula: '\u03a3 max(0, (T\u2098\u2090\u2093 + T\u2098\u1d35\u207f) / 2 \u2212 10\u00b0C) \u00d7 days\u2081 Apr 1 \u2013 Oct 31',
    period: '2025 growing season; computed from PRISM daily normals',
    source: 'Calculated from PRISM daily Tmax/Tmin at 800\u202fm resolution',
    why: 'The Winkler Index (growing degree days, base 10\u00b0C) is the global standard for measuring heat accumulation during the growing season. It was developed at UC Davis and remains the primary tool for matching varieties to climate zones. Higher GDD = more heat-loving varieties.',
    ranges: [
      { label: '< 1\u202f400 GDD', desc: 'Below Ia \u2014 too cool for most varieties' },
      { label: '1\u202f400\u20131\u202f940', desc: 'Region I \u2014 Pinot Noir, Chardonnay, Riesling' },
      { label: '1\u202f940\u20132\u202f500', desc: 'Region II \u2014 Cab Franc, Merlot, Sauvignon Blanc' },
      { label: '2\u202f500\u20133\u202f000', desc: 'Region III \u2014 Cabernet Sauvignon, Syrah, Zinfandel' },
      { label: '3\u202f000\u20133\u202f500', desc: 'Region IV \u2014 Table grapes, fortified wines' },
      { label: '> 3\u202f500 GDD', desc: 'Region V+ \u2014 Very hot, raisins, brandy' },
    ],
  },

  gdd_winkler_classified: {
    title: 'Winkler Regions',
    icon: '🗺',
    formula: 'Same GDD accumulation as Winkler continuous, binned into Winkler I\u2013V+ classes',
    period: '2025 growing season',
    source: 'Calculated from PRISM daily Tmax/Tmin at 800\u202fm resolution',
    why: 'The classified Winkler map makes it easy to see at a glance which parts of an AVA fall into which heat-accumulation zone. Sub-AVA variation is common: a hillside pocket may be Region I while the valley floor is Region II.',
    ranges: [
      { label: 'Below Ia', desc: '< 1\u202f400 GDD \u2014 too cool' },
      { label: 'Region Ia', desc: '1\u202f400\u20131\u202f700 GDD' },
      { label: 'Region Ib', desc: '1\u202f700\u20131\u202f940 GDD' },
      { label: 'Region II', desc: '1\u202f940\u20132\u202f200 GDD' },
      { label: 'Region III', desc: '2\u202f200\u20132\u202f500 GDD' },
      { label: 'Region IV', desc: '2\u202f500\u20133\u202f000 GDD' },
      { label: 'Region V', desc: '3\u202f000\u20134\u202f200 GDD' },
      { label: 'Above V', desc: '> 4\u202f200 GDD' },
    ],
  },

  gst_smarthobday: {
    title: 'Growing Season Temperature',
    icon: '☀️',
    formula: '\u03a3 (T\u2098\u2090\u2093 + T\u2098\u1d35\u207f) / 2 \u00f7 (days Apr\u2013Oct)',
    period: '2025 growing season (Apr 1 \u2013 Oct 31)',
    source: 'Calculated from PRISM daily normals at 800\u202fm resolution',
    why: 'The Smart-Hobday Growing Season Temperature (GST) is a simpler alternative to GDD that works well across a wide range of latitudes. Unlike GDD, it has no base-temperature threshold and therefore captures cold-stress periods. It is widely used in Australian and New Zealand viticulture research.',
    ranges: [
      { label: '< 13\u00b0C', desc: 'Cool \u2014 Sparkling, Riesling, Pinot Noir' },
      { label: '13\u201315\u00b0C', desc: 'Intermediate cool \u2014 Pinot Noir, Chardonnay' },
      { label: '15\u201317\u00b0C', desc: 'Intermediate warm \u2014 Cab Franc, Merlot' },
      { label: '17\u201319\u00b0C', desc: 'Warm \u2014 Cabernet Sauvignon, Syrah' },
      { label: '> 19\u00b0C', desc: 'Hot \u2014 Grenache, fortified styles' },
    ],
  },

  huglin: {
    title: 'Huglin Index (Continuous)',
    icon: '🌞',
    formula: '\u03a3 [(T\u2098\u2090\u2093 \u2212 10) + (T\u2098\u1d35\u207f \u2212 10)] / 2 \u00d7 d, Apr 1 \u2013 Sep 30\nwhere d = day-length coefficient (1.02\u20131.06 for 40\u201350\u00b0 N)',
    period: '2025 growing season (Apr\u2013Sep)',
    source: 'Calculated from PRISM daily normals; day-length factor from latitude',
    why: 'Developed by Pierre Huglin in 1978, the Huglin Index (HI) improves on GDD by incorporating maximum temperature and a latitude-based day-length correction. It more accurately reflects solar energy available to the vine at higher latitudes (e.g., Willamette Valley at ~45\u00b0N) where longer summer days partially compensate for cooler temperatures.',
    ranges: [
      { label: '< 1\u202f000', desc: 'Too cold' },
      { label: '1\u202f000\u20131\u202f199', desc: 'Very cool \u2014 early sparkling varieties' },
      { label: '1\u202f200\u20131\u202f399', desc: 'Cool \u2014 Pinot Noir, Riesling' },
      { label: '1\u202f400\u20131\u202f599', desc: 'Temperate \u2014 Chardonnay, Cab Franc' },
      { label: '1\u202f600\u20131\u202f799', desc: 'Warm temperate \u2014 Merlot, Syrah' },
      { label: '1\u202f800\u20131\u202f999', desc: 'Warm \u2014 Cabernet Sauvignon' },
      { label: '2\u202f000\u20132\u202f399', desc: 'Hot \u2014 Grenache, fortified' },
      { label: '\u2265 2\u202f400', desc: 'Very hot' },
    ],
  },

  huglin_classified: {
    title: 'Huglin Classes',
    icon: '🏷',
    formula: 'Same Huglin Index computation, binned into 8 official Huglin classes',
    period: '2025 growing season',
    source: 'Calculated from PRISM daily normals at 800\u202fm resolution',
    why: 'The classified Huglin map shows spatial variation in heat accumulation accounting for day-length. It is particularly useful in AVAs at higher latitudes (above 40\u00b0N) where Huglin diverges noticeably from the Winkler Index. Sub-AVA patches in different classes indicate meaningful microclimatic differences for variety selection.',
    ranges: [
      { label: 'Too Cold', desc: '< 1\u202f000 HI' },
      { label: 'Very Cool', desc: '1\u202f000\u20131\u202f199 HI' },
      { label: 'Cool', desc: '1\u202f200\u20131\u202f399 HI' },
      { label: 'Temperate', desc: '1\u202f400\u20131\u202f599 HI' },
      { label: 'Warm Temp', desc: '1\u202f600\u20131\u202f799 HI' },
      { label: 'Warm', desc: '1\u202f800\u20131\u202f999 HI' },
      { label: 'Hot', desc: '2\u202f000\u20132\u202f399 HI' },
      { label: 'Very Hot', desc: '\u2265 2\u202f400 HI' },
    ],
  },
};
