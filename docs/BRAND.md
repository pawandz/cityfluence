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

- **Symbol:** the Open Hand Monument on its pole and pedestal, drawn as a miniature of the site's illustrations (`assets/images/*.svg`): flat shapes, beige sky gradient, sage hills, concrete ground, a lime sun and the monument as a near-black silhouette. `mark.svg` for screens; `mark-grain.svg` adds the illustrations' film grain for large or print use.
- **Lockup:** the tile, then "Chandigarh City Lyf" in Inter Tight SemiBold; in large placements a hairline and the descriptor "CREATORS · CITY LIFE · LOCAL BUSINESS" follow. Text is converted to outlines.
- **Themes:** the tile never changes. `logo-light.svg` (ink name, grey descriptor) for light backgrounds; `logo-dark.svg` (white name, light-grey descriptor) for dark ones. PNG exports, favicon, a 512px app icon, a 1200×630 share image and the social media kit (`social/`) are alongside.
- **On the site:** `scss/components/_brand.scss` draws the tile from `mark.svg` and the name/descriptor as masks in currentColor, so text follows the theme. Header: tile + name, becoming the tile alone when scrolled. Footer: full lockup with descriptor. Drop the descriptor below roughly 90px tile height; it stops being legible.
- **Open Hand note:** the Open Hand is also the Chandigarh Administration's emblem. Keep this brand's own treatment (line pictogram, indigo/lime, square tile) and never pair it with the administration's colours, seal layout or name, so there's no implied official connection.
- **Clear space:** at least half the tile's height on every side. Don't stretch, recolour layers independently of the two themes, or reset the name in another typeface.

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
