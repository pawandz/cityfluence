/**
 * Generates the original placeholder illustrations in assets/images/.
 *
 * These are art-directed stand-ins inspired by Chandigarh's architecture and
 * life. Replace them with licensed / commissioned photography before launch
 * (keep the same filenames, or update js/data and src/pages accordingly).
 *
 *   node scripts/generate-art.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const C = {
  ivory: '#F3F0E8', paper: '#FBFAF6', beige: '#E4DDCF', sand: '#D3C8B4', concrete: '#BDB8AD',
  stone: '#8C877D', ink: '#121212', soft: '#2A2A28', lime: '#D4FF3A', brick: '#B5583A',
  sky: '#D7DDD8', sage: '#8FA08A', green: '#5E7A5A', rose: '#D9757A', blush: '#EBC2B8', ochre: '#D9A441',
};

const out = 'assets/images';
mkdirSync(out, { recursive: true });
const save = (name, w, h, body, title) =>
  writeFileSync(
    `${out}/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"><title>${title}</title>${body}</svg>\n`,
  );

// Deterministic RNG so rebuilds are stable.
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

const grain = (id, opacity = 0.08) => `
<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0"/></filter>`;
const grainRect = (id, w, h) => `<rect width="${w}" height="${h}" filter="url(#${id})"/>`;

// ─── Capitol Complex (Assembly) ─────────────────────
{
  const w = 900, h = 1100;
  let brise = '';
  for (let x = 120; x < 780; x += 36) brise += `<rect x="${x}" y="640" width="10" height="200" fill="${C.stone}"/>`;
  for (let y = 660; y < 840; y += 40) brise += `<rect x="110" y="${y}" width="680" height="6" fill="${C.stone}" opacity="0.6"/>`;
  save('capitol', w, h, `
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.beige}"/><stop offset="1" stop-color="${C.ivory}"/></linearGradient>${grain('g1')}</defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
<circle cx="640" cy="250" r="120" fill="${C.lime}"/>
<path d="M0 560 L140 470 L260 520 L400 430 L560 500 L700 440 L900 520 L900 640 L0 640Z" fill="${C.sage}" opacity="0.45"/>
<rect x="90" y="620" width="720" height="240" fill="${C.concrete}"/>
${brise}
<path d="M300 620 C300 470 290 400 330 330 L470 330 C510 400 500 470 500 620Z" fill="${C.sand}"/>
<path d="M300 620 C300 470 290 400 330 330 L360 330 C330 400 330 470 340 620Z" fill="${C.stone}" opacity="0.35"/>
<rect x="318" y="316" width="164" height="18" fill="${C.soft}"/>
<path d="M560 620 L640 520 L720 620Z" fill="${C.soft}"/>
<path d="M60 600 Q250 540 450 600 Q650 540 840 600 L840 618 L60 618Z" fill="${C.ink}"/>
<rect x="120" y="618" width="12" height="70" fill="${C.ink}"/><rect x="770" y="618" width="12" height="70" fill="${C.ink}"/>
<rect x="420" y="740" width="70" height="120" fill="${C.brick}"/>
<rect x="0" y="860" width="${w}" height="240" fill="${C.sky}"/>
<g opacity="0.35">${Array.from({ length: 9 }, (_, i) => `<rect x="${100 + (i % 3) * 30}" y="${880 + i * 22}" width="${600 - i * 40}" height="3" fill="${C.stone}"/>`).join('')}</g>
<rect x="420" y="880" width="70" height="60" fill="${C.brick}" opacity="0.35"/>
${grainRect('g1', w, h)}`, 'Illustration inspired by the Capitol Complex, Chandigarh');
}

// ─── Open Hand ──────────────────────────────────────
{
  const w = 800, h = 1000;
  save('open-hand', w, h, `
<defs>${grain('g2')}</defs>
<rect width="${w}" height="${h}" fill="${C.sky}"/>
<circle cx="400" cy="400" r="270" fill="${C.ivory}"/>
<g transform="translate(400 420)">
  <path d="M-190 -40 L-150 -210 L-100 -60 L-60 -250 L-10 -70 L40 -250 L80 -60 L130 -220 L170 -40 Q120 150 0 170 Q-120 150 -190 -40Z" fill="${C.ink}"/>
  <path d="M-150 -20 Q0 60 150 -20" stroke="${C.lime}" stroke-width="10" fill="none"/>
</g>
<rect x="390" y="580" width="20" height="260" fill="${C.ink}"/>
<path d="M260 840 L540 840 L500 880 L300 880Z" fill="${C.soft}"/>
<rect x="0" y="880" width="${w}" height="120" fill="${C.concrete}"/>
<circle cx="640" cy="160" r="46" fill="${C.lime}"/>
${grainRect('g2', w, h)}`, 'Illustration inspired by the Open Hand Monument');
}

// ─── Rock Garden mosaic ─────────────────────────────
{
  const w = 800, h = 1000;
  const r = rng(7);
  const palette = [C.paper, C.beige, C.sand, C.concrete, C.brick, C.ochre, C.sky, C.lime];
  let shards = '';
  for (let y = 0; y < h; y += 34) {
    for (let x = 0; x < w; x += 34) {
      const j = () => (r() - 0.5) * 14;
      const fill = palette[Math.floor(r() * palette.length)];
      shards += `<path d="M${x + j()} ${y + j()} L${x + 34 + j()} ${y + j()} L${x + 34 + j()} ${y + 34 + j()} L${x + j()} ${y + 34 + j()}Z" fill="${fill}" stroke="${C.ivory}" stroke-width="3"/>`;
    }
  }
  let figures = '';
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 5; i++) {
      const cx = 110 + i * 145 + (row % 2) * 30;
      const cy = 330 + row * 230;
      figures += `<g><path d="M${cx - 42} ${cy + 120} L${cx} ${cy - 10} L${cx + 42} ${cy + 120}Z" fill="${C.ink}"/><circle cx="${cx}" cy="${cy - 34}" r="30" fill="${C.paper}" stroke="${C.ink}" stroke-width="6"/><circle cx="${cx - 10}" cy="${cy - 38}" r="4" fill="${C.ink}"/><circle cx="${cx + 10}" cy="${cy - 38}" r="4" fill="${C.ink}"/></g>`;
    }
  }
  save('rock-garden', w, h, `<rect width="${w}" height="${h}" fill="${C.ivory}"/><g opacity="0.85">${shards}</g><rect x="40" y="180" width="${w - 80}" height="760" rx="24" fill="${C.ivory}" opacity="0.55"/>${figures}`, 'Mosaic-style illustration inspired by the Rock Garden');
}

// ─── Sukhna Lake ────────────────────────────────────
{
  const w = 1200, h = 800;
  let ripples = '';
  for (let i = 0; i < 14; i++) ripples += `<rect x="${80 + ((i * 137) % 900)}" y="${560 + i * 16}" width="${120 + ((i * 53) % 200)}" height="3" rx="2" fill="${C.paper}" opacity="0.7"/>`;
  save('sukhna', w, h, `
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.beige}"/><stop offset="1" stop-color="${C.blush}"/></linearGradient>${grain('g3')}</defs>
<rect width="${w}" height="${h}" fill="url(#s)"/>
<circle cx="820" cy="300" r="110" fill="${C.lime}"/>
<path d="M0 420 L160 300 L300 380 L470 250 L640 360 L820 280 L1000 370 L1200 290 L1200 520 L0 520Z" fill="${C.sage}" opacity="0.55"/>
<path d="M0 470 L200 380 L380 450 L600 360 L800 450 L1000 390 L1200 460 L1200 530 L0 530Z" fill="${C.green}" opacity="0.8"/>
<rect x="0" y="520" width="${w}" height="280" fill="${C.sky}"/>
${ripples}
<path d="M300 600 L420 600 L400 622 L320 622Z" fill="${C.ink}"/><rect x="356" y="560" width="4" height="40" fill="${C.ink}"/><path d="M360 562 L392 596 L360 596Z" fill="${C.lime}"/>
<rect x="0" y="740" width="${w}" height="60" fill="${C.concrete}"/>
${Array.from({ length: 9 }, (_, i) => `<g transform="translate(${90 + i * 128} 700)"><circle r="9" fill="${C.ink}"/><rect x="-6" y="8" width="12" height="32" rx="5" fill="${C.ink}"/></g>`).join('')}
${grainRect('g3', w, h)}`, 'Illustration inspired by Sukhna Lake and the Shivalik hills');
}

// ─── Café table ─────────────────────────────────────
{
  const w = 800, h = 800;
  save('cafe', w, h, `
<defs>${grain('g4', 0.1)}</defs>
<rect width="${w}" height="${h}" fill="${C.sand}"/>
<g opacity="0.25">${Array.from({ length: 10 }, (_, i) => `<rect x="0" y="${i * 80}" width="${w}" height="2" fill="${C.stone}"/>`).join('')}</g>
<circle cx="360" cy="380" r="200" fill="${C.paper}"/>
<circle cx="360" cy="380" r="130" fill="${C.ink}"/>
<circle cx="360" cy="380" r="110" fill="#8a5a3c"/>
<path d="M360 320 C320 330 310 380 360 430 C410 380 400 330 360 320Z" fill="${C.paper}" opacity="0.9"/>
<path d="M360 340 C340 350 338 380 360 405 C382 380 380 350 360 340Z" fill="#8a5a3c"/>
<path d="M490 380 h70 a26 26 0 0 1 0 52 h-70" fill="none" stroke="${C.ink}" stroke-width="18"/>
<path d="M560 600 Q620 520 700 560 Q760 600 700 660 Q620 700 560 600Z" fill="${C.ochre}"/>
<path d="M580 600 Q630 560 690 590" stroke="#a06d1c" stroke-width="6" fill="none"/>
<rect x="120" y="640" width="200" height="16" rx="8" fill="${C.ink}" transform="rotate(-18 220 648)"/>
<rect x="80" y="90" width="150" height="150" rx="10" fill="${C.lime}" transform="rotate(8 155 165)"/>
${grainRect('g4', w, h)}`, 'Top-down illustration of coffee and a pastry on a café table');
}

// ─── Thali ──────────────────────────────────────────
{
  const w = 800, h = 800;
  const bowls = [[400, 220, C.ochre], [560, 300, C.brick], [600, 470, C.green], [480, 600, C.paper], [300, 600, C.rose], [220, 450, C.lime]];
  save('food', w, h, `
<defs>${grain('g5', 0.1)}</defs>
<rect width="${w}" height="${h}" fill="${C.brick}"/>
<circle cx="400" cy="420" r="320" fill="${C.concrete}"/>
<circle cx="400" cy="420" r="300" fill="${C.beige}"/>
${bowls.map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="74" fill="${C.stone}"/><circle cx="${x}" cy="${y}" r="62" fill="${f}"/>`).join('')}
<circle cx="390" cy="420" r="96" fill="#e9d6a8"/><circle cx="370" cy="400" r="8" fill="#c79a52"/><circle cx="410" cy="440" r="6" fill="#c79a52"/>
<ellipse cx="230" cy="280" rx="90" ry="70" fill="#d9b36c"/><ellipse cx="230" cy="280" rx="60" ry="44" fill="none" stroke="#b78c45" stroke-width="4" stroke-dasharray="6 10"/>
${grainRect('g5', w, h)}`, 'Illustration of a thali with bowls of food');
}

// ─── Fashion / editorial figure ─────────────────────
{
  const w = 800, h = 800;
  save('fashion', w, h, `
<defs>${grain('g6')}</defs>
<rect width="${w}" height="${h}" fill="${C.beige}"/>
<rect x="420" y="0" width="380" height="${h}" fill="${C.lime}"/>
<circle cx="400" cy="210" r="70" fill="${C.ink}"/>
<path d="M400 290 C300 290 250 360 240 460 L210 800 L590 800 L560 460 C550 360 500 290 400 290Z" fill="${C.ink}"/>
<path d="M400 300 L360 800 M400 300 L440 800" stroke="${C.soft}" stroke-width="6"/>
<path d="M330 330 L400 470 L470 330" fill="none" stroke="${C.paper}" stroke-width="10"/>
<rect x="250" y="150" width="70" height="26" rx="12" fill="${C.paper}"/><rect x="480" y="150" width="70" height="26" rx="12" fill="${C.paper}"/>
<g stroke="${C.ink}" stroke-width="10" fill="none"><path d="M60 60 h80 M60 60 v80"/><path d="M740 60 h-80 M740 60 v80"/><path d="M60 740 h80 M60 740 v-80"/><path d="M740 740 h-80 M740 740 v-80"/></g>
${grainRect('g6', w, h)}`, 'Abstract editorial fashion illustration');
}

// ─── Sector grid map ────────────────────────────────
{
  const w = 1200, h = 800;
  let cells = '';
  let n = 1;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 60 + col * 185, y = 60 + row * 175;
      const num = n === 13 ? ++n : n;
      const fill = num === 17 ? C.lime : num === 1 ? C.ink : C.paper;
      cells += `<rect x="${x}" y="${y}" width="165" height="155" rx="6" fill="${fill}" stroke="${C.stone}"/>`;
      cells += `<text x="${x + 14}" y="${y + 40}" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="${num === 1 ? C.lime : C.ink}">${num}</text>`;
      n++;
    }
  }
  save('sector-grid', w, h, `
<rect width="${w}" height="${h}" fill="${C.beige}"/>
${cells}
<path d="M520 40 C540 200 500 400 540 760" stroke="${C.green}" stroke-width="26" fill="none" opacity="0.75"/>
<rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${C.ink}" stroke-width="2"/>`, 'Abstract illustration of numbered city sectors with a green belt');
}

// ─── Sector 17 plaza ────────────────────────────────
{
  const w = 800, h = 800;
  let cols = '';
  for (let x = 60; x < 760; x += 70) cols += `<rect x="${x}" y="250" width="22" height="240" fill="${C.concrete}"/>`;
  let people = '';
  const r = rng(11);
  for (let i = 0; i < 16; i++) {
    const x = 60 + r() * 680, y = 560 + r() * 180, s = 0.7 + r() * 0.6;
    people += `<g transform="translate(${x} ${y}) scale(${s})"><circle r="10" fill="${C.ink}"/><rect x="-8" y="10" width="16" height="36" rx="6" fill="${i % 4 === 0 ? C.lime : C.ink}"/></g>`;
  }
  save('sector17', w, h, `
<defs>${grain('g7')}</defs>
<rect width="${w}" height="${h}" fill="${C.sky}"/>
<rect x="0" y="120" width="${w}" height="130" fill="${C.sand}"/>
${Array.from({ length: 10 }, (_, i) => `<rect x="${20 + i * 78}" y="140" width="56" height="90" fill="${C.stone}" opacity="0.5"/>`).join('')}
<rect x="0" y="230" width="${w}" height="24" fill="${C.soft}"/>
${cols}
<rect x="0" y="490" width="${w}" height="310" fill="${C.ivory}"/>
<g opacity="0.4">${Array.from({ length: 12 }, (_, i) => `<path d="M${i * 70} 490 L${i * 70 - 200} 800" stroke="${C.stone}" stroke-width="2"/>`).join('')}</g>
<ellipse cx="420" cy="610" rx="120" ry="34" fill="${C.concrete}"/><ellipse cx="420" cy="600" rx="96" ry="22" fill="${C.sky}"/>
${people}
${grainRect('g7', w, h)}`, 'Illustration of a pedestrian plaza with modernist arcades');
}

// ─── Nightlife ──────────────────────────────────────
{
  const w = 800, h = 800;
  let lights = '';
  for (let i = 0; i < 12; i++) lights += `<circle cx="${40 + i * 66}" cy="${120 + Math.sin(i / 1.9) * 40}" r="9" fill="${i % 3 ? C.ochre : C.lime}"/>`;
  save('nightlife', w, h, `
<defs><radialGradient id="glow"><stop offset="0" stop-color="${C.lime}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.lime}" stop-opacity="0"/></radialGradient>${grain('g8', 0.14)}</defs>
<rect width="${w}" height="${h}" fill="${C.ink}"/>
<path d="M0 120 Q400 220 800 120" stroke="${C.stone}" stroke-width="2" fill="none"/>
${lights}
<circle cx="400" cy="430" r="260" fill="url(#glow)"/>
<rect x="160" y="560" width="480" height="40" fill="${C.soft}"/>
<rect x="390" y="380" width="8" height="180" fill="${C.paper}"/><circle cx="394" cy="372" r="18" fill="${C.paper}"/>
<g fill="${C.soft}">${Array.from({ length: 9 }, (_, i) => `<circle cx="${70 + i * 82}" cy="700" r="34"/><rect x="${40 + i * 82}" y="720" width="60" height="80" rx="20"/>`).join('')}</g>
${grainRect('g8', w, h)}`, 'Illustration of a live music night with string lights');
}

// ─── Rose garden ────────────────────────────────────
{
  const w = 800, h = 1000;
  const r = rng(23);
  let beds = '';
  for (let row = 0; row < 5; row++) {
    const y = 300 + row * 140;
    beds += `<rect x="60" y="${y}" width="680" height="90" rx="45" fill="${C.green}"/>`;
    for (let i = 0; i < 14; i++) {
      const x = 100 + i * 46 + r() * 10;
      beds += `<circle cx="${x}" cy="${y + 30 + r() * 30}" r="${12 + r() * 8}" fill="${[C.rose, C.blush, C.paper, C.brick][Math.floor(r() * 4)]}"/>`;
    }
  }
  save('rose-garden', w, h, `
<defs>${grain('g9')}</defs>
<rect width="${w}" height="${h}" fill="${C.ivory}"/>
<rect x="0" y="0" width="${w}" height="260" fill="${C.beige}"/>
<circle cx="600" cy="140" r="70" fill="${C.lime}"/>
<path d="M0 250 Q200 180 400 240 Q600 300 800 230 L800 270 L0 270Z" fill="${C.sage}"/>
${beds}
${grainRect('g9', w, h)}`, 'Illustration of formal rose beds in a garden');
}

// ─── Placeholder portraits ──────────────────────────
const portraitBgs = [C.lime, C.beige, C.blush, C.sky, C.sand, C.sage, C.ochre, C.concrete, C.rose];
const outfits = [C.ink, C.brick, C.paper, C.green, C.soft, C.stone, C.ink, C.brick, C.soft];
const skins = ['#8d5a3b', '#b07a55', '#6f4630', '#c08a63', '#9b6845', '#7a4e34', '#a87350', '#5f3b28', '#b98560'];
for (let i = 0; i < 9; i++) {
  const w = 480, h = 600;
  const bg = portraitBgs[i], outfit = outfits[i], skin = skins[i];
  const hair = [
    `<path d="M170 220 Q170 120 240 115 Q310 120 310 220 Q300 160 240 160 Q180 160 170 220Z" fill="${C.ink}"/>`,
    `<path d="M160 260 Q150 110 240 108 Q330 110 320 260 L320 360 L300 360 L300 220 Q240 170 180 220 L180 360 L160 360Z" fill="${C.ink}"/>`,
    `<circle cx="240" cy="150" r="58" fill="${C.ink}"/>`,
    `<path d="M168 200 Q240 90 312 200 L312 180 Q240 120 168 180Z" fill="${C.ink}"/><rect x="160" y="150" width="160" height="40" rx="14" fill="${C.lime}"/>`,
  ][i % 4];
  const extra = [
    `<rect x="190" y="205" width="40" height="16" rx="6" fill="${C.ink}"/><rect x="250" y="205" width="40" height="16" rx="6" fill="${C.ink}"/><rect x="228" y="210" width="24" height="4" fill="${C.ink}"/>`,
    `<circle cx="178" cy="250" r="7" fill="${C.ochre}"/>`,
    '',
    `<rect x="300" y="430" width="70" height="52" rx="8" fill="${C.ink}"/><circle cx="335" cy="456" r="14" fill="${C.stone}"/>`,
  ][i % 4];
  save(`portrait-${String(i + 1).padStart(2, '0')}`, w, h, `
<rect width="${w}" height="${h}" fill="${bg}"/>
<circle cx="${i % 2 ? 380 : 100}" cy="${i % 3 ? 120 : 480}" r="90" fill="${C.paper}" opacity="0.35"/>
<path d="M60 600 Q70 410 240 400 Q410 410 420 600Z" fill="${outfit}"/>
<rect x="214" y="300" width="52" height="110" rx="20" fill="${skin}"/>
<ellipse cx="240" cy="230" rx="72" ry="88" fill="${skin}"/>
${hair}
${extra}
<path d="M200 412 L240 470 L280 412" fill="none" stroke="${outfit === C.paper ? C.ink : C.paper}" stroke-width="6" opacity="0.6"/>`, 'Placeholder portrait illustration');
}

// ─── Favicon ────────────────────────────────────────
mkdirSync('assets/icons', { recursive: true });
writeFileSync('assets/icons/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${C.ink}"/><path d="M41 22a13 13 0 1 0 0 20" fill="none" stroke="${C.paper}" stroke-width="7" stroke-linecap="round"/><circle cx="46" cy="44" r="6" fill="${C.lime}"/></svg>\n`);

console.log('Art generated.');
