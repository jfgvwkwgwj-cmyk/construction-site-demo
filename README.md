# Construction Company Website Template

A premium one-page site for contractors, built with **GSAP** (scroll animations), **Lenis** (smooth scrolling) and **React Bits** (animated components).

## Sites in this repo

| Site | Company file | Live path |
| --- | --- | --- |
| Ironline Builders (fictional sample) | `src/sites/ironline.js` | `/` |
| J M Contractors Ltd (concept pitch) | `src/sites/jm-contractors.js` | `/jm-contractors/` |

## Make a site for a new company

1. Copy a company file: `cp src/sites/jm-contractors.js src/sites/smith-builders.js`
2. Edit everything in it: name, phone, email, services, projects, colours (`theme`), units (`metric` for the UK), and the 3D hero (`hero.model`: `house` or `tower`).
3. Add a build script in `package.json`, e.g. `"build:smith": "SITE=smith-builders vite build --outDir dist/smith-builders"`, and add it to `build:all`.
4. Preview it: `SITE=smith-builders npm run dev`.
5. Push to `main`. GitHub builds every site and publishes them.

**Concept pitches:** set `concept: 'Company Name'`. That shows a "Website concept prepared for…" bar and hides the page from search engines. When the company signs up, set `concept: ''`, add their real phone, email and photos, and replace the placeholder content.

**Photos:** put files in `public/images/` and set `hero.image` and each project's `image`. Without photos, the site shows animated drawings.

## Preview while editing

```
npm install
npm run dev          # Ironline
npm run dev:jm       # J M Contractors
```

## Put it online (free)

Drag the `dist/` folder onto **Netlify Drop** (app.netlify.com/drop), or connect the folder to Vercel / Cloudflare Pages. Then point the company's domain at it.

## Make the quote form deliver leads

By default, the form opens the visitor's email app addressed to `company.email`.
For real lead capture, create a free form at Formspree or Getform and paste the endpoint into `company.formEndpoint`.

## What's included

- **3D hero**: a building assembles itself when the page loads, with a live project-status readout. `tower`: steel frame, crane and glass. `house`: brickwork, scaffold, roof trusses, tiles, uPVC windows, then the scaffold comes down and the lights go on
- **Process drawing**: an architectural elevation draws itself stage by stage as visitors scroll through the four steps
- **Plan → built slider**: drag to compare the blueprint with the finished house
- Credentials strip, drawing-sheet project cards
- Preloader, smooth scroll, sticky nav that hides on scroll
- Animated headline with rotating services
- Scroll-reveal story text, count-up stats
- Spotlight service cards, pinned horizontal project gallery, scrubbed process timeline
- Reviews, service area, quote form with project-type chips
- Mobile "Call now / Free estimate" bar (most contractor leads come from phones)
- SEO tags + Google `GeneralContractor` structured data, generated from the config
- Respects "reduce motion" accessibility settings

## Files

- `src/sites/*.js` — **one file per company: the only files you normally edit**
- `src/App.jsx` — page sections
- `src/styles.css` — design
- `src/components/BuildScene.jsx` / `HouseScene.jsx` — the 3D tower and house (Three.js)
- `src/components/ProcessDrawing.jsx` — the drawing in the process section
- `src/components/Compare.jsx` — plan vs built slider
- `src/components/Blueprint.jsx` — animated line drawings
- `src/bits/` — React Bits components
