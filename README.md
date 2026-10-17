# Chandigarhcitylyf

**Where Chandigarh Connects.** A static website for a Chandigarh-based creator discovery platform, influencer-marketing service and city-culture magazine. It covers Chandigarh, Mohali and Panchkula.

It's built with semantic HTML, SCSS, vanilla ES modules, GSAP + ScrollTrigger and Lenis. It runs on GitHub Pages with no Node server in production.

> **Status: preview build.** All creator profiles and business spotlights are clearly labelled demonstration content. Forms validate, but they don't send until a form endpoint is configured. No live Instagram data is shown. See the [production checklist](#production-configuration-checklist).

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Brand, featured creators, city life, business spotlight, conversion |
| `/creators/` | Searchable, filterable creator directory with profile dialogs |
| `/for-businesses/` | Services, configurable packages, process, campaign inquiry form |
| `/city-life/` | Editorial guide to places, food, culture and the Tricity |
| `/stories/` | Article archive with category filters and search |
| `/stories/<slug>/` | Generated article pages (5 original articles) |
| `/about/` | Mission, beliefs, editorial approach |
| `/info/` | Phone numbers, emails, quick facts, paths, FAQ, policies |
| `/people/` | Famous people from Chandigarh: births chart, field filters, 40 profiles (38 born, 2 raised in the city) |
| `/people/<slug>/` | Generated profile pages: stats, story, timeline, honours, FAQ, sources (Person + FAQPage schema) |
| `/contact/` | Business / creator / partner forms (tabbed; `?type=` preselects) |
| `/privacy/`, `/terms/` | **Draft** legal pages that need legal review |
| `/404.html` | Not-found page |

## Project structure

```
cityfluence/
├── index.html, */index.html, 404.html   ← GENERATED. Don't edit; edit src/ and rebuild
├── src/
│   ├── partials/        head, header, footer, scripts, form-footer
│   ├── pages/           one file per page, with a <!--meta {...}--> header
│   └── templates/       article.html
├── scss/
│   ├── abstracts/       tokens (colours, type scale, spacing, breakpoints, z-index,
│   │                    easing), functions (fluid clamp()), mixins
│   ├── base/            CSS custom properties, reset, base, typography
│   ├── layout/          container, header, mobile menu, footer
│   ├── components/      buttons, tags/chips, section heads + CTA banners,
│   │                    creator cards + profile dialog, story/business cards,
│   │                    forms + filters, marquee/steps/gallery/packages
│   ├── pages/           home, inner pages
│   └── main.scss
├── css/main.css         ← compiled, committed
├── js/
│   ├── main.js          entry point (each module isolated with try/catch)
│   ├── config.js        ★ site settings: domain, contact emails/phones, socials, endpoints, prices
│   ├── animations.js    GSAP/ScrollTrigger/Lenis motion system
│   ├── navigation.js    sticky header, mobile menu, anchors, skip link
│   ├── creators.js      profile dialog, optional metrics hydration
│   ├── filters.js       directory and story filters (URL-synced)
│   ├── forms.js         validation, honeypot, submission, contact tabs
│   ├── components/render.js   card/profile renderers shared by build + browser
│   ├── services/creator-data.js  data adapter: schema, sanitising, API fetch
│   ├── data/creators.js ★ creator profiles (currently demo)
│   ├── data/articles.js ★ articles
│   └── vendor/          pinned GSAP 3.12.5, ScrollTrigger, Lenis 1.1.13
├── assets/images/       original SVG illustrations (placeholders for photography)
├── serverless/instagram-business-discovery/   Cloudflare Worker (not deployed)
├── scripts/             build, serve, link check, vendor, art generator
├── docs/                API, forms, brand and deployment notes
├── sitemap.xml, robots.txt   ← generated
└── .nojekyll
```

## Setup

You need Node.js 18+ to **build**. You don't need it to host.

