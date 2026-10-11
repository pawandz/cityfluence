/**
 * Build helpers for the "Famous People from Chandigarh" section:
 * listing-page renderers, per-person template context and structured data.
 */
import { people, FIELDS, EXCLUDED, PEOPLE_REVIEWED } from '../js/data/people.js';
import { renderPersonCard, escapeHtml, formatDate } from '../js/components/render.js';

export { people };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return m ? `${d} ${MONTHS[m - 1]} ${y}` : String(y);
};
/** Birth date for display; honours approximate years from the source (e.g. "1982/83"). */
const bornText = (p) => p.bornLabel ?? longDate(p.born);
const year = (iso) => Number(iso.slice(0, 4));
const fieldLabel = (p) => FIELDS[p.field].label;
const byBirth = [...people].sort((a, b) => a.born.localeCompare(b.born));
const bornHere = byBirth.filter((p) => p.connection === 'born');
const raisedHere = byBirth.filter((p) => p.connection !== 'born');

const usedFields = () => Object.keys(FIELDS).filter((k) => people.some((p) => p.field === k));

/** Renderers for the listing page and homepage teaser ({{render:...}}). */
export function peopleRenderers(root) {
  return {
    'people-grid': () => bornHere.map((p) => renderPersonCard(p, root, fieldLabel(p))).join(''),
    'people-grid-raised': () => raisedHere.map((p) => renderPersonCard(p, root, fieldLabel(p))).join(''),
    'people-born-count': () => String(bornHere.length),
    'people-total': () => String(people.length),
    'people-teaser': () =>
      ['kapil-dev', 'neerja-bhanot', 'ayushmann-khurrana', 'yuvraj-singh', 'sabeer-bhatia', 'wamiqa-gabbi']
        .map((s) => people.find((p) => p.slug === s))
        .filter(Boolean)
        .map((p) => renderPersonCard(p, root, fieldLabel(p)))
        .join(''),
    'people-chips': () =>
      [['', 'All'], ...usedFields().map((k) => [k, FIELDS[k].label])]
        .map(([k, label], i) => `<button type="button" class="chip-filter" data-filter-field="${k}" aria-pressed="${i === 0}">${escapeHtml(label)}</button>`)
        .join(''),
    'people-hero-stats': () =>
      [
        [people.length, 'profiles'],
        [usedFields().length, 'fields'],
        [`${year(bornHere[0].born)}–${year(bornHere.at(-1).born)}`, 'birth years'],
      ]
        .map(([v, l]) => `<li><strong>${v}</strong><span>${l}</span></li>`)
        .join(''),
    'people-poster-wall': () =>
      ['kapil-dev', 'neerja-bhanot', 'ayushmann-khurrana', 'sabeer-bhatia', 'yuvraj-singh', 'sandesh-jhingan']
        .map((s) => `<img src="${root}assets/images/people/${s}.svg" alt="" width="800" height="1000">`)
        .join(''),
    'people-legend': () =>
      `<ul class="births-legend">${usedFields()
        .map((k) => `<li><span class="births-legend__dot" style="background:${FIELDS[k].colour}"></span>${escapeHtml(FIELDS[k].label)}</li>`)
        .join('')}</ul>`,
    'people-births-chart': () => birthsChart(root),
    'people-excluded': () => EXCLUDED.map((e) => `${escapeHtml(e.name)} is not included: ${escapeHtml(e.reason)}`).join(' '),
  };
}

