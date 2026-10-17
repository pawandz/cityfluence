/**
 * Interaction layer on top of animations.js: scroll progress, velocity
 * marquee, magnetic buttons, card tilt, contextual cursor label and the home
 * page's scroll-driven scenes.
 *
 * Every init* function returns a cleanup function, so gsap.matchMedia() can
 * revert everything when reduced motion is switched on or the viewport changes.
 * Decorative elements created here are aria-hidden; nothing here moves focus
 * or hides content.
 */

const noop = () => {};

/** Thin lime bar at the top of the viewport showing page progress. */
export function initScrollProgress(gsap) {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  const tween = gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    bar.remove();
  };
}

/**
 * Infinite ticker that speeds up with scroll velocity and follows scroll
 * direction. The track's content is cloned once so the loop is seamless.
 */
export function initMarquees(gsap, ScrollTrigger) {
  const cleanups = [...document.querySelectorAll('[data-marquee]')].map((el) => {
    const track = el.querySelector('.marquee__track');
    if (!track) return noop;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    el.append(clone);
    const tracks = [track, clone];
    const loop = gsap.to(tracks, { xPercent: -100, ease: 'none', duration: parseFloat(el.dataset.marquee) || 28, repeat: -1 });

    let direction = 1;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        if (self.direction !== direction) direction = self.direction;
        const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 5);
        gsap.to(loop, { timeScale: direction * boost, duration: 0.2, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: direction, duration: 1.2, ease: 'power2.out' }) });
      },
    });
    return () => {
      st.kill();
      loop.kill();
      gsap.set(track, { clearProps: 'transform' });
      clone.remove();
    };
  });
  return () => cleanups.forEach((fn) => fn());
}

// Primary calls to action across the site (header and menu excluded: their
// pills already animate with the header).
const MAGNETIC = '[data-magnetic], main .btn--large, main .btn--lime, main .pill--solid, main .pill--light, .cta-banner .btn';

/** Buttons drift toward the pointer and spring back on leave. */
export function initMagnetic(gsap) {
  const cleanups = [...document.querySelectorAll(MAGNETIC)].map((el) => {
    el.classList.add('is-magnetic');
    const strength = parseFloat(el.dataset.magnetic) || 0.3;
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.35)' });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.classList.remove('is-magnetic');
      gsap.set(el, { clearProps: 'transform' });
    };
  });
  return () => cleanups.forEach((fn) => fn());
}

/** Subtle 3D tilt that follows the pointer across a card. */
export function initTilt(gsap, selector, maxDeg = 6) {
  const cleanups = [...document.querySelectorAll(selector)].map((el) => {
    el.classList.add('is-tilt');
    gsap.set(el, { transformPerspective: 900 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3.out' });
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * maxDeg * 2);
      rx(-((e.clientY - r.top) / r.height - 0.5) * maxDeg * 2);
    };
    const enter = () => gsap.to(el, { y: -6, duration: 0.5, ease: 'power3.out' });
    const leave = () => gsap.to(el, { rotationX: 0, rotationY: 0, y: 0, duration: 0.8, ease: 'power3.out' });
    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      el.classList.remove('is-tilt');
      gsap.set(el, { clearProps: 'transform' });
    };
  });
  return () => cleanups.forEach((fn) => fn());
}

/**
 * A label bubble ("View", "Read"…) that trails the pointer over cards.
 * The native cursor stays visible; the bubble is decoration only.
 */
