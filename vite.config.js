import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Which company to build: SITE=jm-contractors npm run build (default: ironline)
const site = process.env.SITE || 'ironline';
const sitePath = fileURLToPath(new URL(`./src/sites/${site}.js`, import.meta.url));
const { default: config } = await import(sitePath);

// Fills SEO tags, theme colors and Google business data into index.html from the company file.
function companyHtml() {
  const { company, theme, seo, services, concept } = config;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: company.name,
    telephone: company.phone,
    email: company.email || undefined,
    address: company.address,
    areaServed: company.serviceArea,
    foundingDate: String(company.founded),
    openingHours: company.hours || undefined,
    makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title } }))
  };
  const vars = Object.entries(theme)
    .map(([k, v]) => `--${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${v};`)
    .join('');
  // Concept/pitch sites stay out of search results and carry no business data.
  const head = concept
    ? '<meta name="robots" content="noindex, nofollow" />'
    : `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
  return {
    name: 'company-html',
    transformIndexHtml: {
      order: 'pre',
      handler: html =>
        html
          .replaceAll('%SEO_TITLE%', seo.title)
          .replaceAll('%SEO_DESC%', seo.description)
          .replaceAll('%THEME_BG%', theme.dark)
          .replaceAll('%THEME_ACCENT_ENC%', encodeURIComponent(theme.accentOnDark))
          .replaceAll('%THEME_DARK_ENC%', encodeURIComponent(theme.dark))
          .replace('%THEME_VARS%', vars)
          .replace('%HEAD_EXTRA%', head)
    }
  };
}

export default defineConfig({
  base: './',
  resolve: { alias: { '@site': sitePath } },
  plugins: [react(), companyHtml()]
});