```bash
npm install
npm run build        # compile SCSS → css/main.css, then generate all HTML, sitemap, robots
npm run serve        # preview at http://localhost:8080
npm run check        # verify every internal link and asset resolves
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run build:css` | SCSS → `css/main.css` (compressed, no source map) |
| `npm run watch:css` | Recompile SCSS on save |
| `npm run build:html` | Regenerate pages, article pages, `sitemap.xml`, `robots.txt` |
| `npm run vendor` | Re-copy GSAP/Lenis from `node_modules` into `js/vendor/` |
| `npm run generate:art` | Regenerate the placeholder SVG illustrations |

**Always run `npm run build` and commit the output** (HTML, `css/main.css`, sitemap) before pushing. GitHub Pages serves the committed files as-is.

## Updating content

**Creators** live in `js/data/creators.js`. Each record follows the schema documented at the top of that file. Rules:
- Unknown values stay `null`. Never estimate follower counts or engagement.
- `verificationStatus`: `demo` → `unverified` → `editorial-verified` → `api-verified`.
- `featured: true` plus `featuredOrder` (1–6) controls the six homepage profiles. This is an editorial selection, never a ranking.
- Remove `demo: true` only for real, consenting creators.
- Then run `npm run build:html`. Cards are prerendered into the HTML for SEO and no-JS visitors.

**Articles** live in `js/data/articles.js`. Add an object (slug, title, category, excerpt, intro, dates, image, alt text, body blocks), then rebuild. A static page is generated at `/stories/<slug>/` and added to the sitemap. Set `sponsored: true` for paid content, and the disclosure renders automatically.

