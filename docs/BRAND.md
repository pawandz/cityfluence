# Brand system

## Name and domain

**Chandigarhcitylyf**: Where Chandigarh Connects. *Local Stories. Real Creators. Bigger Impact.*

**Domain: not yet checked for this name.** The earlier DNS check (11 Oct 2026) covered the previous name, Cityfluence, and doesn't apply. Check candidates such as `chandigarhcitylyf.in` and `chandigarhcitylyf.com` with a registrar (and the .IN registry) before buying. Consider registering the primary choice plus one alternative to protect the name.

**Trademark: not yet checked.** Before launch:
- Search IP India's public trademark search for "Chandigarhcitylyf" and close variants ("Chandigarh City Lyf", "Chandigarh City Life"), especially in classes **35** (advertising, marketing), **41** (publishing, entertainment) and **42** (online platforms).
- Check social handle availability (Instagram, YouTube) for consistency.
- Consider filing once the name is confirmed. Get advice from a trademark attorney.

## Logo

Files are in `assets/brand/`.

- **Lockup** (`logo-*.svg`): the emblem, a thin vertical rule, and "Chandigarh / City / Lyf" stacked in Inter Tight SemiBold. The text is converted to outlines, so the files don't need the font.
- **Emblem** (`emblem-*.svg`): the Palace of Assembly (hyperboloid tower, pyramid, upswept portico) on the waves of Sukhna Lake, inside a ring. The Open Hand is deliberately not used: it's the Chandigarh Administration's official emblem and could imply an official connection.
- **Colours:** indigo on lime is the primary pairing; ink, white and lime versions exist for other backgrounds. Wave lines are transparent cut-outs, so any version works on any background with enough contrast.
- **Favicon / app icon:** lime emblem on an ink tile (`favicon.svg`, `app-icon-512.png`). Social share image: `og-image.png` (1200×630).
- **On the site:** the logo is drawn with CSS masks (`scss/components/_brand.scss`) and takes the surrounding text colour. The header shows the lockup and morphs to the emblem when scrolled.
- **Clear space:** at least the height of the ring's stroke ×4 around the lockup. Don't stretch, recolour parts separately, or set the name in another typeface.

## Colour

| Token | Hex | Use |
|---|---|---|
| ivory | `#F3F0E8` | Page background |
| paper | `#FBFAF6` | Cards, inputs |
| ink | `#121212` | Text, dark sections |
| lime | `#D4FF3A` | Accent, highlights, primary CTA |
| muted | `#5C5850` | Secondary text (AA on ivory) |
| beige / sand / concrete / stone | warm neutrals | Image grounds, borders |

Use lime sparingly: one strong accent per view. Lime text only goes on ink, never on ivory.

## Type

- **Display**: Archivo, weight 800, width 104–125%, uppercase, tight leading (0.86–0.95).
- **Body**: Inter 400/500/600.
- Fluid sizes via `clamp()` (`scss/abstracts/_tokens.scss → $type-scale`).

## Art direction

Editorial grids, oversized headlines, asymmetric collages, generous whitespace. Photography should be real Chandigarh: concrete and brick architecture, cafés, street life, gardens, young creators. Use warm, natural grading. Avoid generic stock, gradients and glassmorphism. Until real photography exists, the site uses original SVG illustrations (`npm run generate:art`), which are clearly illustrative and never presented as real people or places.

## Editorial integrity

- Paid content is always labelled "Sponsored". Editorial picks are never sold.
- No invented creators, stats, testimonials, partners or results.
- Verify addresses, timings, prices and dates before publishing.
