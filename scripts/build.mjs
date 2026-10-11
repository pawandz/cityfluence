/**
 * Static HTML build for Cityfluence.
 *
 *   src/partials/*.html   shared head, header, footer, scripts
 *   src/pages/*.html      one file per page, with a <!--meta {...}--> header
 *   src/templates/article.html  rendered once per entry in js/data/articles.js
 *
 * Output is plain HTML committed to the repo root (GitHub Pages serves it as is).
 * All internal URLs are relative ({{root}}), so the same build works on a custom
 * domain and on https://<user>.github.io/<repo>/. Only 404.html uses basePath.
 *
 * Tokens:
 *   {{root}}  {{> partial}}  {{title}} {{description}} {{canonical}} ...
 *   {{current:<page>}}   aria-current on the active nav link
 *   {{render:<name>}}    output of a renderer below
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { siteConfig } from '../js/config.js';
import { creators, featuredCreators, NICHES, PLATFORMS, LOCATIONS, CONTENT_TYPES } from '../js/data/creators.js';
import { articles, sortedArticles, CATEGORIES } from '../js/data/articles.js';
import { renderCreatorCard, renderArticleCard, escapeHtml, formatDate, arrowIcon } from '../js/components/render.js';
import { PEOPLE_REVIEWED } from '../js/data/people.js';
import { people, peopleRenderers, personContext, peopleListJsonLd } from './people-pages.mjs';
import { writePeopleArt } from './people-art.mjs';

writePeopleArt(people);

const SRC = 'src';
const read = (p) => readFileSync(p, 'utf8');
const partials = Object.fromEntries(
  readdirSync(join(SRC, 'partials')).map((f) => [f.replace(/\.html$/, ''), read(join(SRC, 'partials', f))]),
);

const rootFor = (route) => {
  if (route === '404') return siteConfig.basePath;
  const depth = route.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
};
const outFileFor = (route) => (route === '404' ? '404.html' : join(route.replace(/^\//, ''), 'index.html'));
const canonicalFor = (route) => `${siteConfig.siteUrl}${route === '404' ? '/404.html' : route}`;

const sentence = (n) => (n === 1 ? '' : 's');
const options = (list) => list.map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join('');

function socialLinks(cls = 'footer__social') {
  const items = [
    ['Instagram', siteConfig.social.instagram],
    ['YouTube', siteConfig.social.youtube],
  ];
  return `<ul class="${cls}">${items
    .map(([label, href]) =>
      href
        ? `<li><a class="link-underline" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a></li>`
        : `<li><span class="is-muted">${label} — launching soon</span></li>`,
    )
    .join('')}</ul>`;
}

const { emails = [], phones = [] } = siteConfig.contact ?? {};
const telHref = (n) => `tel:+91${n.replace(/\D/g, '').slice(-10)}`;
const phoneLabel = (n) => {
  const d = n.replace(/\D/g, '').slice(-10);
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
};
const contactList = (items, href, label, empty) =>
  items.length
    ? `<ul class="contact-list">${items.map((v) => `<li><a class="link-underline" href="${href(v)}">${escapeHtml(label(v))}</a></li>`).join('')}</ul>`
    : `<p class="is-muted">${empty}</p>`;

function priceLabel(key) {
  const from = siteConfig.packages[key]?.from;
  return typeof from === 'number' ? `From ₹${from.toLocaleString('en-IN')}` : 'Custom quote';
}

const renderers = (root) => ({
  'creators-featured': () => featuredCreators().map((c) => renderCreatorCard(c, root)).join(''),
  'creators-all': () =>
    [...creators]
      .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99))
      .map((c) => renderCreatorCard(c, root))
      .join(''),
  'creators-count': () => `${creators.length} profile${sentence(creators.length)}`,
  'niche-options': () => options(NICHES),
  'platform-options': () => options(PLATFORMS),
  'content-options': () => options(CONTENT_TYPES),
  'location-chips': () =>
    LOCATIONS.map(
      (l) => `<label class="chip-toggle"><input type="checkbox" name="location" value="${l}"><span>${l}</span></label>`,
    ).join(''),
  'articles-latest': () => sortedArticles().slice(0, 3).map((a) => renderArticleCard(a, root)).join(''),
  'articles-all': () => sortedArticles().map((a) => renderArticleCard(a, root)).join(''),
  'article-featured': () => {
    const a = sortedArticles().find((x) => x.featured) ?? sortedArticles()[0];
    return renderArticleCard(a, root, { variant: 'feature', headingLevel: 2 });
  },
  'article-city-feature': () => renderArticleCard(articles.find((a) => a.slug === 'a-different-side-of-the-city-beautiful'), root, { variant: 'feature' }),
  'article-city-supporting': () =>
    articles
      .filter((a) => ['reading-the-sector-grid', 'tricity-explained'].includes(a.slug))
      .map((a) => renderArticleCard(a, root, { variant: 'compact' }))
      .join(''),
  'category-chips': () =>
    ['All', ...CATEGORIES]
      .map(
        (c, i) =>
          `<button type="button" class="chip-filter" data-filter-category="${c === 'All' ? '' : escapeHtml(c)}" aria-pressed="${i === 0}">${escapeHtml(c)}</button>`,
      )
      .join(''),
  'social-links': () => socialLinks(),
  'social-cta': () =>
    siteConfig.social.instagram
      ? `<a class="btn btn--ink" href="${escapeHtml(siteConfig.social.instagram)}" target="_blank" rel="noopener noreferrer">Follow the city${arrowIcon}</a>`
      : `<p class="btn btn--ink is-disabled" aria-disabled="true">Follow the city · Handles launching soon</p>`,
  'contact-emails': () => contactList(emails, (e) => `mailto:${escapeHtml(e)}`, (e) => e, 'Email coming soon.'),
  'contact-emails-inline': () => emails.map((e) => `<a href="mailto:${escapeHtml(e)}">${escapeHtml(e)}</a>`).join(' or '),
  'contact-phones': () => contactList(phones, telHref, phoneLabel, 'Phone coming soon.'),
  'contact-cards': () =>
    [
      ...phones.map((p) => ['Call', phoneLabel(p), telHref(p)]),
      ...emails.map((e) => ['Email', e, `mailto:${escapeHtml(e)}`]),
    ]
      .map(
        ([kind, label, href]) =>
          `<li><a class="contact-tile" href="${href}"><span class="contact-tile__kind">${kind}</span><span class="contact-tile__value">${escapeHtml(label)}</span>${arrowIcon}</a></li>`,
      )
      .join(''),
  'price-starter': () => priceLabel('starter'),
  'price-growth': () => priceLabel('growth'),
  'price-signature': () => priceLabel('signature'),
  'preview-banner': () =>
    siteConfig.previewBuild
      ? `<p class="preview-flag" role="note">Preview build · Demo content is labelled and will be replaced before launch.</p>`
      : '',
  year: () => String(new Date().getFullYear()),
  ...peopleRenderers(root),
});

function fill(template, ctx) {
  let html = template;
  // Partials may themselves contain tokens, so expand them first (two levels).
  for (let i = 0; i < 2; i++) html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) => partials[name] ?? '');
  const r = renderers(ctx.root);
  html = html.replace(/\{\{current:([\w-]+)\}\}/g, (_, page) => (page === ctx.page ? 'aria-current="page"' : ''));
  html = html.replace(/\{\{render:([\w-]+)\}\}/g, (_, name) => {
    if (!r[name]) throw new Error(`Unknown renderer: ${name}`);
    return r[name]();
  });
  html = html.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in ctx ? ctx[key] : m));
  const leftover = html.match(/\{\{[^}]*\}\}/);
  if (leftover) throw new Error(`Unresolved token ${leftover[0]} in ${ctx.route}`);
  return html;
}

function write(file, html) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html.replace(/\n{3,}/g, '\n\n'));
  console.log(`  ✓ ${file}`);
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  slogan: siteConfig.tagline,
  areaServed: ['Chandigarh', 'Mohali', 'Panchkula'].map((name) => ({ '@type': 'City', name })),
  ...(Object.values(siteConfig.social).some(Boolean) ? { sameAs: Object.values(siteConfig.social).filter(Boolean) } : {}),
  ...(emails[0] ? { email: emails[0] } : {}),
  ...(phones[0] ? { telephone: phoneLabel(phones[0]) } : {}),
  ...(emails.length || phones.length
    ? {
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          areaServed: 'IN',
          ...(emails.length ? { email: emails[0] } : {}),
          ...(phones.length ? { telephone: phoneLabel(phones[0]) } : {}),
        },
      }
    : {}),
};

const jsonLdTag = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

function baseCtx(meta) {
  const root = rootFor(meta.route);
  return {
    ...meta,
    root,
    canonical: canonicalFor(meta.route),
    ogType: meta.ogType ?? 'website',
    robots: meta.route === '404' ? 'noindex' : 'index, follow',
    jsonld: meta.jsonld ?? '',
    siteName: siteConfig.name,
    extraHead: meta.extraHead ?? '',
    arrow: arrowIcon,
  };
}

console.log('Building pages…');
const sitemap = [];

for (const file of readdirSync(join(SRC, 'pages'))) {
  const raw = read(join(SRC, 'pages', file));
  const match = raw.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!match) throw new Error(`${file} is missing its <!--meta {...}--> header`);
  const meta = JSON.parse(match[1]);
  const body = raw.slice(match[0].length);
  const ctx = baseCtx(meta);
  if (meta.route === '/') ctx.jsonld = jsonLdTag(orgJsonLd) + jsonLdTag({ '@context': 'https://schema.org', '@type': 'WebSite', name: siteConfig.name, url: siteConfig.siteUrl });
  if (meta.route === '/people/') ctx.jsonld += peopleListJsonLd(siteConfig.siteUrl);
  if (meta.breadcrumb) {
    ctx.jsonld += jsonLdTag({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: meta.breadcrumb, item: canonicalFor(meta.route) },
      ],
    });
  }
  const html = fill(`${partials.head}${partials.header}<main id="main" tabindex="-1">${body}</main>${partials.footer}${partials.scripts}`, ctx);
  write(outFileFor(meta.route), html);
  if (meta.route !== '404' && meta.sitemap !== false) sitemap.push({ loc: canonicalFor(meta.route), priority: meta.route === '/' ? '1.0' : '0.8' });
}

console.log('Building articles…');
const articleTpl = read(join(SRC, 'templates', 'article.html'));
const bodyBlock = (b) => {
  switch (b.type) {
    case 'h2': return `<h2>${escapeHtml(b.text)}</h2>`;
    case 'p': return `<p>${escapeHtml(b.text)}</p>`;
    case 'quote': return `<blockquote class="article__quote"><p>${escapeHtml(b.text)}</p></blockquote>`;
    case 'note': return `<aside class="article__note"><p>${escapeHtml(b.text)}</p></aside>`;
    case 'list': return `<ul>${b.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
    default: throw new Error(`Unknown block type ${b.type}`);
  }
};

for (const a of articles) {
  const route = `/stories/${a.slug}/`;
  const ctx = baseCtx({
    route,
    page: 'stories',
    title: `${a.title} | Cityfluence`,
    description: a.excerpt,
    ogType: 'article',
    bodyClass: 'page-article',
    extraHead: `<meta property="article:published_time" content="${a.published}"><meta property="article:modified_time" content="${a.updated}"><meta property="article:section" content="${escapeHtml(a.category)}">`,
  });
  ctx.jsonld =
    jsonLdTag({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.excerpt,
      datePublished: a.published,
      dateModified: a.updated,
      articleSection: a.category,
      author: { '@type': 'Organization', name: a.author },
      publisher: { '@type': 'Organization', name: siteConfig.name },
      mainEntityOfPage: canonicalFor(route),
    }) +
    jsonLdTag({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Stories', item: `${siteConfig.siteUrl}/stories/` },
        { '@type': 'ListItem', position: 3, name: a.title, item: canonicalFor(route) },
      ],
    });
  const related = articles.filter((x) => x.slug !== a.slug).sort((x, y) => (y.category === a.category) - (x.category === a.category)).slice(0, 3);
  const share = encodeURIComponent(canonicalFor(route));
  Object.assign(ctx, {
    articleTitle: escapeHtml(a.title),
    articleCategory: escapeHtml(a.category),
    articleIntro: escapeHtml(a.intro),
    articleAuthor: escapeHtml(a.author),
    articlePublishedIso: a.published,
    articlePublished: formatDate(a.published),
    articleUpdatedIso: a.updated,
    articleUpdated: formatDate(a.updated),
    articleReading: String(a.readingTime),
    articleImage: escapeHtml(a.image),
    articleImageAlt: escapeHtml(a.imageAlt),
    articleCaption: escapeHtml(a.caption ?? ''),
    articleBody: a.body.map(bodyBlock).join('\n'),
    sponsoredNotice: a.sponsored
      ? '<p class="notice notice--sponsored"><strong>Sponsored.</strong> This story was paid for by a partner. Cityfluence retains editorial control.</p>'
      : '',
    relatedCards: related.map((r) => renderArticleCard(r, ctx.root)).join(''),
    shareWhatsapp: `https://wa.me/?text=${encodeURIComponent(a.title + ' ')}${share}`,
    shareX: `https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${share}`,
    shareLinkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${share}`,
    canonicalUrl: canonicalFor(route),
  });
  const html = fill(`${partials.head}${partials.header}<main id="main" tabindex="-1">${articleTpl}</main>${partials.footer}${partials.scripts}`, ctx);
  write(outFileFor(route), html);
  sitemap.push({ loc: canonicalFor(route), lastmod: a.updated, priority: '0.6' });
}

console.log('Building people…');
const personTpl = read(join(SRC, 'templates', 'person.html'));
for (const p of people) {
  const route = `/people/${p.slug}/`;
  const ctx = baseCtx({
    route,
    page: 'people',
    title: `${p.name} — Born in Chandigarh | Biography, Timeline & Facts | Cityfluence`,
    description: p.summary,
    ogType: 'profile',
    bodyClass: 'page-person',
  });
  Object.assign(ctx, personContext(p, ctx.root, { canonical: canonicalFor(route), siteUrl: siteConfig.siteUrl, arrowIcon }));
  const html = fill(`${partials.head}${partials.header}<main id="main" tabindex="-1">${personTpl}</main>${partials.footer}${partials.scripts}`, ctx);
  write(outFileFor(route), html);
  sitemap.push({ loc: canonicalFor(route), lastmod: PEOPLE_REVIEWED, priority: '0.7' });
}

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>
`,
);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.siteUrl}/sitemap.xml\n`);
console.log('Done.');
