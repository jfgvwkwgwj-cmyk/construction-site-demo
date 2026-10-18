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

- Preloader, smooth scroll, sticky nav that hides on scroll
- Hero with animated headline, rotating services and an interactive dot-grid
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
- `src/components/Blueprint.jsx` — animated line drawings
- `src/bits/` — React Bits components
