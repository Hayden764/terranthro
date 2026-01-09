import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { useMapContext } from '../../context/MapContext';
import { calculateSymbolSize } from '../../utils/symbolScale';
import usStatesTopo from '../../data/us-states-topo.json';
import wineStatesData from '../../data/wine-states-production.json';

const NationalMap = () => {
  const mapContainer = useRef(null);
  const svgRef = useRef(null);
  const { navigateToState } = useMapContext();

  // Create wine state abbreviations set for quick lookup
  const wineStateAbbreviations = new Set(wineStatesData.map(state => state.abbreviation));

  // Helper function to get state abbreviation from full name
  const getStateAbbreviation = (stateName) => {
    const stateMap = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
      'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
      'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
      'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
      'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
      'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
      'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
      'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };
    return stateMap[stateName] || '';
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Clear any existing SVG
    d3.select(mapContainer.current).selectAll('*').remove();

    // Calculate available space - use full viewport
    const width = window.innerWidth;
    const height = window.innerHeight;

    console.log('Map dimensions:', { width, height });

    // Create SVG element
    const svg = d3.select(mapContainer.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', 'var(--base-cream)')
      .style('display', 'block');

    svgRef.current = svg.node();

    // Set up projection - Albers USA for the United States
    const projection = d3.geoAlbersUsa()
      .scale(1200)
      .translate([width / 2, height / 2]);

    // Create path generator
    const path = d3.geoPath().projection(projection);

    // Set up zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.8, 4])
      .on('zoom', (event) => {
        const { transform } = event;
        svg.selectAll('path').attr('transform', transform);
        svg.selectAll('.symbols-group').attr('transform', transform);
      });

    svg.call(zoom);

    // Convert TopoJSON to GeoJSON
    const states = feature(usStatesTopo, usStatesTopo.objects.states);
    
    // Group for states
    const statesGroup = svg.append('g').attr('class', 'states');

    // Draw state paths
    statesGroup.selectAll('path')
      .data(states.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('class', d => {
        const stateName = d.properties.name;
        const stateAbbr = getStateAbbreviation(stateName);
        const isWineState = wineStateAbbreviations.has(stateAbbr);
        console.log(`State: ${stateName} (${stateAbbr}) - Wine state: ${isWineState}`);
        return `state-path ${isWineState ? 'wine-state' : ''}`;
      })
      .style('fill', '#E8E4D9')
      .style('stroke', '#000000')
      .style('stroke-width', d => {
        const stateName = d.properties.name;
        const stateAbbr = getStateAbbreviation(stateName);
        return wineStateAbbreviations.has(stateAbbr) ? '1px' : '0.5px';
      })
      .style('cursor', d => {
        const stateName = d.properties.name;
        const stateAbbr = getStateAbbreviation(stateName);
        return wineStateAbbreviations.has(stateAbbr) ? 'pointer' : 'default';
      })
      .on('mouseenter', function(event, d) {
        const stateName = d.properties.name;
        const stateAbbr = getStateAbbreviation(stateName);
        if (wineStateAbbreviations.has(stateAbbr)) {
          d3.select(this)
            .style('fill', 'rgba(196, 30, 58, 0.05)')
            .style('stroke', '#C41E3A')
            .style('stroke-width', '2px')
            .raise();  // Move to front to prevent border overlap
        }
      })
      .on('mouseleave', function(event, d) {
        const stateName = d.properties.name;
        const stateAbbr = getStateAbbreviation(stateName);
        if (wineStateAbbreviations.has(stateAbbr)) {
          d3.select(this)
            .style('fill', '#E8E4D9')
            .style('stroke', '#000000')
            .style('stroke-width', '1px');
        }
      })
      .on('click', function(event, d) {
        const stateName = d.properties.name;
        const stateAbbr = getStateAbbreviation(stateName);
        if (wineStateAbbreviations.has(stateAbbr)) {
          const state = wineStatesData.find(s => s.abbreviation === stateAbbr);
          if (state) {
            navigateToState(state);
          }
        }
      });

    // Group for production symbols
    const symbolsGroup = svg.append('g').attr('class', 'symbols-group');

    // Add production symbols for all wine states
    const isMobile = window.innerWidth < 768;
    const mobileScale = isMobile ? 0.7 : 1;
    
    wineStatesData.forEach(state => {
      console.log('Adding symbols for:', state.name, state.abbreviation);
      const coordinates = state.centroid.coordinates;
      const projected = projection(coordinates);
      
      if (projected) {
        const symbolSizes = calculateSymbolSize(state.tons_crushed, 'national');
        console.log(`Symbol sizes for ${state.name}:`, symbolSizes);

        // Create group for this state's symbols positioned at centroid
        const stateSymbolGroup = symbolsGroup.append('g')
          .attr('class', `production-symbol production-symbol-group state-symbols state-${state.abbreviation}`)
          .attr('transform', `translate(${projected[0]}, ${projected[1]})`)
          .style('cursor', 'pointer')
          .style('transition', 'transform 0.2s ease')
          .on('click', () => {
            navigateToState(state);
          })
          .on('mouseenter', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('transform', `translate(${projected[0]}, ${projected[1]}) scale(1.05)`);
          })
          .on('mouseleave', function() {
            d3.select(this)
              .transition()
              .duration(200)
              .attr('transform', `translate(${projected[0]}, ${projected[1]}) scale(1)`);
          });

        // Outer circle - positioned at origin (0,0) since group is already translated
        stateSymbolGroup.append('circle')
          .attr('class', 'outer-circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', symbolSizes.outer * mobileScale)
          .style('fill', 'transparent')
          .style('stroke', '#C41E3A')
          .style('stroke-width', '2.5px');

        // Inner circle - positioned at origin (0,0) since group is already translated
        stateSymbolGroup.append('circle')
          .attr('class', 'inner-circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', symbolSizes.inner * mobileScale)
          .style('fill', 'transparent')
          .style('stroke', '#C41E3A')
          .style('stroke-width', '1.5px');

        console.log(`Created symbols for ${state.name} at [${projected[0]}, ${projected[1]}]`);
      } else {
        console.log(`Could not project coordinates for ${state.name}:`, coordinates);
      }
    });

    // Fit the projection to the US bounds with padding
    const [[x0, y0], [x1, y1]] = d3.geoPath(projection).bounds(states);
    const dx = x1 - x0;
    const dy = y1 - y0;
    const x = (x0 + x1) / 2;
    const y = (y0 + y1) / 2;
    const scale = Math.min(width / dx, height / dy) * 0.85;
    const translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
      .duration(1000)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(translate[0], translate[1])
          .scale(scale)
      );

    // Handle window resize
    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      console.log('Resizing map:', { newWidth, newHeight });
      
      svg.attr('width', newWidth).attr('height', newHeight);
      
      projection
        .scale(1200)
        .translate([newWidth / 2, newHeight / 2]);
        
      svg.selectAll('path').attr('d', path);
      
      // Update symbol positions
      symbolsGroup.selectAll('.state-symbols').remove();
      
      const isMobileResize = newWidth < 768;
      const mobileScaleResize = isMobileResize ? 0.7 : 1;
      
      wineStatesData.forEach(state => {
        const coordinates = state.centroid.coordinates;
        const projected = projection(coordinates);
        
        if (projected) {
          const symbolSizes = calculateSymbolSize(state.tons_crushed, 'national');

          const stateSymbolGroup = symbolsGroup.append('g')
            .attr('class', `production-symbol production-symbol-group state-symbols state-${state.abbreviation}`)
            .attr('transform', `translate(${projected[0]}, ${projected[1]})`)
            .style('cursor', 'pointer')
            .style('transition', 'transform 0.2s ease')
            .on('click', () => {
              navigateToState(state);
            })
            .on('mouseenter', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${projected[0]}, ${projected[1]}) scale(1.05)`);
            })
            .on('mouseleave', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('transform', `translate(${projected[0]}, ${projected[1]}) scale(1)`);
            });

          stateSymbolGroup.append('circle')
            .attr('class', 'outer-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', symbolSizes.outer * mobileScaleResize)
            .style('fill', 'transparent')
            .style('stroke', '#C41E3A')
            .style('stroke-width', '2.5px');

          stateSymbolGroup.append('circle')
            .attr('class', 'inner-circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', symbolSizes.inner * mobileScaleResize)
            .style('fill', 'transparent')
            .style('stroke', '#C41E3A')
            .style('stroke-width', '1.5px');
        }
      });

      // Re-fit the projection
      const [[x0, y0], [x1, y1]] = d3.geoPath(projection).bounds(states);
      const dx = x1 - x0;
      const dy = y1 - y0;
      const x = (x0 + x1) / 2;
      const y = (y0 + y1) / 2;
      const scale = Math.min(newWidth / dx, newHeight / dy) * 0.85;
      const translate = [newWidth / 2 - scale * x, newHeight / 2 - scale * y];

      svg.transition()
        .duration(500)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(translate[0], translate[1])
            .scale(scale)
        );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigateToState]);

  return (
    <div 
      ref={mapContainer} 
      className="map national-map" 
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
  );
};

export default NationalMap;
