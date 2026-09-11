const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

async function generateSamplePreview() {
  const stampBase64 = fs.readFileSync(path.join(__dirname, '../public/stamp-signature.png')).toString('base64');
  const logoFile = fs.existsSync(path.join(__dirname, '../public/loloo.png'))
    ? path.join(__dirname, '../public/loloo.png')
    : (fs.existsSync(path.join(__dirname, '../public/tk-olymp-logo-black.png'))
        ? path.join(__dirname, '../public/tk-olymp-logo-black.png')
        : '');
  const logoBase64 = logoFile ? fs.readFileSync(logoFile).toString('base64') : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 595 842" width="595" height="842" style="background:#ffffff">
    <!-- Pure white background -->
    <rect x="0" y="0" width="595" height="842" fill="#ffffff" />

    <!-- Red Header Banner -->
    <rect x="0" y="0" width="595" height="104" fill="#b91c24" />
    <text x="42" y="32" font-family="'Liberation Sans', Arial, sans-serif" font-weight="bold" font-size="11" fill="#ffffff">Taneční klub Olymp Olomouc, z. s.</text>
    <text x="42" y="48" font-family="'Liberation Sans', Arial, sans-serif" font-size="8.5" fill="#ffffff">Jiráskova 25, Olomouc - Hodolany 779 00</text>
    <text x="42" y="61" font-family="'Liberation Sans', Arial, sans-serif" font-size="8.5" fill="#ffffff">IČO: 68347286</text>
    <text x="42" y="74" font-family="'Liberation Sans', Arial, sans-serif" font-size="8.5" fill="#ffffff">L 4133 vedený u Krajského soudu v Ostravě</text>
    <text x="42" y="87" font-family="'Liberation Sans', Arial, sans-serif" font-size="8.5" fill="#ffffff">zastoupený předsedou Mgr. Miroslavem Hýžou</text>
    
    ${logoBase64 ? `<image href="data:image/png;base64,${logoBase64}" x="455" y="12" width="66" height="80" />` : ''}

    <!-- Document Title -->
    <text x="297" y="165" font-family="'Liberation Sans', Arial, sans-serif" font-weight="bold" font-size="20" fill="#111827" text-anchor="middle">Potvrzení o přijetí platby</text>

    <!-- Statement body -->
    <text x="55" y="210" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">Tímto potvrzuji,</text>

    <text x="55" y="240" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">Že dne 9. 9. 2026 byl z bankovního účtu č. 123456789/0800 vedeného na Jana Nováková</text>
    <text x="55" y="260" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">za tanečnici Eliška Nováková (r.č. 12. 5. 2016) uhrazen členský příspěvek a účastnický poplatek</text>
    <text x="55" y="280" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">do tanečního kroužku (ZŠ Za Mlýnem, Přerov):</text>

    <text x="55" y="325" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827" font-weight="bold">Částka: Kč 1 700,- <tspan font-weight="normal">(slovy: jedentisícsedmset)</tspan></text>
    <text x="55" y="355" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">Účet příjemce: 1806875329/5500 Tanečnímu klubu Olymp Olomouc, z.s.</text>
    <text x="55" y="385" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">za období : únor 2026 – květen 2026.</text>

    <text x="55" y="440" font-family="'Liberation Sans', Arial, sans-serif" font-size="11" fill="#111827">V Olomouci dne 9. 9. 2026</text>

    <!-- Stamp & Signature Image -->
    <image href="data:image/png;base64,${stampBase64}" x="330" y="460" width="205" height="110" />

    <text x="432" y="585" font-family="'Liberation Sans', Arial, sans-serif" font-weight="bold" font-size="10" fill="#111827" text-anchor="middle">Martin Matýsek</text>
    <text x="432" y="600" font-family="'Liberation Sans', Arial, sans-serif" font-size="8.5" fill="#4b5563" text-anchor="middle">Taneční klub Olymp Olomouc, z. s.</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(__dirname, '../public/sample-confirmation-preview.png'));

  console.log('Sample confirmation preview created successfully at public/sample-confirmation-preview.png');
}

generateSamplePreview().catch(console.error);
