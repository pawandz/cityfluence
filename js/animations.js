/**
 * Motion system — GSAP + ScrollTrigger + Lenis.
 *
 * Progressive enhancement: all content is visible without JS. The only
 * pre-hidden elements are hero parts ([data-hero]), and an inline script in
 * <head> reveals them after 2.5s if this module never runs (see head.html).
 * Everything lives inside gsap.matchMedia(), so switching to
 * prefers-reduced-motion reverts every tween, trigger and the Lenis instance.
 */

let lenis = null;
export const getLenis = () => lenis;

const revealFallback = () => {
  clearTimeout(window.__cfReveal);
  document.documentElement.classList.add('motion-fallback');
};

/** Wrap each word in a mask so it can slide up. Keeps <br> and inline elements. */
function splitWords(el) {
  if (el.dataset.splitDone) return el.querySelectorAll('.split-word__inner');
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(' '));
          const outer = document.createElement('span');
          outer.className = 'split-word';
          outer.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.className = 'split-word__inner';
          inner.textContent = part;
          outer.append(inner);
          frag.append(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
        child.setAttribute('aria-hidden', 'true');
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.splitDone = 'true';
  return el.querySelectorAll('.split-word__inner');
}

function splitPlainWords(el) {
  if (el.dataset.scrubDone) return el.querySelectorAll('.word');
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words.map((w) => `<span class="word" aria-hidden="true">${w.replace(/</g, '&lt;')}</span>`).join(' ');
  el.dataset.scrubDone = 'true';
  return el.querySelectorAll('.word');
}

function heroTimeline(gsap) {
  const q = (sel) => document.querySelectorAll(sel);
  const hero = document.querySelector('[data-hero]')?.closest('section, article');
  const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.1 } });

  gsap.set('[data-hero], .site-header__inner > *', { autoAlpha: 1 });

  tl.from('.site-header .wordmark', { y: -16, autoAlpha: 0, duration: 0.8 }, 0)
    .from('.site-header .nav__list > li, .site-header__actions > *, .menu-toggle', { y: -12, autoAlpha: 0, stagger: 0.04, duration: 0.7 }, 0.08);

  if (!hero) return tl;

  const eyebrow = hero.querySelector('[data-hero="eyebrow"]');
  const lines = hero.querySelectorAll('[data-hero="title"] .line__inner');
  const title = hero.querySelector('[data-hero="title"]');
  if (eyebrow) tl.from(eyebrow, { y: 14, autoAlpha: 0, duration: 0.7 }, 0.15);
  if (lines.length) tl.from(lines, { yPercent: 110, stagger: 0.09, duration: 1.15 }, 0.22);
  else if (title) tl.from(title, { y: 30, autoAlpha: 0 }, 0.22);

  const frames = hero.querySelectorAll('.hero__frame, .page-hero__art, .article__hero');
  if (frames.length) {
    tl.from(frames, { clipPath: 'inset(100% 0% 0% 0%)', stagger: 0.1, duration: 1.3, ease: 'power4.inOut' }, 0.3);
    tl.from(hero.querySelectorAll('.hero__frame img, .page-hero__art img, .article__hero img'), { scale: 1.25, stagger: 0.1, duration: 1.8 }, 0.3);
  }
  tl.from(hero.querySelectorAll('.hero__media img'), { scale: 1.2, duration: 2.4, ease: 'expo.out' }, 0);
  tl.from(hero.querySelectorAll('[data-hero="lede"]'), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.6);
  tl.from(hero.querySelectorAll('[data-hero="ctas"] > *'), { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.8 }, 0.72);
  tl.from(hero.querySelectorAll('[data-hero="loc"], [data-hero="cue"]'), { autoAlpha: 0, duration: 0.8 }, 0.95);
  // Any remaining hero parts (breadcrumbs etc.) simply fade in.
  tl.from(q('.breadcrumbs'), { autoAlpha: 0, duration: 0.6 }, 0.1);
  return tl;
}

function scrollReveals(gsap, ScrollTrigger) {
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 105,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 28,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = group.querySelectorAll(':scope > [data-reveal-item], :scope > * > [data-reveal-item]');
    if (!items.length) return;
    gsap.set(items, { y: 40, autoAlpha: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
    });
  });

  document.querySelectorAll('[data-scrub-words]').forEach((el) => {
    const words = splitPlainWords(el);
    gsap.fromTo(
      words,
      { opacity: 0.16 },
      { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true } },
    );
  });
}

function heroScrollParallax(gsap) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  gsap.to(hero.querySelectorAll('.hero__media img'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__title', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  // Card band drifts sideways as it scrolls past (never more than its own overflow).
  document.querySelectorAll('[data-drift]').forEach((track) => {
    const section = track.parentElement;
    const distance = () => Math.max(0, track.scrollWidth - section.clientWidth);
    gsap.fromTo(track, { x: () => distance() * 0.1 }, { x: () => -distance() * 0.9, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
  });

  // Floating UI cards move at different speeds around the centred headline.
  gsap.utils.toArray('.control__float').forEach((card) => {
    const depth = parseFloat(card.dataset.depth || '1');
    gsap.fromTo(card, { y: 60 * depth }, { y: -60 * depth, ease: 'none', scrollTrigger: { trigger: card.closest('.control'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Editorial images drift slightly inside their frames.
  gsap.utils.toArray('.story-card--feature .story-card__media img, .city-bento__feature .story-card__media img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

function pointerParallax(gsap) {
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};
  const items = [...hero.querySelectorAll('[data-depth]')].map((el) => ({
    depth: parseFloat(el.dataset.depth),
    x: gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' }),
    y: gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' }),
  }));
  const onMove = (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    items.forEach((it) => { it.x(nx * 14 * it.depth); it.y(ny * 10 * it.depth); });
  };
  hero.addEventListener('pointermove', onMove);
  return () => hero.removeEventListener('pointermove', onMove);
}

export function initMotion() {
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger) {
    revealFallback();
    return;
  }
  clearTimeout(window.__cfReveal);
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 900px) and (pointer: fine)',
    },
    (ctx) => {
      const { motion, desktop } = ctx.conditions;
      if (!motion) {
        revealFallback();
        return undefined;
      }

      let raf = null;
      if (Lenis) {
        lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 1 });
        lenis.on('scroll', ScrollTrigger.update);
        raf = (time) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);
      }

      heroTimeline(gsap);
      scrollReveals(gsap, ScrollTrigger);
      heroScrollParallax(gsap);
      const removePointer = desktop ? pointerParallax(gsap) : () => {};

      // Fonts and lazy images change layout — refresh trigger positions once settled.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });

      return () => {
        removePointer();
        if (raf) gsap.ticker.remove(raf);
        lenis?.destroy();
        lenis = null;
      };
    },
  );
}

/** Re-run reveal hooks for content injected after load (e.g. filtered lists). */
export function refreshTriggers() {
  window.ScrollTrigger?.refresh();
}
