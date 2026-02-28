import fs from 'fs';

let content = fs.readFileSync('index.html', 'utf8');

const regex = /(<!-- PT → C\. Europe \(Germany\/France\) -->)[\s\S]*?(<\/svg>)/;

const newSection = `$1
            <path class="map-route map-route-1" stroke="#f97316" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.85" d="M468 173 C 480 160, 500 155, 510 150" />
            <!-- PT → W. Africa (Dakar/Ghana) -->
            <path class="map-route map-route-2" stroke="#f97316" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.75" d="M468 173 C 450 220, 440 260, 450 300" />
            <!-- PT → E. Africa (Mombasa) -->
            <path class="map-route map-route-3" stroke="#f97316" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.65" d="M468 173 C 490 220, 510 260, 530 310" />
            <!-- PT → UK -->
            <path class="map-route map-route-4" stroke="#f97316" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55" d="M468 173 C 470 160, 475 145, 480 135" />

            <!-- Destination nodes -->
            <circle cx="510" cy="150" r="4" fill="#f97316" opacity="0.85" />
            <circle cx="450" cy="300" r="4" fill="#f97316" opacity="0.75" />
            <circle cx="530" cy="310" r="3.5" fill="#f97316" opacity="0.65" />
            <circle cx="480" cy="135" r="3" fill="#f97316" opacity="0.55" />

            <!-- Layer 3: PT Hub -->
            <circle class="map-hub-glow" cx="468" cy="173" r="50" fill="url(#ptGlow)" />
            <circle cx="468" cy="173" r="6" fill="#f97316" />
            <circle class="map-hub-ring" cx="468" cy="173" r="14" fill="none" stroke="#f97316" stroke-width="1.5" opacity="0.9" />
            <text x="478" y="169" fill="#f97316" font-size="11" font-weight="700" font-family="Inter,sans-serif">PT</text>
          $2`;

content = content.replace(regex, newSection);

fs.writeFileSync('index.html', content);
console.log('done');
