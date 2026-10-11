/**
 * Pure string renderers shared by the Node build (static, crawlable HTML)
 * and the browser (dynamic updates). No DOM access in this file.
 */

export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const formatCount = (n) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  if (n >= 1e6) return `${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(n);
};

export const STATUS_LABELS = {
  demo: 'Demo profile',
  unverified: 'Unverified',
  'editorial-verified': 'Verified by editorial team',
  'api-verified': 'Metrics via official API',
};

const arrow = '<svg class="icon-arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
export const arrowIcon = arrow;

/** Metric markup — shows a value only when legitimately available. */
export const renderMetric = (label, value, key) => `
      <div class="creator-card__stat" data-metric="${key}">
        <dt>${label}</dt>
        <dd>${value == null ? '<span class="is-muted" title="Not available from a verified source">—</span>' : escapeHtml(value)}</dd>
      </div>`;

export function renderCreatorCard(c, root = '', { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  const followers = formatCount(c.followerCount);
  const engagement = typeof c.engagementRate === 'number' ? `${c.engagementRate.toFixed(1)}%` : null;
  const handle = c.username ? `@${escapeHtml(c.username)}` : 'Handle not yet verified';
  const statusLabel = STATUS_LABELS[c.verificationStatus] ?? 'Unverified';
  const profileLink = c.profileUrl
    ? `<a class="link-underline" href="${escapeHtml(c.profileUrl)}" target="_blank" rel="noopener noreferrer">View ${escapeHtml(c.platform)}<span class="visually-hidden"> profile of ${escapeHtml(c.name)} (opens in a new tab)</span></a>`
    : '';
  const updated = c.lastUpdated ? `Metrics updated ${formatDate(c.lastUpdated)}` : 'No verified metrics yet';

  return `
<article class="creator-card${c.demo ? ' is-demo' : ''}" data-creator-id="${escapeHtml(c.id)}" data-reveal-item>
  <div class="creator-card__media">
    <img src="${root}${escapeHtml(c.profileImage)}" alt="${c.demo ? 'Placeholder portrait illustration' : `Portrait of ${escapeHtml(c.name)}`}" width="480" height="600" loading="lazy" decoding="async">
    <span class="tag tag--${c.demo ? 'demo' : 'status'}">${escapeHtml(statusLabel)}</span>
    ${c.collaborationAvailable ? '<span class="tag tag--open">Open to collabs</span>' : ''}
  </div>
  <div class="creator-card__body">
    <p class="creator-card__niche">${escapeHtml(c.niche)}</p>
    <${h} class="creator-card__name">${escapeHtml(c.name)}</${h}>
    <p class="creator-card__handle">${handle}</p>
    <dl class="creator-card__stats">
      ${renderMetric('Platform', c.platform, 'platform')}
      ${renderMetric('Based in', c.location, 'location')}
      ${renderMetric('Followers', followers, 'followers')}
      ${renderMetric('Engagement', engagement, 'engagement')}
    </dl>
    <p class="creator-card__updated" data-metric="updated">${escapeHtml(updated)}</p>
    <div class="creator-card__actions">
      <a class="link-underline" href="${root}creators/?profile=${encodeURIComponent(c.id)}" data-open-profile="${escapeHtml(c.id)}">View profile<span class="visually-hidden">: ${escapeHtml(c.name)}</span></a>
      ${profileLink}
      <a class="btn btn--small btn--ink" href="${root}contact/?type=business&amp;creator=${encodeURIComponent(c.id)}">Collaborate${arrow}</a>
    </div>
  </div>
</article>`;
}

export function renderCreatorProfile(c, root = '') {
  const list = (items) => (items?.length ? `<ul class="chip-list">${items.map((i) => `<li class="chip">${escapeHtml(i)}</li>`).join('')}</ul>` : '<p class="is-muted">Not provided yet.</p>');
  const followers = formatCount(c.followerCount);
  return `