export function initCursorLabel(gsap, targets) {
  const bubble = document.createElement('div');
  bubble.className = 'cursor-label';
  bubble.setAttribute('aria-hidden', 'true');
  bubble.innerHTML = '<span></span>';
  document.body.append(bubble);
  const text = bubble.firstElementChild;
  gsap.set(bubble, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
  const x = gsap.quickTo(bubble, 'x', { duration: 0.45, ease: 'power3.out' });
  const y = gsap.quickTo(bubble, 'y', { duration: 0.45, ease: 'power3.out' });

  const move = (e) => { x(e.clientX + 28); y(e.clientY + 28); };
  const over = (e) => {
    const hit = targets.find(([sel]) => e.target.closest?.(sel));
    if (hit) {
      text.textContent = hit[1];
      gsap.to(bubble, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(2)', overwrite: 'auto' });
    } else {
      gsap.to(bubble, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in', overwrite: 'auto' });
    }
  };
  window.addEventListener('pointermove', move);
  document.addEventListener('pointerover', over);
  return () => {
    window.removeEventListener('pointermove', move);
    document.removeEventListener('pointerover', over);
    bubble.remove();
  };
}

/** Soft glow in the hero that eases toward the pointer. */
export function initHeroGlow(gsap) {
  const hero = document.querySelector('.hero');
  const glow = hero?.querySelector('.hero__glow');
  if (!glow) return noop;
  const x = gsap.quickTo(glow, 'x', { duration: 1.6, ease: 'power3.out' });
  const y = gsap.quickTo(glow, 'y', { duration: 1.6, ease: 'power3.out' });
  const move = (e) => {
    const r = hero.getBoundingClientRect();
    x(e.clientX - r.left - r.width * 0.65);
    y(e.clientY - r.top - r.height * 0.4);
  };
  hero.addEventListener('pointermove', move);
  return () => {
    hero.removeEventListener('pointermove', move);
    gsap.set(glow, { clearProps: 'transform' });
  };
}

/**
 * In-page links (#section) glide via Lenis, clear of the fixed header, then
 * move focus. The skip link and tab controls keep their native behaviour.
 */
export function initSmoothAnchors(getLenis) {
  const click = (e) => {
    const link = e.target.closest?.('a[href^="#"]');
    const lenis = getLenis();
    if (!link || !lenis || link.classList.contains('skip-link') || link.getAttribute('role') === 'tab') return;
    const href = link.getAttribute('href');
    if (href.length < 2) return;
    let target;
    try { target = document.querySelector(href); } catch { return; }
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector('.site-header');
    lenis.scrollTo(target, {
      duration: 1.4,
      offset: target.matches('main > section:first-child, .powered') ? 0 : -((header?.offsetHeight ?? 0) + 16),
      onComplete: () => {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      },
    });
  };
  document.addEventListener('click', click);
  return () => document.removeEventListener('click', click);
}

// Card images that ease from a slight zoom as they scroll in. Feature images
// with their own scrubbed parallax (animations.js) are left out.
const SETTLE = [
  '.category-tile img',
  '.business-card__media img',
  '.person-card__media img',
  '.story-card:not(.story-card--feature) .story-card__media img',
  '.creator-card__media img',
  '.place-card > img',
].join(', ');

/**
 * Images settle into their frames on entry. Elements never reached (or hidden
 * by a filter) are untouched, so nothing can be left in a zoomed state.
 */
export function initImageSettle(gsap, ScrollTrigger) {
  const imgs = gsap.utils.toArray(SETTLE).filter((img) => !img.closest('.city-bento__feature'));
  if (!imgs.length) return noop;
  const triggers = ScrollTrigger.batch(imgs, {
    start: 'top 96%',
    once: true,
    onEnter: (batch) => gsap.fromTo(batch, { scale: 1.25, transition: 'none' }, { scale: 1, duration: 1.6, ease: 'expo.out', stagger: 0.06, clearProps: 'transform,transition' }),
  });
  return () => triggers.forEach((t) => t.kill());
}

/** Inner-page heroes tuck into a rounded card as you scroll past them. */
export function initPageHeroExit(gsap) {
  const hero = document.querySelector('main > .page-hero');
  if (!hero) return noop;
  const tweens = [
    gsap.fromTo(hero,
      { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)' },
      { clipPath: 'inset(0% 1.5% 0% 1.5% round 0px 0px 40px 40px)', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }),
    gsap.to(hero.querySelectorAll('.page-hero__art img'), { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }),
  ];
  return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
}

/** Home page scroll storytelling. `desktop` enables the pinned scene. */
export function initHomeScenes(gsap, ScrollTrigger, { desktop }) {
  if (!document.body.classList.contains('page-home')) return noop;
  const triggers = [];
  const track = (t) => { if (t?.scrollTrigger) triggers.push(t); return t; };

  // Hero exits by tucking into a rounded card while its intro lifts away.
  const hero = document.querySelector('.hero');
  if (hero) {
    track(gsap.fromTo(hero,
      { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)' },
      { clipPath: 'inset(0% 2.5% 0% 2.5% round 0px 0px 48px 48px)', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } }));
    // Children only: the intro timeline already animates .hero__intro and .hero__chip themselves.
    track(gsap.fromTo(hero.querySelectorAll('.hero__lede, .hero__ctas, .hero__chip > *'), { y: 0, opacity: 1 }, { y: -80, opacity: 0, immediateRender: false, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '45% top', scrub: true } }));
  }

  // The big "Local stories / by its people" lines slide in opposite directions.
  const top = document.querySelector('.powered__type--top');
  const bottom = document.querySelector('.powered__type--bottom');
  const powered = document.querySelector('.powered');
  if (powered && top) track(gsap.fromTo(top, { xPercent: 8 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: powered, start: 'top bottom', end: 'bottom top', scrub: true } }));
  if (powered && bottom) track(gsap.fromTo(bottom, { xPercent: -8 }, { xPercent: 4, ease: 'none', scrollTrigger: { trigger: powered, start: 'top bottom', end: 'bottom top', scrub: true } }));

  // "Discover. Connect. Grow.": pin the stage while the cards gather round the headline.
  const control = document.querySelector('.control');
  const stage = control?.querySelector('.control__stage');
  if (stage) {
    const floats = stage.querySelectorAll('.control__float');
    if (desktop) {
      const from = [
        // Cards enter from the sides so none pass behind the fixed header.
        { xPercent: -130, yPercent: 10, rotation: -14 },
        { xPercent: 130, yPercent: 15, rotation: 12 },
        { xPercent: 130, yPercent: 40, rotation: -10 },
        { xPercent: -130, yPercent: 40, rotation: 14 },
      ];
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: '+=90%', pin: true, scrub: 0.8, anticipatePin: 1 } });
      floats.forEach((el, i) => tl.from(el, { ...from[i % from.length], scale: 0.7, autoAlpha: 0, ease: 'power2.out', duration: 1 }, i * 0.08));
      tl.from(stage.querySelector('.control__title'), { scale: 0.86, ease: 'power2.out', duration: 1 }, 0);
      track(tl);
    } else {
      floats.forEach((card) => {
        const depth = parseFloat(card.dataset.depth || '1');
        track(gsap.fromTo(card, { y: 60 * depth }, { y: -60 * depth, ease: 'none', scrollTrigger: { trigger: control, start: 'top bottom', end: 'bottom top', scrub: true } }));
      });
    }
  }

  // The campaign brief fills itself in, row by row.
  const brief = document.querySelector('.brief-mock');
  if (brief) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: brief, start: 'top 80%', once: true }, delay: 0.25 });
    tl.from(brief.querySelectorAll('.brief-mock__row'), { x: -24, autoAlpha: 0, duration: 0.6, ease: 'power3.out', stagger: 0.12 })
      .from(brief.querySelectorAll('.brief-mock__avatars img, .brief-mock__tag'), { scale: 0, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.06 }, '-=0.45')
      .from(brief.querySelector('.brief-mock__send'), { scaleX: 0.4, autoAlpha: 0, transformOrigin: '0% 50%', duration: 0.7, ease: 'expo.out' }, '-=0.2')
      .to(brief.querySelector('.brief-mock__dot'), { scale: 1.6, duration: 0.4, ease: 'power2.out', yoyo: true, repeat: 1 });
    track(tl);
  }

  // Closing image eases back as the card rises over it.
  const closing = document.querySelector('.closing');
  if (closing) {
    track(gsap.fromTo(closing.querySelector('.closing__media img'), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: closing, start: 'top bottom', end: 'bottom bottom', scrub: true } }));
    track(gsap.fromTo(closing.querySelector('.closing__card'), { yPercent: 18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: closing, start: 'top bottom', end: 'center center', scrub: true } }));
  }

  return () => triggers.forEach((t) => (t.scrollTrigger ?? t).kill?.());
}
