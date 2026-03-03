import fs from 'fs';
import * as d3Geo from 'd3-geo';
import * as topojsonClient from 'topojson-client';
import * as topojsonSimplify from 'topojson-simplify';
import https from 'https';

console.log("Downloading map data...");
https.get('https://unpkg.com/world-atlas@2.0.2/countries-50m.json', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log("Map data downloaded. Parsing...");
        const topo50 = JSON.parse(body);

        console.log("Simplifying topology...");
        const presimplified = topojsonSimplify.presimplify(topo50);
        const simplified = topojsonSimplify.simplify(presimplified, 0.05);

        // We want only the exterior coastline boundaries, not the inner country boundaries!
        // Using mesh with `a === b` guarantees we only get arcs that are NOT shared by two countries.
        const mapMesh = topojsonClient.mesh(simplified, simplified.objects.countries, function (a, b) { return a === b; });

        const projection = d3Geo.geoNaturalEarth1()
            .scale(300)
            .translate([480, 260]);

        // Set Center
        let ptProj = projection([-9.139, 38.722]);
        const desiredPtX = 440;
        const desiredPtY = 190;

        projection.translate([
            480 + (desiredPtX - ptProj[0]),
            260 + (desiredPtY - ptProj[1])
        ]);

        const pathGenerator = d3Geo.geoPath().projection(projection);

        let pathsHtml = '';
        const d = pathGenerator(mapMesh);
        if (d) {
            pathsHtml += `  <path class="map-land" d="${d}" stroke="#f97316" stroke-width="1.0" fill="none" stroke-linejoin="round" stroke-linecap="round" />\n`;
        }

        fs.writeFileSync('new-paths-mesh.html', pathsHtml);
        console.log('Saved new-paths-mesh.html');
    });
}).on('error', (e) => {
    console.error("Error downloading:", e);
});
