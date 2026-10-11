/**
 * Cityfluence — entry point.
 * Each module is independent and guarded, so a failure in one never blocks the rest.
 */
import { initMotion } from './animations.js';
import { initNavigation } from './navigation.js';
import { initCreators } from './creators.js';
import { initFilters } from './filters.js';
import { initForms } from './forms.js';

function initCopyLinks() {
  document.querySelectorAll('[data-copy-link]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copyLink);
        const original = btn.textContent;
        btn.textContent = 'Link copied';
        setTimeout(() => (btn.textContent = original), 2000);
      } catch {
        window.prompt('Copy this link:', btn.dataset.copyLink);
      }
    });
  });
}

const run = (name, fn) => {
  try {
    fn();
  } catch (err) {
    console.error(`[cityfluence] ${name} failed`, err);
  }
};

run('navigation', initNavigation);
run('creators', initCreators);
run('filters', initFilters);
run('forms', initForms);
run('copy-links', initCopyLinks);
run('motion', initMotion);
