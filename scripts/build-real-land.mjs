import fs from 'fs';
import * as d3Geo from 'd3-geo';
import * as topojsonClient from 'topojson-client';
import * as topojsonSimplify from 'topojson-simplify';
import https from 'https';

console.log("Downloading map data 1.1.4...");
https.get('https://unpkg.com/world-atlas@1.1.4/world/50m.json', (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log("Map data downloaded. Parsing...");
        const topology = JSON.parse(body);

        const presimplified = topojsonSimplify.presimplify(topology);
        const simplified = topojsonSimplify.simplify(presimplified, 0.05);

        // land features
        const landFeatures = topojsonClient.feature(simplified, simplified.objects.land);

        const projection = d3Geo.geoNaturalEarth1()
            .scale(320)
            .translate([480, 260]);

        // Set Center
        let ptProj = projection([-9.139, 38.722]);
        const desiredPtX = 490;
        const desiredPtY = 180;

        projection.translate([
            480 + (desiredPtX - ptProj[0]),
            260 + (desiredPtY - ptProj[1])
        ]);

        const pathGenerator = d3Geo.geoPath().projection(projection);

        let pathsHtml = '';
        const d = pathGenerator(landFeatures);
        if (d) {
            pathsHtml += `  <path class="map-land" d="${d}" stroke="#f97316" stroke-width="0.8" fill="none" stroke-linejoin="round" stroke-linecap="round" />\n`;
        }

        const ptCoords = projection([-9.139, 38.722]);
        const ukCoords = projection([-0.12, 51.5]); // UK
        const eurCoords = projection([21.0, 52.2]); // Warsaw (Rest of Europe)
        const afrCoords = projection([18.5, 4.3]); // Center of Africa (Bangui/CAR area)
        const naCoords = projection([-98.0, 39.0]); // Center of NA (Kansas/midwest area)
        const saCoords = projection([-38.5, -3.7]); // Northern Brazil (Fortaleza area)
        const asiaCoords = projection([69.3, 41.3]); // Tashkent (Central Asia)

        console.log("PT: ", ptCoords);
        console.log("UK: ", ukCoords);
        console.log("EUR: ", eurCoords);
        console.log("AFR: ", afrCoords);
        console.log("NA: ", naCoords);
        console.log("SA: ", saCoords);
        console.log("ASIA: ", asiaCoords);

        pathsHtml += `\n<!-- COPY THESE DISTANCES -->
<!--
PT: ${ptCoords[0].toFixed(1)}, ${ptCoords[1].toFixed(1)}
UK: ${ukCoords[0].toFixed(1)}, ${ukCoords[1].toFixed(1)}
EUR: ${eurCoords[0].toFixed(1)}, ${eurCoords[1].toFixed(1)}
AFR: ${afrCoords[0].toFixed(1)}, ${afrCoords[1].toFixed(1)}
NA: ${naCoords[0].toFixed(1)}, ${naCoords[1].toFixed(1)}
SA: ${saCoords[0].toFixed(1)}, ${saCoords[1].toFixed(1)}
ASIA: ${asiaCoords[0].toFixed(1)}, ${asiaCoords[1].toFixed(1)}
-->`;

        fs.writeFileSync('new-paths-land.html', pathsHtml);
        console.log('Saved new-paths-land.html');
    });
});
