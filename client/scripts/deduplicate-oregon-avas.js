#!/usr/bin/env node

/**
 * Deduplicate Oregon AVA data
 * Keeps only the most detailed version of each AVA (by coordinate count)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the Oregon AVAs data
const dataPath = path.join(__dirname, '../src/data/oregon-avas.json');
const oregonAVAs = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`📂 Loaded ${oregonAVAs.features.length} features from oregon-avas.json`);

// Group features by name
const grouped = {};
oregonAVAs.features.forEach(feature => {
  const name = feature.properties.name;
  if (!grouped[name]) {
    grouped[name] = [];
  }
  grouped[name].push(feature);
});

console.log(`📊 Found ${Object.keys(grouped).length} unique AVA names`);

// Log duplicates
const duplicates = Object.entries(grouped).filter(([name, features]) => features.length > 1);
if (duplicates.length > 0) {
  console.log(`\n🔍 Duplicates found:`);
  duplicates.forEach(([name, features]) => {
    console.log(`  - ${name}: ${features.length} versions`);
    features.forEach((f, i) => {
      const coordCount = f.geometry.type === 'Polygon' 
        ? f.geometry.coordinates[0].length
        : f.geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
      console.log(`    [${i + 1}] ${coordCount} coordinates`);
    });
  });
}

// For each AVA name, keep the feature with the most coordinates (most detailed)
const deduplicated = Object.values(grouped).map(group => {
  if (group.length === 1) return group[0];
  
  // Return the one with most coordinates
  return group.sort((a, b) => {
    // Handle both Polygon and MultiPolygon
    const getCoordCount = (feature) => {
      if (feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates[0].length;
      } else if (feature.geometry.type === 'MultiPolygon') {
        return feature.geometry.coordinates.reduce((sum, polygon) => {
          return sum + polygon[0].length;
        }, 0);
      }
      return 0;
    };
    
    const aCoords = getCoordCount(a);
    const bCoords = getCoordCount(b);
    return bCoords - aCoords; // Descending - most detailed first
  })[0];
});

// Create new FeatureCollection
const result = {
  type: 'FeatureCollection',
  features: deduplicated
};

// Write to new file
const outputPath = path.join(__dirname, '../src/data/oregon-avas-clean.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(result, null, 2),
  'utf-8'
);

// Log summary
console.log(`\n✅ Deduplication complete!`);
console.log(`   Original: ${oregonAVAs.features.length} features`);
console.log(`   Deduplicated: ${deduplicated.length} unique AVAs`);
console.log(`   Removed: ${oregonAVAs.features.length - deduplicated.length} duplicates`);
console.log(`\n💾 Saved to: oregon-avas-clean.json`);

// List all unique AVA names in the cleaned file
console.log(`\n📋 Unique AVAs in cleaned file:`);
deduplicated
  .map(f => f.properties.name)
  .sort()
  .forEach((name, i) => {
    console.log(`   ${i + 1}. ${name}`);
  });
