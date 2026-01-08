import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of Oregon AVA files to process
const oregonAVAFiles = [
  'willamette_valley.geojson',
  'chehalem_mountains.geojson',
  'dundee_hills.geojson',
  'eola_amity_hills.geojson',
  'mcminnville.geojson',
  'ribbon_ridge.geojson',
  'yamhill_carlton.geojson',
  'laurelwood_district.geojson',
  'van_duzer_corridor.geojson',
  'tualatin_hills.geojson',
  'lower_long_tom.geojson',
  'rogue_valley.geojson',
  'umpqua_valley.geojson',
  'applegate_valley.geojson',
  'columbia_gorge.geojson',
  'columbia_valley.geojson',
  'walla_walla_valley.geojson',
  'elkton_oregon.geojson',
  'red_hill_douglas_county__oregon.geojson',
  'mount_pisgah__polk_county__oregon.geojson',
  'southern_oregon.geojson'
];

// Production estimates in tons crushed (approximate)
const productionEstimates = {
  'Willamette Valley': 65000,
  'Chehalem Mountains': 8000,
  'Dundee Hills': 7000,
  'Eola-Amity Hills': 6000,
  'McMinnville': 5000,
  'Ribbon Ridge': 3000,
  'Yamhill-Carlton': 5000,
  'Laurelwood District': 4000,
  'Van Duzer Corridor': 3000,
  'Tualatin Hills': 2000,
  'Lower Long Tom': 1000,
  'Rogue Valley': 6000,
  'Umpqua Valley': 4000,
  'Applegate Valley': 2000,
  'Columbia Gorge': 3000,
  'Columbia Valley': 2000,
  'Walla Walla Valley': 1500,
  'Elkton Oregon': 500,
  'Red Hill Douglas County, Oregon': 500,
  'Mount Pisgah, Polk County, Oregon': 500,
  'Southern Oregon': 12000
};

// Function to normalize AVA names for production lookup
function normalizeAVAName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(' Oregon', '')
    .trim();
}

// Function to find production estimate by name
function getProductionEstimate(feature) {
  // Try multiple property names that might contain the AVA name
  const possibleNameProps = ['name', 'Name', 'AVA_NAME', 'ava_name', 'AVAS', 'avas'];
  
  for (const prop of possibleNameProps) {
    if (feature.properties && feature.properties[prop]) {
      const rawName = feature.properties[prop];
      const normalizedName = normalizeAVAName(rawName);
      
      // Direct lookup
      if (productionEstimates[normalizedName]) {
        return productionEstimates[normalizedName];
      }
      
      // Try partial matches
      for (const [estimateName, tons] of Object.entries(productionEstimates)) {
        if (normalizedName.includes(estimateName) || estimateName.includes(normalizedName)) {
          return tons;
        }
      }
    }
  }
  
  // Default fallback
  return 1000;
}

async function consolidateOregonAVAs() {
  const inputDir = path.join(__dirname, '..', 'src', 'data', 'avas');
  const outputFile = path.join(__dirname, '..', 'src', 'data', 'oregon-avas.json');
  
  const allFeatures = [];
  let processedCount = 0;
  let skippedFiles = [];

  console.log('Starting Oregon AVA consolidation...');
  console.log(`Input directory: ${inputDir}`);
  console.log(`Output file: ${outputFile}`);

  for (const filename of oregonAVAFiles) {
    const filePath = path.join(inputDir, filename);
    
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filename}`);
        skippedFiles.push(filename);
        continue;
      }

      // Read and parse GeoJSON file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const geoData = JSON.parse(fileContent);

      let features = [];
      
      // Handle both single Feature and FeatureCollection
      if (geoData.type === 'Feature') {
        features = [geoData];
      } else if (geoData.type === 'FeatureCollection' && geoData.features) {
        features = geoData.features;
      } else {
        console.warn(`⚠️  Unrecognized GeoJSON structure in ${filename}`);
        skippedFiles.push(filename);
        continue;
      }

      // Process each feature
      for (const feature of features) {
        // Ensure properties object exists
        if (!feature.properties) {
          feature.properties = {};
        }

        // Add Oregon state identifier
        feature.properties.state = 'Oregon';

        // Add production estimate
        const tonsEstimate = getProductionEstimate(feature);
        feature.properties.tons_crushed = tonsEstimate;

        // Add source filename for reference
        feature.properties.source_file = filename;

        allFeatures.push(feature);
      }

      processedCount++;
      console.log(`✅ Processed: ${filename} (${features.length} feature${features.length !== 1 ? 's' : ''})`);

    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
      skippedFiles.push(filename);
    }
  }

  // Create consolidated FeatureCollection
  const consolidatedData = {
    type: 'FeatureCollection',
    metadata: {
      source: 'Oregon Wine AVAs',
      generated: new Date().toISOString(),
      total_features: allFeatures.length,
      processed_files: processedCount,
      skipped_files: skippedFiles.length
    },
    features: allFeatures
  };

  try {
    // Write consolidated data to output file
    const outputContent = JSON.stringify(consolidatedData, null, 2);
    fs.writeFileSync(outputFile, outputContent);

    // Success summary
    console.log('\n🎉 Consolidation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • Total AVAs processed: ${allFeatures.length}`);
    console.log(`   • Files processed: ${processedCount}/${oregonAVAFiles.length}`);
    console.log(`   • Output file: oregon-avas.json`);
    
    if (skippedFiles.length > 0) {
      console.log(`   • Skipped files: ${skippedFiles.join(', ')}`);
    }

    // Show production total
    const totalProduction = allFeatures.reduce((sum, feature) => 
      sum + (feature.properties.tons_crushed || 0), 0
    );
    console.log(`   • Total estimated production: ${totalProduction.toLocaleString()} tons`);

  } catch (error) {
    console.error('❌ Error writing output file:', error.message);
    process.exit(1);
  }
}

// Run the consolidation
consolidateOregonAVAs().catch(error => {
  console.error('❌ Consolidation failed:', error.message);
  process.exit(1);
});

export { consolidateOregonAVAs };
