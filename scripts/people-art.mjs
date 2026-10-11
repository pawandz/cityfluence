/**
 * Original typographic posters for the people pages (no photographs or
 * likenesses — these are editorial graphics). Generated on every build from
 * js/data/people.js into assets/images/people/<slug>.svg.
 *
 * SVG text is rendered with system fonts when used in <img>, so the poster
 * uses a robust heavy sans stack rather than the web fonts.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { FIELDS } from '../js/data/people.js';

const INK = '#121212';
const PAPER = '#FBFAF6';
const LIME = '#D4FF3A';
const FONT = "'Arial Black', 'Archivo Black', 'Helvetica Neue', Arial, sans-serif";

const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const FILM_BGS = ['#121212', '#173F3F', '#4A1C2C', '#1B2A4A'];

const filmReel = `
    <circle r="130" fill="${PAPER}" stroke="${INK}" stroke-width="10"/>
    ${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="0" cy="-72" r="30" fill="${INK}" transform="rotate(${a})"/>`).join('')}
    <circle r="22" fill="${LIME}" stroke="${INK}" stroke-width="6"/>
    <path d="M110 70 C170 120 200 150 260 150" stroke="${INK}" stroke-width="40" fill="none"/>
    <path d="M110 70 C170 120 200 150 260 150" stroke="${LIME}" stroke-width="14" stroke-dasharray="12 12" fill="none"/>`;
const spotlight = `
    <path d="M-200 180 L-30 -40 L30 -40 L200 180Z" fill="${LIME}" opacity="0.22"/>
    <path d="M0 -150 L35 -50 L140 -50 L55 10 L88 115 L0 52 L-88 115 L-55 10 L-140 -50 L-35 -50Z" fill="${LIME}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="0" cy="-15" r="26" fill="${PAPER}"/>`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const initials = (name) => name.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('');

// Field motifs, drawn in a 400×400 box centred at (0,0).
const motifs = {
  cricket: `
    <circle r="120" fill="${PAPER}"/>
    <circle r="120" fill="none" stroke="${INK}" stroke-width="10"/>
    <path d="M-48 -110 C-12 -40 -12 40 -48 110 M48 -110 C12 -40 12 40 48 110" fill="none" stroke="#B5583A" stroke-width="8" stroke-dasharray="14 10"/>
    <g fill="${INK}"><rect x="150" y="-150" width="14" height="300" rx="4"/><rect x="180" y="-150" width="14" height="300" rx="4"/><rect x="120" y="-150" width="14" height="300" rx="4"/><rect x="112" y="-164" width="90" height="10" rx="5" fill="${LIME}"/></g>`,
  film: `
    <rect x="-150" y="-60" width="300" height="200" rx="14" fill="${PAPER}"/>
    <rect x="-150" y="-60" width="300" height="200" rx="14" fill="none" stroke="${INK}" stroke-width="10"/>
    <g transform="rotate(-14 -150 -60)"><rect x="-150" y="-130" width="300" height="56" rx="8" fill="${INK}"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${-130 + i * 60} -130 l30 0 l-20 56 l-30 0z" fill="${LIME}"/>`).join('')}</g>
    <rect x="-150" y="-40" width="300" height="10" fill="${INK}"/>
    <circle cx="0" cy="55" r="44" fill="${LIME}" stroke="${INK}" stroke-width="8"/><path d="M-12 32 L22 55 L-12 78Z" fill="${INK}"/>`,
  shooting: `
    ${[150, 115, 80, 45].map((r, i) => `<circle r="${r}" fill="${i % 2 ? PAPER : INK}"/>`).join('')}
    <circle r="16" fill="${LIME}"/>
    <path d="M0 -175 V-120 M0 120 V175 M-175 0 H-120 M120 0 H175" stroke="${PAPER}" stroke-width="8"/>`,
  football: `
    <rect x="-180" y="-130" width="360" height="260" fill="none" stroke="${PAPER}" stroke-width="6" opacity="0.6"/>
    <path d="M0 -130 V130" stroke="${PAPER}" stroke-width="6" opacity="0.6"/><circle r="60" fill="none" stroke="${PAPER}" stroke-width="6" opacity="0.6"/>
    <circle r="95" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    <path d="M0 -38 L36 -12 L22 30 L-22 30 L-36 -12Z" fill="${INK}"/>
    <path d="M0 -38 V-95 M36 -12 L90 -30 M22 30 L56 77 M-22 30 L-56 77 M-36 -12 L-90 -30" stroke="${INK}" stroke-width="6"/>`,
  business: `
    ${[[-120, -90], [110, -110], [140, 70], [-90, 110], [10, -10]].map(([x, y], i, a) => a.slice(i + 1).map(([x2, y2]) => `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${PAPER}" stroke-width="4" opacity="0.55"/>`).join('')).join('')}
    ${[[-120, -90], [110, -110], [140, 70], [-90, 110]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="${PAPER}"/>`).join('')}
    <circle cx="10" cy="-10" r="78" fill="${LIME}" stroke="${INK}" stroke-width="8"/>
    <text x="10" y="18" text-anchor="middle" font-family="${FONT}" font-size="96" font-weight="900" fill="${INK}">@</text>`,
  courage: `
    <circle r="140" fill="none" stroke="${PAPER}" stroke-width="10"/>
    ${Array.from({ length: 24 }, (_, i) => `<line x1="0" y1="0" x2="0" y2="-130" stroke="${PAPER}" stroke-width="5" transform="rotate(${i * 15})"/>`).join('')}
    <circle r="34" fill="${LIME}" stroke="${INK}" stroke-width="8"/>
    <path d="M-190 120 L-40 100 L-10 60 L10 60 L0 100 L120 85 L150 60 L165 62 L150 100 L190 110 L150 120 L0 120 L10 160 L-10 160 L-40 122 Z" fill="${INK}" opacity="0.85"/>`,
  golf: `
    <path d="M-20 140 V-150" stroke="${PAPER}" stroke-width="10"/>
    <path d="M-15 -150 L120 -105 L-15 -60Z" fill="${LIME}" stroke="${INK}" stroke-width="6"/>
    <ellipse cx="-20" cy="150" rx="150" ry="26" fill="${PAPER}" opacity="0.25"/>
    <circle cx="90" cy="110" r="36" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    ${[[78, 98], [100, 100], [88, 118], [108, 120], [70, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${INK}" opacity="0.35"/>`).join('')}`,
  music: `
    <circle r="140" fill="${INK}"/>
    ${[120, 100, 80].map((r) => `<circle r="${r}" fill="none" stroke="${PAPER}" stroke-opacity="0.25" stroke-width="3"/>`).join('')}
    <circle r="46" fill="${LIME}"/><circle r="8" fill="${INK}"/>
    <path d="M120 -150 V40 a30 30 0 1 1 -20 -28 V-110 L170 -125 V-160Z" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>`,
  law: `
    <path d="M0 -150 V130 M-80 140 H80" stroke="${PAPER}" stroke-width="12" stroke-linecap="round"/>
    <path d="M-140 -110 H140" stroke="${PAPER}" stroke-width="10" stroke-linecap="round"/>
    <path d="M-140 -110 L-185 0 M-140 -110 L-95 0 M140 -110 L95 0 M140 -110 L185 0" fill="none" stroke="${PAPER}" stroke-width="5"/>
    <path d="M-190 0 a50 30 0 0 0 100 0Z M90 0 a50 30 0 0 0 100 0Z" fill="${LIME}" stroke="${INK}" stroke-width="5"/>
    <circle cy="-150" r="16" fill="${LIME}"/>`,
  writing: `
    <path d="M-170 -100 Q-85 -140 0 -100 V130 Q-85 90 -170 130Z" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    <path d="M170 -100 Q85 -140 0 -100 V130 Q85 90 170 130Z" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    ${[-60, -25, 10, 45].map((y) => `<path d="M-140 ${y} Q-85 ${y - 18} -30 ${y}" stroke="${INK}" stroke-opacity="0.35" stroke-width="5" fill="none"/>`).join('')}
    <path d="M60 60 L150 -140 L175 -128 L85 72 L55 82Z" fill="${LIME}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`,
  impact: `
    <path d="M0 150 V-10" stroke="${PAPER}" stroke-width="14" stroke-linecap="round"/>
    <path d="M0 30 Q-90 20 -120 -70 Q-30 -70 0 30Z" fill="${LIME}" stroke="${INK}" stroke-width="6"/>
    <path d="M0 -10 Q90 -20 120 -110 Q30 -110 0 -10Z" fill="${LIME}" stroke="${INK}" stroke-width="6"/>
    <path d="M0 -40 Q-20 -120 0 -170 Q20 -120 0 -40Z" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>
    <ellipse cy="155" rx="130" ry="20" fill="${PAPER}" opacity="0.25"/>`,
  sport: `
    <path d="M-90 -150 H90 V-60 A90 90 0 0 1 -90 -60Z" fill="${LIME}" stroke="${INK}" stroke-width="8"/>
    <path d="M-90 -130 H-140 A40 50 0 0 0 -90 -40 M90 -130 H140 A40 50 0 0 1 90 -40" fill="none" stroke="${PAPER}" stroke-width="10"/>
    <rect x="-18" y="28" width="36" height="60" fill="${PAPER}"/>
    <rect x="-80" y="88" width="160" height="40" rx="8" fill="${INK}"/>
    <path d="M0 -125 l12 26 28 4 -20 20 5 28 -25 -13 -25 13 5 -28 -20 -20 28 -4Z" fill="${PAPER}"/>`,
  art: `
    <path d="M-150 20 C-150 -110 -20 -150 70 -120 C160 -90 170 10 100 30 C60 42 70 90 30 110 C-40 150 -150 120 -150 20Z" fill="${PAPER}" stroke="${INK}" stroke-width="8"/>
    ${[[-90, -40, '#D4FF3A'], [-30, -95, '#D9757A'], [50, -80, '#1F4E8C'], [-95, 50, '#D9A441']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="26" fill="${c}" stroke="${INK}" stroke-width="5"/>`).join('')}
    <circle cx="40" cy="20" r="24" fill="${INK}" opacity="0.15"/>
    <path d="M150 -160 L40 60" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M40 60 L22 98 L60 76Z" fill="${LIME}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`,
  pageant: `
    <path d="M-150 60 L-130 -80 L-70 -10 L0 -120 L70 -10 L130 -80 L150 60 Z" fill="${LIME}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
    <rect x="-155" y="60" width="310" height="44" rx="10" fill="${INK}"/>
    ${[[-130, -80], [0, -120], [130, -80]].map(([x, y]) => `<circle cx="${x}" cy="${y - 18}" r="16" fill="${PAPER}" stroke="${INK}" stroke-width="6"/>`).join('')}
    ${[[-180, -150], [175, -160], [190, 20], [-195, 40]].map(([x, y]) => `<path d="M${x} ${y - 18} L${x + 6} ${y - 6} L${x + 18} ${y} L${x + 6} ${y + 6} L${x} ${y + 18} L${x - 6} ${y + 6} L${x - 18} ${y} L${x - 6} ${y - 6}Z" fill="${PAPER}"/>`).join('')}`,
};

function poster(p) {
  const field = FIELDS[p.field];
  const h = hash(p.slug);
  const bg = p.field === 'film' ? FILM_BGS[h % FILM_BGS.length] : field.colour;
  const motif = p.field === 'film' ? [motifs.film, filmReel, spotlight][h % 3] : motifs[p.field];
  const born = p.born.slice(0, 4);
  const years = p.died ? `${born}–${p.died.slice(0, 4)}` : `BORN ${p.bornLabel ?? born}`;
  const origin = p.connection === 'raised' ? 'RAISED IN CHANDIGARH' : 'MADE IN CHANDIGARH';
  const [first, ...rest] = p.name.toUpperCase().split(' ');
  const last = rest.join(' ');
  const nameSize = (s) => Math.min(92, Math.floor(700 / Math.max(s.length, 1) / 0.68));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img"><title>${esc(p.name)} — ${esc(field.label)} poster</title>
<defs><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.09 0"/></filter></defs>
<rect width="800" height="1000" fill="${bg}"/>
<text x="400" y="560" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="520" fill="none" stroke="${PAPER}" stroke-opacity="0.16" stroke-width="3" letter-spacing="-20">${esc(initials(p.name))}</text>
<rect x="40" y="40" width="720" height="920" fill="none" stroke="${PAPER}" stroke-opacity="0.35" stroke-width="2"/>
<text x="70" y="100" font-family="${FONT}" font-weight="900" font-size="22" letter-spacing="5" fill="${LIME}">${origin}</text>
<text x="730" y="100" text-anchor="end" font-family="${FONT}" font-weight="900" font-size="22" letter-spacing="4" fill="${PAPER}">${years}</text>
<g transform="translate(400 400)">${motif}</g>
<text x="70" y="${last ? 790 : 870}" font-family="${FONT}" font-weight="900" font-size="${nameSize(first)}" letter-spacing="-2" fill="${PAPER}">${esc(first)}</text>
${last ? `<text x="70" y="${790 + nameSize(last) + 4}" font-family="${FONT}" font-weight="900" font-size="${nameSize(last)}" letter-spacing="-2" fill="${PAPER}">${esc(last)}</text>` : ''}
<rect x="70" y="910" width="60" height="10" fill="${LIME}"/>
<text x="150" y="921" font-family="Arial, sans-serif" font-weight="700" font-size="26" letter-spacing="3" fill="${PAPER}">${esc(field.label.toUpperCase())}</text>
<rect width="800" height="1000" filter="url(#g)"/>
</svg>
`;
}

export function writePeopleArt(people) {
  mkdirSync('assets/images/people', { recursive: true });
  for (const p of people) writeFileSync(`assets/images/people/${p.slug}.svg`, poster(p));
  return people.length;
}
