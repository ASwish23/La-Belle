# La Belle Nails & Relaxation — Website

Static marketing site for La Belle Nails & Relaxation, a nail salon and spa in Spring, TX. Plain HTML/CSS/JS — no build step, no framework, no dependencies.

## Structure

- `index.html` — Home page (hero carousel, services overview, footer)
- `services.html` — Full services listing
- `galerie.html` — Photo gallery
- `programare.html` — Appointment booking page (Setmore widget, info cards, Google map)
- `privacy.html` — Privacy policy (cookies section anchored at `#cookies`)
- `style.css` — Single shared stylesheet for all pages
- `script.js` — Single shared vanilla JS file (IIFE, no dependencies) for all pages
- `images/` — Local image assets (gallery/about)
- `images-salon/` — Real salon photos for the home carousel; each has a full-size file plus a `-800.jpg` phone version used via `srcset`
- `favicon.svg`, `robots.txt`, `sitemap.xml` — SEO/site files

All five pages share the same header/nav and footer markup and load the same `style.css` and `script.js`. When editing shared components (header, footer, nav), update them consistently across all HTML files — there's no templating, so changes must be copy-pasted by hand. When adding a page, also add it to `sitemap.xml`.

**Placeholder domain:** canonical links, Open Graph tags, the JSON-LD business data in `index.html`, `robots.txt` and `sitemap.xml` use `https://www.example.com`. Replace every occurrence with the real domain before launch.

**Business details (keep identical everywhere, incl. JSON-LD):** La Belle Nails & Relaxation, 440 Rayford Rd, Spring, TX 77386, +1 281-216-6471, Mon–Sat 09:00–19:00, Sun 11:00–17:00. No email address is published.

**Reviews (home page carousel):** only real Google reviews, copied word for word (keep the client's own spelling; a trailing "…" marks text Google truncated). Show first name + last initial, no dates (they go stale). Never invent or polish reviews, and don't add Review/AggregateRating schema for them (Google ignores self-hosted reviews on a business's own site). Carousel logic is in `script.js`, REVIEWS CAROUSEL.

**Cookie consent:** `script.js` builds the cookie banner and stores the choice in localStorage (`labelle-cookie-consent` = `all` | `essential`). Any third-party embed that sets cookies must use the `[data-consent-embed]` pattern (iframe with `data-src` + `hidden`, plus a `.map-placeholder` with a `[data-load-embed]` button), see the map in `programare.html`, and be listed in `privacy.html`.

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
- Prefer local files in `images/` for new site imagery over hotlinking; some placeholder imagery (service cards, page heroes, one gallery tile) still comes from Unsplash.
- Compress new photos before adding them (max ~1600px wide for full-bleed, ~750px for gallery tiles, JPEG quality ~72–75) and give `<img>` tags `width`/`height` attributes. Original uncompressed photos are backed up outside the site folder in `../_image-originals/`.