**Famous people** live in `js/data/people.js` (list from Pantheon, birthplace checked against Wikidata, facts paraphrased from each person's Wikipedia article; sources are linked on every page). Every claim must have a source. Bump `PEOPLE_REVIEWED` when you re-check facts. Posters in `assets/images/people/` are regenerated from the data on every build (`scripts/people-art.mjs`); they are typographic graphics, not photographs. Never add photos of people without a licence.

**Pages**: edit `src/pages/*.html` (the meta header sets title, description and breadcrumb) or `src/partials/*`, then rebuild.

**Images**: the SVGs in `assets/images/` are original placeholder illustrations. Replace them with licensed photography. Use WebP/AVIF with explicit `width`/`height`, and keep `loading="lazy"` below the fold.

**Design tokens** live in `scss/abstracts/_tokens.scss`. They're exposed as CSS custom properties (`--c-lime`, `--fs-3xl`, `--space-m`, …).

## Motion and accessibility

- The hero timeline covers wordmark → nav → masked headline lines → copy → CTAs → clipped image reveals → seal → scroll cue (about 1.5s). There's no loading screen.
- ScrollTrigger handles section reveals, word-masked titles, staggered cards, a scroll-scrubbed statement and subtle parallax. There are no pinned sections and no scroll-jacking.
- Lenis is synced to GSAP's ticker. Anchors, skip link, history and focus are handled. The mobile menu and dialog pause it.
- Pointer parallax is desktop-only (`pointer: fine`, ≥900px).
- `prefers-reduced-motion` gets no Lenis and no tweens, and everything is visible immediately (via `gsap.matchMedia`, which reverts cleanly if the setting changes).
- **No-JS / failed-JS safe**: content is visible by default. Only the hero parts are briefly hidden, and an inline `<head>` script reveals them after 2.5s if the motion system never runs.
- Skip link, landmarks, one `<h1>` per page, labelled forms with inline errors (`aria-invalid` + `aria-describedby`), live regions for results/status, a focus-trapped menu with `inert` background, and keyboard-operable tabs (arrow keys, Home/End).

## Deployment (GitHub Pages)

1. Create a repository (e.g. `cityfluence`) and push:
   ```bash
   git init && git add . && git commit -m "Initial Chandigarhcitylyf site"
   git branch -M main
   git remote add origin https://github.com/<you>/cityfluence.git
   git push -u origin main
   ```
2. In **Settings → Pages**, set **Source: Deploy from a branch**, **Branch: `main` / root**.
3. **Project URL** (`https://<you>.github.io/cityfluence/`): all pages use relative links, so they work. Only `404.html` needs an absolute base. Set `basePath: '/cityfluence/'` in `js/config.js`, then rebuild.
4. **Custom domain**: once you own the domain, keep `basePath: '/'`, set `siteUrl` (used for canonical URLs, Open Graph and the sitemap) and add a `CNAME` file containing the domain (e.g. `chandigarhcitylyf.in`). Configure DNS: four `A` records to GitHub's Pages IPs (or a `CNAME` for `www` → `<you>.github.io`). Then tick **Enforce HTTPS**.
5. Rebuild and commit whenever config or content changes.

There's no production Node dependency. The optional Instagram worker and the form service are separate (see `docs/`).

## Production configuration checklist

Everything below is **outstanding**. The site degrades honestly until each one is done.

**Brand and legal**
- [ ] Register the domain (e.g. `chandigarhcitylyf.in`). Availability hasn't been checked for this name yet, so check with a registrar.
- [ ] Trademark search for "Chandigarhcitylyf" (IP India public search, classes 35/41/42) before committing to the name. See `docs/BRAND.md`.
- [ ] Legal review of `/privacy/` and `/terms/` (DPDP Act 2023), and fill the bracketed sections.

**Configuration (`js/config.js`)**
- [ ] `siteUrl` / `basePath` for the final host. Add `CNAME` for a custom domain.
- [x] `contact.emails` / `contact.phones`: set (2 emails, 2 phones). Shown in the footer, `/contact/`, `/info/`, structured data, privacy page and form fallback messages.
- [ ] `social.instagram`, `social.youtube`: official handles once created.
- [x] Forms send via FormSubmit to pawan1985chd@gmail.com, CC vikas1999chd@gmail.com.
- [ ] **Activate FormSubmit**: click the "Activate Form" email sent to pawan1985chd@gmail.com, then swap the address in the endpoint for FormSubmit's random string (see `docs/FORMS.md`).
- [ ] `packages.*.from`: only if you decide to publish starting prices.
- [ ] `previewBuild: false` once demo content is gone.

**Content**
- [ ] Replace all nine demo creators with real, consenting creators (verified handle, authorised image, written consent to be listed).
- [ ] Replace the three "Open feature slot" cards on the homepage with real, permissioned business features (label sponsored ones).
- [ ] Replace placeholder SVG illustrations with licensed or commissioned photography, credited where required.
- [ ] Add a 1200×630 `og-image.jpg` and an `og:image` tag in `src/partials/head.html`.
- [ ] Review the five articles, publication dates and author line before going live.
- [ ] Community gallery: fill only with approved posts. Use official Instagram embeds only with permission.

**Optional integrations**
- [ ] Instagram Business Discovery worker: Meta app, permissions, token, deploy, test, then set `creatorsApiEndpoint`. See `docs/INSTAGRAM-API.md`.
- [ ] Analytics (privacy-respecting). Update the privacy policy accordingly.
- [ ] Self-host Archivo and Inter in `assets/fonts/` to remove the Google Fonts request.

**Launch QA**
- [ ] `npm run build && npm run check`
- [ ] Lighthouse (mobile) on each page type. Test with a screen reader and keyboard only.
- [ ] Submit `sitemap.xml` in Google Search Console.

## What was tested (preview build)

These were automated in headless Chrome against the local server:
- Directory search, niche/platform/location/content filters, sort, URL sync and restore, empty state, clear.
- Profile dialog: open, deep link (`?profile=`), Esc close, URL cleanup.
- Business form: required-field errors, email format error, focus management, honest "not connected" message.
- Contact tabs from `?type=`, arrow-key navigation, creator prefill from `?creator=`.
- Mobile menu: open, focus inside, `inert` background, Esc close, focus return.
- Stories category from URL and empty state.
- Hero visible after the intro, Lenis active, and hero still visible with **all JS blocked**.
- No horizontal overflow at 320 / 360 / 390 / 600px. No console errors. 0 broken internal links.

Not yet tested: real form delivery, the Instagram worker against Meta's API, real devices and browsers beyond Chromium, and Lighthouse scores.
