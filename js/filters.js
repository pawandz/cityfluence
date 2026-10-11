import { getCreators } from './creators.js';
import { refreshTriggers } from './animations.js';

const norm = (s) => (s ?? '').toString().toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

const debounce = (fn, ms = 150) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/** Show every reveal-animated item that might still be hidden by GSAP. */
const showItems = (els) => els.forEach((el) => { el.style.opacity = ''; el.style.visibility = ''; el.style.transform = ''; });

// ─── Creator directory ─────────────────────────────
function initCreatorFilters() {
  const form = document.querySelector('[data-filters]');
  const grid = document.querySelector('[data-directory]');
  if (!form || !grid) return;
  const countEl = form.querySelector('[data-results-count]');
  const empty = document.querySelector('[data-empty-state]');
  const cards = [...grid.querySelectorAll('[data-creator-id]')];
  const originalOrder = cards.slice();

  // Restore state from URL (?niche=…&platform=…&location=A,B&q=…)
  const params = new URLSearchParams(location.search);
  ['q', 'niche', 'platform', 'content', 'sort'].forEach((k) => {
    if (params.has(k) && form.elements[k]) form.elements[k].value = params.get(k);
  });
  const locs = (params.get('location') ?? '').split(',').filter(Boolean);
  form.querySelectorAll('input[name="location"]').forEach((cb) => (cb.checked = locs.includes(cb.value)));
  if (params.get('open') === '1') form.elements.open.checked = true;

  const apply = () => {
    const q = norm(form.elements.q.value.trim());
    const niche = form.elements.niche.value;
    const platform = form.elements.platform.value;
    const content = form.elements.content.value;
    const sort = form.elements.sort.value;
    const locations = [...form.querySelectorAll('input[name="location"]:checked')].map((i) => i.value);
    const openOnly = form.elements.open.checked;
    const data = getCreators();

    const visible = [];
    cards.forEach((card) => {
      const c = data.find((x) => x.id === card.dataset.creatorId);
      const match =
        c &&
        (!q || norm(c.name).includes(q) || norm(c.username).includes(q.replace(/^@/, ''))) &&
        (!niche || c.niche === niche || c.niches?.includes(niche)) &&
        (!platform || c.platform === platform || c.platforms?.includes(platform)) &&
        (!content || c.contentTypes?.includes(content)) &&
        (!locations.length || locations.includes(c.location)) &&
        (!openOnly || c.collaborationAvailable);
      card.classList.toggle('is-hidden', !match);
      if (match) visible.push({ card, c });
    });

    const ordered =
      sort === 'az' || sort === 'za'
        ? visible.sort((a, b) => a.c.name.localeCompare(b.c.name) * (sort === 'za' ? -1 : 1)).map((v) => v.card)
        : originalOrder.filter((card) => !card.classList.contains('is-hidden'));
    ordered.forEach((card) => grid.append(card));
    originalOrder.filter((card) => card.classList.contains('is-hidden')).forEach((card) => grid.append(card));
    showItems(ordered);

    const n = visible.length;
    countEl.textContent = `${n} profile${n === 1 ? '' : 's'}`;
    empty.hidden = n > 0;

    // Keep URL shareable without adding history entries.
    const url = new URL(location.href);
    const setParam = (k, v) => (v ? url.searchParams.set(k, v) : url.searchParams.delete(k));
    setParam('q', form.elements.q.value.trim());
    setParam('niche', niche);
    setParam('platform', platform);
    setParam('content', content);
    setParam('sort', sort === 'featured' ? '' : sort);
    setParam('location', locations.join(','));
    setParam('open', openOnly ? '1' : '');
    history.replaceState(null, '', url);
    refreshTriggers();
  };

  form.addEventListener('input', debounce(apply));
  form.addEventListener('change', apply);
  form.addEventListener('reset', () => setTimeout(apply));
  document.querySelectorAll('[data-clear-filters]').forEach((btn) => {
    if (btn.type !== 'reset') btn.addEventListener('click', () => { form.reset(); form.elements.q.focus(); });
  });
  apply();
}

// ─── Stories archive ───────────────────────────────
function initStoryFilters() {
  const grid = document.querySelector('[data-story-grid]');
  const chipsWrap = document.querySelector('[data-story-filters]');
  if (!grid || !chipsWrap) return;
  const search = document.querySelector('[data-story-search]');
  const countEl = document.querySelector('[data-story-count]');
  const empty = document.querySelector('[data-story-empty]');
  const cards = [...grid.querySelectorAll('.story-card')];
  const chips = [...chipsWrap.querySelectorAll('[data-filter-category]')];
  let category = new URLSearchParams(location.search).get('category') ?? '';
  if (!chips.some((c) => c.dataset.filterCategory === category)) category = '';

  const apply = () => {
    const q = norm(search?.value.trim());
    let n = 0;
    cards.forEach((card) => {
      const match = (!category || card.dataset.category === category) && (!q || norm(card.textContent).includes(q));
      card.classList.toggle('is-hidden', !match);
      if (match) n += 1;
    });
    showItems(cards.filter((c) => !c.classList.contains('is-hidden')));
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filterCategory === category)));
    countEl.textContent = category || q ? `${n} stor${n === 1 ? 'y' : 'ies'} found` : '';
    empty.hidden = n > 0;
    const url = new URL(location.href);
    category ? url.searchParams.set('category', category) : url.searchParams.delete('category');
    history.replaceState(null, '', url);
    refreshTriggers();
  };

  chips.forEach((chip) => chip.addEventListener('click', () => { category = chip.dataset.filterCategory; apply(); }));
  search?.addEventListener('input', debounce(apply));
  apply();
}

// ─── Famous people ─────────────────────────────────
function initPeopleFilters() {
  const grid = document.querySelector('[data-people-grid]');
  const wrap = document.querySelector('[data-people-filters]');
  if (!grid || !wrap) return;
  const countEl = document.querySelector('[data-people-count]');
  const cards = [...document.querySelectorAll('[data-people-grid] .person-card')];
  const chips = [...wrap.querySelectorAll('[data-filter-field]')];
  let field = new URLSearchParams(location.search).get('field') ?? '';
  if (!chips.some((c) => c.dataset.filterField === field)) field = '';

  const apply = () => {
    let n = 0;
    cards.forEach((card) => {
      const match = !field || card.dataset.field === field;
      card.classList.toggle('is-hidden', !match);
      if (match) n += 1;
    });
    showItems(cards.filter((c) => !c.classList.contains('is-hidden')));
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filterField === field)));
    countEl.textContent = field ? `${n} ${n === 1 ? 'person' : 'people'}` : '';
    const url = new URL(location.href);
    field ? url.searchParams.set('field', field) : url.searchParams.delete('field');
    history.replaceState(null, '', url);
    refreshTriggers();
  };

  chips.forEach((chip) => chip.addEventListener('click', () => { field = chip.dataset.filterField; apply(); }));
  apply();
}

export function initFilters() {
  initCreatorFilters();
  initStoryFilters();
  initPeopleFilters();
}
