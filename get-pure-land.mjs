import fs from 'fs';
import * as d3Geo from 'd3-geo';
import * as topojsonClient from 'topojson-client';
import * as topojsonSimplify from 'topojson-simplify';
import https from 'https';

console.log("Downloading land-50m.json...");
https.get('https://unpkg.com/world-atlas@2.0.2/land-50m.json', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log("Map data downloaded. Parsing...");
        const topo50 = JSON.parse(body);

        console.log("Simplifying topology...");
        const presimplified = topojsonSimplify.presimplify(topo50);
        // 0.05 weighting generates nice smooth coastlines without spikes
        const simplified = topojsonSimplify.simplify(presimplified, 0.05);

        console.log("Extracting land feature (merging countries)...");
        const mapLand = topojsonClient.feature(simplified, simplified.objects.land);

        // Set up projection (zoomed in to hide map rectangular boundaries)
        // We want Portugal (-9.1, 38.7) to be positioned well on screen
        const projection = d3Geo.geoNaturalEarth1()
            .scale(300) // Much more zoomed in
            .translate([480, 260]);

        // Where is PT now?
        let ptProj = projection([-9.139, 38.722]);

        // Let's center it so PT is at x=440, y=190
        const desiredPtX = 440;
        const desiredPtY = 190;

        projection.translate([
            480 + (desiredPtX - ptProj[0]),
            260 + (desiredPtY - ptProj[1])
        ]);

        console.log("Generating SVG paths...");
        const pathGenerator = d3Geo.geoPath().projection(projection);

        let pathsHtml = '';
        // mapLand is a FeatureCollection or MultiPolygon
        if (mapLand.type === 'FeatureCollection') {
            mapLand.features.forEach(feat => {
                let d = pathGenerator(feat);
                if (d) {
                    pathsHtml += `  <path class="map-land" d="${d}" stroke="#f97316" stroke-width="1.0" fill="none" stroke-linejoin="round" stroke-linecap="round" />\n`;
                }
            });
        } else {
            let d = pathGenerator(mapLand);
            if (d) pathsHtml += `  <path class="map-land" d="${d}" stroke="#f97316" stroke-width="1.0" fill="none" stroke-linejoin="round" stroke-linecap="round" />\n`;
        }

        fs.writeFileSync('new-paths-pure-land.html', pathsHtml);
        console.log('Saved new-paths-pure-land.html');
    });
}).on('error', (e) => {
    console.error("Error downloading:", e);
});
