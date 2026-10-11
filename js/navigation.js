import { getLenis } from './animations.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Past this many pixels the header docks to the top and shows its backdrop.
const SCROLL_THRESHOLD = 80;

/** 'dark' | 'light' for the first opaque background at or above `el`. */
function themeOf(el) {
  for (; el && el !== document.documentElement; el = el.parentElement) {
    if (el.dataset.headerTheme) return el.dataset.headerTheme;
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (m && (m[3] === undefined || Number(m[3]) > 0.5)) {
      const [r, g, b] = m.map(Number);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140 ? 'dark' : 'light';
    }
  }
  return 'light';
}

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  let ticking = false;
  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    // Sample what sits under the middle of the header bar.
    const y = header.getBoundingClientRect().bottom / 2;
    const below = document.elementsFromPoint(window.innerWidth / 2, y).find((el) => !header.contains(el));
    const theme = themeOf(below);
    header.classList.toggle('theme-dark', theme === 'dark');
    header.classList.toggle('theme-light', theme !== 'dark');
    ticking = false;
  };
  const queue = () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  update();
}

/** A pill that slides between primary nav links on hover. */
function initNavIndicator() {
  const nav = document.querySelector('[data-nav]');
  const indicator = nav?.querySelector('[data-nav-indicator]');
  if (!indicator) return;
  const links = [...nav.querySelectorAll('.nav__link')];
  let current = null;

  const moveTo = (link) => {
    const n = nav.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    // Appearing from hidden: jump into place, then fade and scale in.
    indicator.classList.toggle('is-jump', !current);
    indicator.style.setProperty('--ind-x', `${r.left - n.left}px`);
    indicator.style.setProperty('--ind-y', `${r.top - n.top}px`);
    indicator.style.setProperty('--ind-w', `${r.width}px`);
    indicator.style.setProperty('--ind-h', `${r.height}px`);
    current?.classList.remove('is-hovered');
    link.classList.add('is-hovered');
    current = link;
    requestAnimationFrame(() => indicator.classList.add('is-visible'));
  };
  const hide = () => {
    indicator.classList.remove('is-visible');
    current?.classList.remove('is-hovered');
    current = null;
  };

  nav.classList.add('has-indicator');
  links.forEach((link) => link.addEventListener('mouseenter', () => moveTo(link)));
  nav.querySelector('.nav__list').addEventListener('mouseleave', hide);
  // Leaving onto the Info pill should also hide it.
  nav.querySelector('.nav__pill')?.addEventListener('mouseenter', hide);
}

function initMobileMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;
  const closeBtn = menu.querySelector('[data-menu-close]');
  const label = toggle.querySelector('.menu-toggle__label');
  const background = [document.querySelector('main'), document.querySelector('.site-footer'), document.querySelector('[data-header]')];

  const open = () => {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Close';
    document.documentElement.classList.add('menu-open');
    background.forEach((el) => el && (el.inert = true));
    getLenis()?.stop();
    const { gsap } = window;
    if (gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.6, ease: 'expo.out' });
      gsap.from(menu.querySelectorAll('.mobile-menu__nav li'), { yPercent: 60, autoAlpha: 0, stagger: 0.04, duration: 0.6, ease: 'expo.out', delay: 0.1 });
    }
    closeBtn?.focus();
  };

  const close = ({ returnFocus = true } = {}) => {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Menu';
    document.documentElement.classList.remove('menu-open');
    background.forEach((el) => el && (el.inert = false));
    getLenis()?.start();
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
  closeBtn?.addEventListener('click', () => close());
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close({ returnFocus: false }); });
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const items = [...menu.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width: 1200px)').addEventListener('change', (e) => { if (e.matches) close({ returnFocus: false }); });
}

/** Same-page anchors: smooth via Lenis when active, keep history + focus correct. */
function initAnchors() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(link.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    const lenis = getLenis();
    if (!lenis) return; // native smooth scroll + scroll-margin handle it
    e.preventDefault();
    const offset = -(document.querySelector('[data-header]')?.offsetHeight ?? 0) - 16;
    lenis.scrollTo(target, { offset, duration: 1.2 });
    history.pushState(null, '', url.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  // Skip link should move focus to <main> even with smooth scrolling.
  document.querySelector('.skip-link')?.addEventListener('click', (e) => {
    const main = document.getElementById('main');
    if (!main) return;
    e.preventDefault();
    main.focus();
    getLenis()?.scrollTo(main, { immediate: true });
  });
}

export function initNavigation() {
  initHeader();
  initNavIndicator();
  initMobileMenu();
  initAnchors();
}
