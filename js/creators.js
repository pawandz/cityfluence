import { siteConfig } from './config.js';
import { creators } from './data/creators.js';
import { renderCreatorProfile, formatCount, formatDate, STATUS_LABELS } from './components/render.js';
import { fetchCreatorMetrics, mergeMetrics } from './services/creator-data.js';
import { getLenis } from './animations.js';

const root = document.documentElement.dataset.root || './';
let data = creators;
export const getCreators = () => data;

// ─── Profile dialog ────────────────────────────────
let dialog;
let lastTrigger = null;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'profile-dialog';
  dialog.setAttribute('aria-labelledby', 'profile-title');
  dialog.innerHTML = '<button class="profile-dialog__close" type="button" data-dialog-close>Close<span class="visually-hidden"> profile</span></button><div data-dialog-body></div>';
  dialog.setAttribute('data-lenis-prevent', '');
  document.body.append(dialog);
  dialog.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    getLenis()?.start();
    const url = new URL(location.href);
    if (url.searchParams.has('profile')) {
      url.searchParams.delete('profile');
      history.replaceState(null, '', url);
    }
    lastTrigger?.focus();
  });
  return dialog;
}

function openProfile(id, trigger) {
  const creator = data.find((c) => c.id === id);
  if (!creator || typeof HTMLDialogElement === 'undefined') return false;
  const dlg = ensureDialog();
  dlg.querySelector('[data-dialog-body]').innerHTML = renderCreatorProfile(creator, root);
  lastTrigger = trigger ?? null;
  dlg.showModal();
  dlg.scrollTop = 0;
  getLenis()?.stop();
  const url = new URL(location.href);
  if (document.querySelector('[data-directory]')) {
    url.searchParams.set('profile', id);
    history.replaceState(null, '', url);
  }
  return true;
}

function initProfileLinks() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-open-profile]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (openProfile(link.dataset.openProfile, link)) e.preventDefault();
  });
  const initial = new URLSearchParams(location.search).get('profile');
  if (initial) openProfile(initial);
}

// ─── Metrics hydration (only when an endpoint is configured) ──
function updateCardMetrics(card, c) {
  const set = (key, value) => {
    const dd = card.querySelector(`[data-metric="${key}"] dd`);
    if (dd) dd.textContent = value ?? '—';
  };
  set('followers', formatCount(c.followerCount));
  set('engagement', typeof c.engagementRate === 'number' ? `${c.engagementRate.toFixed(1)}%` : null);
  const updated = card.querySelector('[data-metric="updated"]');
  if (updated) updated.textContent = c.lastUpdated ? `Metrics updated ${formatDate(c.lastUpdated)}` : 'No verified metrics yet';
  const tag = card.querySelector('.tag--status, .tag--demo');
  if (tag && c.verificationStatus === 'api-verified') tag.textContent = STATUS_LABELS['api-verified'];
}

async function hydrateMetrics() {
  const endpoint = siteConfig.creatorsApiEndpoint;
  const cards = document.querySelectorAll('[data-creator-id]');
  const status = document.querySelectorAll('[data-creator-status]');
  if (!endpoint || !cards.length) return;
  const say = (msg) => status.forEach((s) => (s.textContent = msg));

  // Only real, verified usernames can be looked up.
  if (!data.some((c) => c.username && !c.demo)) return;

  cards.forEach((c) => c.classList.add('is-loading'));
  say('Loading verified metrics…');
  try {
    const metrics = await fetchCreatorMetrics(endpoint, { timeoutMs: siteConfig.creatorsApiTimeoutMs });
    data = mergeMetrics(data, metrics);
    cards.forEach((card) => {
      const c = data.find((x) => x.id === card.dataset.creatorId);
      if (c) updateCardMetrics(card, c);
    });
    say('');
  } catch (err) {
    say(
      err.code === 'rate_limited'
        ? 'Live metrics are busy right now. Profiles are shown without statistics — please check back shortly.'
        : 'Live metrics are temporarily unavailable. Profiles are shown without unverified statistics.',
    );
  } finally {
    cards.forEach((c) => c.classList.remove('is-loading'));
  }
}

export function initCreators() {
  initProfileLinks();
  hydrateMetrics();
}
