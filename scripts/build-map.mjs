import fs from 'fs';
import { geoMercator, geoPath } from 'd3-geo';
import * as topojson from 'topojson-client';
import topojsonSimplify from 'topojson-simplify';

async function buildMap() {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json');
  const topology = await res.json();

  // Simplify for smoother coastlines
  const presimplified = topojsonSimplify.presimplify(topology);
  const simplified = topojsonSimplify.simplify(presimplified, 0.05);

  // Extract land (so there are NO country borders)
  const geojson = topojson.feature(simplified, simplified.objects.land);

  // We want to zoom in and center properly.
  // Default projection for 960x520 is a generic center.
  // Let's zoom into the Atlantic a bit more to show PT and connections.
  const projection = geoMercator()
    .scale(200)       // Increased scale (default is often 150)
    .translate([500, 320]); // Shift slightly, play with these to center Portugal (approx -9, 39 lat/lon) well within the left-center

  const path = geoPath().projection(projection);

  const svgPaths = geojson.features.map(f => {
    return `<path class="map-land" d="${path(f)}" stroke="#f97316" stroke-width="1.0" opacity="0.65" fill="none" stroke-linejoin="round" stroke-linecap="round" />`;
  }).join('\n');

  fs.writeFileSync(new URL('../maps-generated/svg-paths.html', import.meta.url), svgPaths);

  console.log('Map paths generated with zoom and land-only. Wrote to svg-paths.html');

  // Let's also print the projected coordinates of Portugal so we can place the PT dot properly.
  const ptCoords = projection([-9.139, 38.722]); // Lisbon
  console.log(`PT Coordinates for SVG: cx="${ptCoords[0]}" cy="${ptCoords[1]}"`);
}

buildMap().catch(err => console.error(err));
