# Brand system

## Name and domain

**Cityfluence**: Where Chandigarh Connects. *Local Stories. Real Creators. Bigger Impact.*

Domain check (DNS lookup, 11 Oct 2026). These results are **indicative only**:

| Domain | DNS result |
|---|---|
| cityfluence.in | No records found (NXDOMAIN) |
| cityfluence.co | No records found (NXDOMAIN) |
| thecityfluence.com | No records found (NXDOMAIN) |

No DNS records usually means unregistered, but registered-but-parked domains can also have none. Confirm with a registrar (and the .IN registry) before buying. Consider registering the primary choice plus one alternative to protect the name.

**Trademark: not yet checked.** Before launch:
- Search IP India's public trademark search for "Cityfluence" and close variants ("City Fluence", "Cityfluencer"), especially in classes **35** (advertising, marketing), **41** (publishing, entertainment) and **42** (online platforms).
- Check social handle availability (Instagram, YouTube) for consistency.
- Consider filing once the name is confirmed. Get advice from a trademark attorney.

## Wordmark

A text-only wordmark: **CITY** (Archivo Black, expanded) + **FLUENCE** (Archivo regular, expanded), followed by a **lime dot** outlined in ink. It's set in HTML/CSS, so it's always crisp and accessible. The favicon is a "c" with the lime dot.

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