<div class="profile">
  <div class="profile__media">
    <img src="${root}${escapeHtml(c.profileImage)}" alt="${c.demo ? 'Placeholder portrait illustration' : `Portrait of ${escapeHtml(c.name)}`}" width="480" height="600">
  </div>
  <div class="profile__body">
    ${c.demo ? '<p class="notice notice--demo">Demonstration profile — not a real creator. Shown for layout and testing only.</p>' : ''}
    <p class="eyebrow">${escapeHtml(c.niche)} · ${escapeHtml(c.location)}</p>
    <h2 class="profile__name" id="profile-title">${escapeHtml(c.name)}</h2>
    <p class="profile__handle">${c.username ? `@${escapeHtml(c.username)} on ${escapeHtml(c.platform)}` : 'Social handle not yet verified'}</p>
    <p class="profile__bio">${escapeHtml(c.bio)}</p>
    <div class="profile__grid">
      <section><h3>Niches</h3>${list(c.niches)}</section>
      <section><h3>Platforms</h3>${list(c.platforms)}</section>
      <section><h3>Content</h3>${list(c.contentTypes)}</section>
      <section><h3>Languages</h3>${list(c.languages)}</section>
      <section><h3>Services</h3>${list(c.services)}</section>
      <section><h3>Audience</h3>
        <p>${followers ? `${escapeHtml(followers)} followers` : '<span class="is-muted">Follower count not verified</span>'}</p>
        <p class="is-muted small">Source: ${escapeHtml(c.source ?? '—')}${c.lastUpdated ? ` · Updated ${formatDate(c.lastUpdated)}` : ''}</p>
      </section>
    </div>
    <section class="profile__prefs"><h3>Collaboration preferences</h3><p>${escapeHtml(c.collaborationPreferences ?? 'Not provided yet.')}</p></section>
    <section class="profile__portfolio"><h3>Portfolio</h3>${
      c.portfolio?.length
        ? `<ul class="portfolio-list">${c.portfolio.map((p) => `<li><a class="link-underline" href="${escapeHtml(p.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.title)}</a></li>`).join('')}</ul>`
        : '<p class="is-muted">Portfolio items will appear once shared and approved by the creator.</p>'
    }</section>
    <div class="profile__actions">
      <a class="btn btn--lime" href="${root}contact/?type=business&amp;creator=${encodeURIComponent(c.id)}">Collaborate${arrow}</a>
      ${c.profileUrl ? `<a class="btn btn--ghost" href="${escapeHtml(c.profileUrl)}" target="_blank" rel="noopener noreferrer">View ${escapeHtml(c.platform)}</a>` : ''}
    </div>
  </div>
</div>`;
}

export function renderArticleCard(a, root = '', { variant = 'default', headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `
<article class="story-card story-card--${variant}" data-category="${escapeHtml(a.category)}" data-reveal-item>
  <a class="story-card__link" href="${root}stories/${a.slug}/">
    <div class="story-card__media">
      <img src="${root}${escapeHtml(a.image)}" alt="${escapeHtml(a.imageAlt)}" width="1200" height="800" loading="lazy" decoding="async">
    </div>
    <div class="story-card__body">
      <p class="story-card__meta"><span class="story-card__cat">${escapeHtml(a.category)}</span>${a.sponsored ? '<span class="tag tag--sponsored">Sponsored</span>' : ''}</p>
      <${h} class="story-card__title">${escapeHtml(a.title)}</${h}>
      <p class="story-card__excerpt">${escapeHtml(a.excerpt)}</p>
      <p class="story-card__info"><time datetime="${a.published}">${formatDate(a.published)}</time><span aria-hidden="true">·</span><span>${a.readingTime} min read</span></p>
    </div>
  </a>
</article>`;
}

export function renderPersonCard(p, root = '', fieldLabel = '', { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  const years = p.died ? `${p.born.slice(0, 4)}–${p.died.slice(0, 4)}` : `Born ${p.bornLabel ?? p.born.slice(0, 4)}`;
  return `
<article class="person-card" data-field="${escapeHtml(p.field)}" data-reveal-item>
  <a class="person-card__link" href="${root}people/${p.slug}/">
    <div class="person-card__media">
      <img src="${root}assets/images/people/${p.slug}.svg" alt="Typographic poster for ${escapeHtml(p.name)}" width="800" height="1000" loading="lazy" decoding="async">
    </div>
    <div class="person-card__body">
      <p class="person-card__field">${escapeHtml(fieldLabel)} · ${years}</p>
      <${h} class="person-card__name">${escapeHtml(p.name)}</${h}>
      <p class="person-card__role">${escapeHtml(p.role)}</p>
    </div>
  </a>
</article>`;
}
