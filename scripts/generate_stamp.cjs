const fs = require('fs');
const sharp = require('sharp');

// Exact replica of the TK Olymp Olomouc stamp and authorized signature
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="1200" height="640">
  <defs>
    <filter id="ink-bleed" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="0.3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- STAMP GRAPHICS & TEXT (Authentic black/dark charcoal stamp ink) -->
  <g id="official-stamp" transform="translate(45, 140)" fill="#1c1d22" filter="url(#ink-bleed)">
    <!-- Main Headline: TANEČNÍ KLUB OLYMP OLOMOUC -->
    <text x="210" y="32" 
          font-family="'Arial Black', 'Impact', 'Liberation Sans', sans-serif" 
          font-weight="900" 
          font-size="25" 
          letter-spacing="0.5" 
          text-anchor="middle">TANEČNÍ KLUB OLYMP OLOMOUC</text>

    <!-- Address line -->
    <text x="200" y="55" 
          font-family="'Liberation Sans', 'Arial', sans-serif" 
          font-weight="bold" 
          font-size="14.5" 
          letter-spacing="0.3" 
          text-anchor="middle">Jiráskova 25  779 00 Olomouc</text>

    <!-- IČ line -->
    <text x="200" y="77" 
          font-family="'Liberation Sans', 'Arial', sans-serif" 
          font-weight="bold" 
          font-size="14" 
          letter-spacing="0.6" 
          text-anchor="middle">IČ  683 47 286</text>

    <!-- Account number line -->
    <text x="200" y="99" 
          font-family="'Liberation Sans', 'Arial', sans-serif" 
          font-weight="bold" 
          font-size="15" 
          letter-spacing="0.4" 
          text-anchor="middle">čú:  1806875329 / 0800</text>

    <!-- Footer: (1) www.tkolymp.cz  tkolymp@tkolymp.cz -->
    <text x="10" y="119" 
          font-family="'Liberation Sans', 'Arial', sans-serif" 
          font-weight="bold" 
          font-size="11.5">(1)</text>

    <text x="40" y="119" 
          font-family="'Liberation Sans', 'Arial', sans-serif" 
          font-weight="bold" 
          font-size="13" 
          letter-spacing="0.2">www.tkolymp.cz</text>

    <text x="230" y="119" 
          font-family="'Liberation Sans', 'Arial', sans-serif" 
          font-weight="bold" 
          font-size="13" 
          letter-spacing="0.2">tkolymp@tkolymp.cz</text>

    <!-- DANCER LOGO ON THE RIGHT (TK Olymp emblem) -->
    <g transform="translate(375, 48)" fill="#1c1d22">
      <!-- Heads of the two dancing partners -->
      <circle cx="34" cy="5" r="4.2" />
      <circle cx="48" cy="4.5" r="4.2" />

      <!-- Ribbon-like swooping dancers body with flared base -->
      <path d="M 12 18 C 22 17, 36 15, 60 17 C 56 20, 42 22, 32 26 C 39 33, 49 44, 55 58 C 47 50, 36 40, 26 34 C 23 42, 17 50, 7 56 C 15 48, 22 41, 25 32 C 20 30, 15 26, 8 24 Z" />
    </g>
  </g>

  <!-- HANDWRITTEN OVERLAID PEN SIGNATURE (Authentic dark blue ink) -->
  <g id="handwritten-signature" fill="none" stroke="#18235b" stroke-linecap="round" stroke-linejoin="round" filter="url(#ink-bleed)">
    <!-- 1. Long diagonal upward launch stroke from left -->
    <path d="M 50 180 Q 200 110 348 48" stroke-width="3.2" />

    <!-- 2. Top acute turn and first descending loop -->
    <path d="M 348 48 C 354 46, 350 56, 342 66 C 310 108, 240 145, 205 130 C 190 123, 210 100, 250 82 C 290 64, 335 60, 350 66 C 356 70, 350 80, 338 92 C 300 130, 240 160, 192 142" stroke-width="2.8" />

    <!-- 3. Rhythmic initials & name crests (the internal waves) -->
    <path d="M 194 142 C 198 128, 212 112, 220 126 C 226 138, 228 155, 235 125 C 240 108, 252 108, 256 128 C 262 148, 265 170, 272 195" stroke-width="2.8" />

    <!-- 4. Sharp hook down-left across the top text of the stamp -->
    <path d="M 272 195 L 145 204" stroke-width="3.2" />

    <!-- 5. Large confident bottom swoop arching across the stamp and up to the right -->
    <path d="M 145 204 C 150 200, 190 182, 230 178 C 280 172, 360 170, 415 138" stroke-width="3" />
  </g>
</svg>`;

fs.writeFileSync('public/stamp-signature.svg', svg);

sharp(Buffer.from(svg))
  .png({ compressionLevel: 9 })
  .toFile('public/stamp-signature.png')
  .then(() => {
    console.log('Successfully created public/stamp-signature.png and public/stamp-signature.svg');
  })
  .catch(err => {
    console.error('Error generating stamp PNG:', err);
    process.exit(1);
  });
