import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { useMapContext } from '../../context/MapContext';
import usStatesTopo from '../../data/us-states-topo.json';

// Projection configuration for each wine-producing state with UTM zone and rotation
const STATE_PROJECTIONS = {
  'California': { zone: 10, rotation: -3 },
  'Oregon': { zone: 10, rotation: -2 },
  'Washington': { zone: 10, rotation: -4 },
  'Idaho': { zone: 11, rotation: -2 },
  'Colorado': { zone: 13, rotation: 0 },
  'Arizona': { zone: 12, rotation: 0 },
  'New Mexico': { zone: 13, rotation: 1 },
  'Texas': { zone: 14, rotation: 1 },
  'Missouri': { zone: 15, rotation: 0 },
  'Arkansas': { zone: 15, rotation: 0 },
  'Oklahoma': { zone: 14, rotation: 0 },
  'Louisiana': { zone: 15, rotation: 0 },
  'Mississippi': { zone: 16, rotation: 2 },
  'Tennessee': { zone: 16, rotation: 0 },
  'Kentucky': { zone: 16, rotation: 0 },
  'Illinois': { zone: 16, rotation: 2 },
  'Indiana': { zone: 16, rotation: 0 },
  'Iowa': { zone: 15, rotation: 0 },
  'Wisconsin': { zone: 16, rotation: 3 },
  'Minnesota': { zone: 15, rotation: 1 },
  'Ohio': { zone: 17, rotation: 2 },
  'Michigan': { zone: 16, rotation: -1 },
  'Pennsylvania': { zone: 18, rotation: 3 },
  'New York': { zone: 18, rotation: 2 },
  'Maryland': { zone: 18, rotation: 2 },
  'Virginia': { zone: 17, rotation: 0 },
  'North Carolina': { zone: 17, rotation: 0 },
  'Georgia': { zone: 17, rotation: 5 },
  'New Jersey': { zone: 18, rotation: 1 },
  'Connecticut': { zone: 18, rotation: 0 },
  'Massachusetts': { zone: 19, rotation: 4 },
  'Rhode Island': { zone: 19, rotation: 0 },
  'New Hampshire': { zone: 19, rotation: 2 }
};

// Create UTM projection using Transverse Mercator with optional rotation
function createUTMProjection(zone, rotation = 0) {
  // Calculate central meridian for UTM zone
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  
  return d3.geoTransverseMercator()
    .rotate([-centralMeridian, 0, rotation])  // Apply rotation parameter (positive = clockwise)
    .center([0, 0])
    .scale(1)
    .translate([0, 0]);  // Let manual bounds calculation handle translation
}

