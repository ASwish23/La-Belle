# La Belle — Beauty & Nail Spa Website

Static marketing site for La Belle, a beauty and nail spa. Plain HTML/CSS/JS — no build step, no framework, no dependencies.

## Structure

- `index.html` — Home page (hero carousel, services overview, footer)
- `services.html` — Full services listing
- `galerie.html` — Photo gallery
- `programare.html` — Appointment booking page
- `style.css` — Single shared stylesheet for all pages
- `script.js` — Single shared vanilla JS file (IIFE, no dependencies) for all pages
- `images/` — Local image assets

All four pages share the same header/nav and footer markup and load the same `style.css` and `script.js`. When editing shared components (header, footer, nav), update them consistently across all HTML files — there's no templating, so changes must be copy-pasted by hand.

## Conventions

**HTML**
- Sections are marked with banner comments (`<!-- ==== SECTION NAME ==== -->`) for quick scanning.
- Use semantic elements (`header`, `nav`, `section`, `article`, `footer`) with `aria-label`/`aria-labelledby` for accessibility.
- Icons are inline SVGs (stroke-based, `currentColor` or the gold accent `#C5A059`), not an icon font or library.
- Images: `loading="eager" fetchpriority="high"` only on the first above-the-fold image; everything else `loading="lazy"`. Always include a descriptive `alt`.
- Nav links across pages: Home → `index.html`, Services → `services.html`, Gallery → `galerie.html`, Appointments → `programare.html`.

**CSS (`style.css`)**
- Design tokens live in `:root` as custom properties (`--gold`, `--navy`, `--shadow-*`, `--radius`, `--transition`, etc.) — reuse these instead of hardcoding colors/shadows.
- Fonts: `Cinzel` (logo/display), `Playfair Display` (headings), `Lato` (body), loaded via Google Fonts `@import`.
- Palette is gold (`#C5A059`) + navy (`#1A365D`) on white/cream backgrounds — keep new UI within this palette.
- Class naming is component-scoped and descriptive (e.g. `.service-card`, `.carousel-dots`, `.footer-contact`), not BEM or utility-first.

**JS (`script.js`)**
- Single IIFE (`'use strict'`), organized into commented sections (utility helpers, then one section per feature: carousel, mobile nav, scroll reveal, etc.).
- Uses small `qs`/`qsa` helpers wrapping `querySelector`/`querySelectorAll` — prefer these over repeating raw DOM queries.
- No external libraries — keep it dependency-free.

## Working in this repo

- There's no build/test/lint tooling — verify changes by opening the HTML files directly in a browser (or a simple local server) and checking the affected page(s).
- When adding a new page, copy the header/nav/footer block from an existing page verbatim and link `style.css`/`script.js` the same way, so navigation and styling stay consistent.
- Prefer local files in `images/` for new site imagery over hotlinking; existing placeholder imagery in `index.html` currently comes from Unsplash.