/** SVG dot plot of birth years; every dot links to the profile. */
function birthsChart(root) {
  const W = 1200, padX = 50, R = 15, GAP = 4, STEP = 2 * R + GAP;
  const min = 1950, max = 2005;
  const x = (y) => padX + ((y - min) / (max - min)) * (W - padX * 2);
  // Greedy stacking: each dot takes the lowest level where it touches nobody.
  const placed = [];
  for (const p of bornHere) {
    const cx = x(year(p.born));
    let level = 0;
    while (placed.some((d) => d.level === level && Math.abs(d.cx - cx) < STEP)) level += 1;
    placed.push({ p, cx, level });
  }
  const levels = Math.max(...placed.map((d) => d.level)) + 1;
  const base = 40 + levels * STEP;
  const H = base + 50;
  const ticks = [];
  for (let y = 1950; y <= 2000; y += 10) ticks.push(`<g><line x1="${x(y)}" y1="${base}" x2="${x(y)}" y2="${base + 10}" stroke="currentColor"/><text x="${x(y)}" y="${base + 34}" text-anchor="middle" class="births-chart__tick">${y}s</text></g>`);
  return `<svg class="births-chart__svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Birth years of famous people from Chandigarh">
  <line x1="${padX}" y1="${base}" x2="${W - padX}" y2="${base}" stroke="currentColor" stroke-width="2"/>
  ${ticks.join('')}
  ${placed
    .map(({ p, cx, level }) => {
      const cy = base - R - 6 - level * STEP;
      return `<a href="${root}people/${p.slug}/" class="births-chart__dot"><title>${escapeHtml(p.name)} — born ${year(p.born)}, ${escapeHtml(fieldLabel(p))}</title>${level ? `<line x1="${cx.toFixed(1)}" y1="${base}" x2="${cx.toFixed(1)}" y2="${cy}" stroke="currentColor" stroke-opacity="0.15"/>` : ''}<circle cx="${cx.toFixed(1)}" cy="${cy}" r="${R}" fill="${FIELDS[p.field].colour}"/><text x="${cx.toFixed(1)}" y="${cy + 4}" text-anchor="middle" class="births-chart__initials">${escapeHtml(p.name.split(' ').map((w) => w[0]).slice(0, 2).join(''))}</text></a>`;
    })
    .join('')}
</svg>`;
}

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

/** Auto-generated, factual FAQ from the data (also used for FAQPage schema). */
function faqFor(p) {
  const first = p.name.split(' ')[0];
  const when = p.born.length > 4 && !p.bornLabel ? `on ${longDate(p.born)}` : `in ${bornText(p)}`;
  const qa = [
    p.connection === 'born'
      ? [`Where was ${p.name} born?`, `${p.name} was born in Chandigarh, India. ${p.roots}`]
      : [`Is ${p.name} from Chandigarh?`, p.roots],
    [`When was ${p.name} born?`, `${p.name} was born ${when}.${p.died ? ` ${first} died on ${longDate(p.died)}.` : ''}`],
    [`What is ${p.name} known for?`, `${p.name} is known for ${p.knownFor.slice(0, -1).join(', ')}${p.knownFor.length > 1 ? ' and ' : ''}${p.knownFor.at(-1)}.`],
  ];
  if (p.honours.length) qa.push([`What awards has ${p.name} received?`, `Honours include ${p.honours.join('; ')}.`]);
  return qa;
}

