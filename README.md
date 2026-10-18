# Construction Company Website Template

A premium one-page site for contractors, built with **GSAP** (scroll animations), **Lenis** (smooth scrolling) and **React Bits** (animated components).

## Make a site for a new company (5 minutes)

1. Copy this folder, e.g. `cp -r construction-site smith-builders`
2. Open `src/config.js` and change:
   - `company` — name, phone, email, address, service area, license #
   - `theme.accent` — their brand color (amber, brick red, green…)
   - `services`, `projects`, `testimonials`, `stats`
   - `seo` — the Google title + description
3. **Add their photos** (strongly recommended): put files in `public/images/` and set
   `hero.image: './images/hero.jpg'` and each project's `image: './images/kitchen.jpg'`.
   Without photos, the site shows animated blueprint drawings instead.
4. Build: `npm install` then `npm run build`. The finished site is in `dist/`.

## Preview while editing

```
npm install
npm run dev
```

## Put it online (free)

Drag the `dist/` folder onto **Netlify Drop** (app.netlify.com/drop), or connect the folder to Vercel / Cloudflare Pages. Then point the company's domain at it.

## Make the quote form deliver leads

By default, the form opens the visitor's email app addressed to `company.email`.
For real lead capture, create a free form at Formspree or Getform and paste the endpoint into `company.formEndpoint`.

## What's included

- **3D hero**: a tower builds itself floor by floor as you scroll (crane, slabs, glass, lights on), with a live build readout and a "Topped out" stamp
- **Instant cost estimator**: project type, size slider and finish level give a live price range and build time, then pre-fill the quote form. Rates live in `config.estimator`
- **Plan → built slider**: drag to compare the blueprint with the finished house
- Crossed caution-tape banners, surveyor crosshair cursor, scroll elevation gauge
- Preloader, smooth scroll, sticky nav that hides on scroll
- Animated headline with rotating services
- Scroll-velocity marquee, scroll-reveal story text, count-up stats
- Spotlight service cards, pinned horizontal project gallery, scrubbed process timeline
- Reviews, service area, quote form with project-type chips
- Mobile "Call now / Free estimate" bar (most contractor leads come from phones)
- SEO tags + Google `GeneralContractor` structured data, generated from the config
- Respects "reduce motion" accessibility settings

## Files

- `src/config.js` — **the only file you normally edit**
- `src/App.jsx` — page sections
- `src/styles.css` — design
- `src/components/BuildScene.jsx` — the 3D building (Three.js)
- `src/components/Estimator.jsx` — price calculator
- `src/components/Compare.jsx` — plan vs built slider
- `src/components/Blueprint.jsx` — animated line drawings
- `src/bits/` — React Bits components