const StateMap = () => {
  const mapContainer = useRef(null);
  const svgRef = useRef(null);
  const { selectedState } = useMapContext();
  const [oregonAVAs, setOregonAVAs] = useState(null);
  const [hoveredAVA, setHoveredAVA] = useState(null);

  // Fetch Oregon AVAs data
  useEffect(() => {
    fetch('/src/data/OR_avas.geojson')
      .then(response => response.json())
      .then(data => {
        console.log('Loaded Oregon AVAs:', data.features.length);
        setOregonAVAs(data);
      })
      .catch(error => console.error('Error loading Oregon AVAs:', error));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !selectedState) return;

    // Clear any existing SVG
    d3.select(mapContainer.current).selectAll('*').remove();

    // Calculate available space - use full viewport
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Extract the selected state from TopoJSON
    const states = feature(usStatesTopo, usStatesTopo.objects.states);
    const stateFeature = states.features.find(d => d.properties.name === selectedState.name);

    if (!stateFeature) {
      console.error(`State '${selectedState.name}' not found in TopoJSON`);
      return;
    }

    console.log(`Rendering state: ${selectedState.name}`);

    // Get projection configuration for selected state
    const projConfig = STATE_PROJECTIONS[selectedState.name];
    let projection;
    
    if (!projConfig) {
      console.warn(`No projection defined for ${selectedState.name}, using AlbersUSA fallback`);
      projection = d3.geoAlbersUsa();
      // Use fitExtent for AlbersUSA
      projection.fitExtent([[20, 20], [width - 20, height - 20]], stateFeature);
    } else {
      console.log(`Using UTM Zone ${projConfig.zone} with rotation ${projConfig.rotation}° for ${selectedState.name}`);
      projection = createUTMProjection(projConfig.zone, projConfig.rotation);
      
      // Manually calculate bounds for better control with UTM projection
      const pathGenerator = d3.geoPath().projection(projection);
      const bounds = pathGenerator.bounds(stateFeature);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;

      const scale = 0.9 / Math.max(dx / width, dy / height);
      const translate = [width / 2 - scale * x, height / 2 - scale * y];

      projection.scale(scale).translate(translate);
    }

    const pathGenerator = d3.geoPath().projection(projection);

    // Create SVG
    const svg = d3.select(mapContainer.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block');

    svgRef.current = svg.node();

    // Render Oregon AVAs if selected state is Oregon
    if (selectedState.name === 'Oregon') {
      // Check if AVA data is loaded
      if (!oregonAVAs) {
        console.log('Oregon AVAs not loaded yet');
        return;
      }
      
      // Sort AVAs by size (largest first) so small sub-AVAs render on top
      const displayAVAs = oregonAVAs.features.slice().sort((a, b) => {
        // Calculate approximate area using bounding box
        const areaA = d3.geoBounds(a);
        const areaB = d3.geoBounds(b);
        const sizeA = (areaA[1][0] - areaA[0][0]) * (areaA[1][1] - areaA[0][1]);
        const sizeB = (areaB[1][0] - areaB[0][0]) * (areaB[1][1] - areaB[0][1]);
        return sizeB - sizeA; // Largest first (bottom layer)
      });
      
      console.log('Rendering all Oregon AVAs:', displayAVAs.length);
      console.log('AVA IDs:', displayAVAs.map(a => a.properties.ava_id));
      
      // Render AVA boundaries (no labels)
      svg.selectAll('.ava-boundary')
        .data(displayAVAs)
        .enter()
        .append('path')
        .attr('class', 'ava-boundary')
        .attr('d', pathGenerator)
        .attr('fill', '#E8E4D9')  // Match state fill
        .attr('stroke', '#C41E3A')  // Burgundy border
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseenter', function(event, d) {
          setHoveredAVA(d.properties.name);
          d3.select(this)
            .attr('fill', 'rgba(196, 30, 58, 0.1)')
            .attr('stroke-width', 1.5)
            .raise();
        })
        .on('mouseleave', function(event, d) {
          setHoveredAVA(null);
          d3.select(this)
            .attr('fill', '#E8E4D9')
            .attr('stroke-width', 1);
        })
        .on('click', (event, d) => {
          console.log('Clicked AVA:', d.properties.name);
        });
    }

    // Render state outline AFTER AVAs so border stays on top
    svg.append('path')
      .datum(stateFeature)
      .attr('class', 'state-boundary-top')
      .attr('d', pathGenerator)
      .attr('fill', 'none')  // No fill - transparent
      .attr('stroke', '#000000')  // Black border
      .attr('stroke-width', 2.5)
      .attr('pointer-events', 'none')  // Don't block AVA interactions
      .style('z-index', 1000);  // On top

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      if (!projConfig) {
        // Use fitExtent for AlbersUSA fallback
        projection.fitExtent([[10, 10], [newWidth - 10, newHeight - 10]], stateFeature);
      } else {
        // Manually calculate bounds for UTM projection
        const bounds = pathGenerator.bounds(stateFeature);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;

        const scale = 0.9 / Math.max(dx / newWidth, dy / newHeight);
        const translate = [newWidth / 2 - scale * x, newHeight / 2 - scale * y];

        projection.scale(scale).translate(translate);
      }

      svg
        .attr('width', newWidth)
        .attr('height', newHeight);

      svg.select('path')
        .attr('d', pathGenerator);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      d3.select(mapContainer.current).selectAll('*').remove();
    };
  }, [selectedState]);

  if (!selectedState) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No state selected</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="map state-map" 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'var(--base-cream)',
          transition: 'all 0.3s ease'
        }} 
      />
      
      {/* AVA Name Overlay */}
      {hoveredAVA && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '4px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '16px',
          fontWeight: '500',
          pointerEvents: 'none',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          {hoveredAVA}
        </div>
      )}
    </div>
  );
};

export default StateMap;