/** Full template context for one person page. */
export function personContext(p, root, { canonical, siteUrl, arrowIcon }) {
  const i = byBirth.indexOf(p);
  const prev = byBirth[(i - 1 + byBirth.length) % byBirth.length];
  const next = byBirth[(i + 1) % byBirth.length];
  const related = [
    ...people.filter((x) => x.field === p.field && x !== p),
    ...people.filter((x) => x.field !== p.field && x !== p),
  ].slice(0, 4);
  const faq = faqFor(p);
  const [first, ...rest] = p.name.split(' ');

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    description: p.summary,
    birthDate: p.born,
    ...(p.died ? { deathDate: p.died } : {}),
    ...(p.connection === 'born' ? { birthPlace: { '@type': 'Place', name: 'Chandigarh, India' } } : {}),
    jobTitle: p.role,
    ...(p.honours.length ? { award: p.honours } : {}),
    sameAs: [p.wiki, `https://www.wikidata.org/wiki/${p.wikidata}`],
    mainEntityOfPage: canonical,
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Famous People', item: `${siteUrl}/people/` },
      { '@type': 'ListItem', position: 3, name: p.name, item: canonical },
    ],
  };

  const chip = (label, value, iso) => `<li><span>${label}</span><time datetime="${iso}">${value}</time></li>`;

  return {
    slug: p.slug,
    jsonld: jsonLd(person) + jsonLd(faqLd) + jsonLd(crumbs),
    fieldColour: FIELDS[p.field].colour,
    fieldLabel: escapeHtml(fieldLabel(p)),
    personName: escapeHtml(p.name),
    personFirst: escapeHtml(first),
    personNameLines: `<span class="line"><span class="line__inner">${escapeHtml(first)}</span></span>${rest.length ? `<span class="line"><span class="line__inner">${escapeHtml(rest.join(' '))}</span></span>` : ''}`,
    personRole: escapeHtml(p.role),
    personIntro: escapeHtml(p.intro),
    personRoots: escapeHtml(p.roots),
    bornIso: p.born,
    bornLabel: bornText(p),
    originLabel: p.connection === 'born' ? 'Made in Chandigarh' : 'Raised in Chandigarh',
    originChip: p.connection === 'born' ? '<li><span>Birthplace</span>Chandigarh, India</li>' : '<li><span>Hometown</span>Chandigarh (raised)</li>',
    bornFact: p.connection === 'born' ? `<time datetime="${p.born}">${bornText(p)}</time>, Chandigarh` : `<time datetime="${p.born}">${bornText(p)}</time>`,
    pantheonItem: p.pantheon ? `<li><a class="link-underline" href="${p.pantheon}" target="_blank" rel="noopener noreferrer">Pantheon</a></li>` : '',
    diedChip: p.died ? chip('Died', longDate(p.died), p.died) : '',
    diedFact: p.died ? `<div><dt>Died</dt><dd><time datetime="${p.died}">${longDate(p.died)}</time></dd></div>` : '',
    knownForList: p.knownFor.map(escapeHtml).join(' · '),
    noteHtml: p.note ? `<p class="notice person-note" role="note">${escapeHtml(p.note)}</p>` : '',
    statsHtml: p.stats
      .map((s) => `<li class="stat" data-reveal-item><strong class="stat__value">${escapeHtml(s.value)}</strong><span class="stat__label">${escapeHtml(s.label)}</span></li>`)
      .join(''),
    storyHtml: p.story.map((s) => `<h2>${escapeHtml(s.h)}</h2><p>${escapeHtml(s.p)}</p>`).join('\n'),
    timelineHtml: p.timeline
      .map(([y, t]) => `<li class="timeline__item" data-reveal-item><span class="timeline__year">${escapeHtml(y)}</span><span class="timeline__text">${escapeHtml(t)}</span></li>`)
      .join(''),
    honoursHtml: p.honours.length
      ? `<section class="person-honours" aria-labelledby="honours-title"><h2 class="section-title section-title--sm" id="honours-title" data-split>Honours</h2><ul class="honours" data-reveal-group>${p.honours
          .map((h) => `<li class="honour" data-reveal-item><svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><circle cx="12" cy="9" r="6" fill="var(--c-lime)" stroke="currentColor" stroke-width="1.5"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg><span>${escapeHtml(h)}</span></li>`)
          .join('')}</ul></section>`
      : '',
    faqHtml: faq.map(([q, a]) => `<details class="faq__item"><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join(''),
    wikiUrl: p.wiki,
    wikidata: p.wikidata,
    pantheonUrl: p.pantheon,
    reviewedIso: PEOPLE_REVIEWED,
    reviewedLabel: formatDate(PEOPLE_REVIEWED),
    relatedHtml: related.map((r) => renderPersonCard(r, root, fieldLabel(r))).join(''),
    prevSlug: prev.slug,
    prevName: escapeHtml(prev.name),
    nextSlug: next.slug,
    nextName: escapeHtml(next.name),
    arrow: arrowIcon,
  };
}

/** ItemList schema for the listing page. */
export function peopleListJsonLd(siteUrl) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Famous people born in Chandigarh',
    itemListElement: byBirth.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, url: `${siteUrl}/people/${p.slug}/` })),
  });
}
