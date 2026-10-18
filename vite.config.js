import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import config from './src/config.js';

// Fills SEO tags, theme colors and Google "LocalBusiness" data into index.html from config.js.
function companyHtml() {
  const { company, theme, seo, services } = config;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: company.name,
    telephone: company.phone,
    email: company.email,
    address: company.address,
    areaServed: company.serviceArea,
    foundingDate: String(company.founded),
    openingHours: company.hours,
    makesOffer: services.map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.title } }))
  };
  const vars = Object.entries(theme)
    .map(([k, v]) => `--${k}:${v};`)
    .join('');
  return {
    name: 'company-html',
    transformIndexHtml: {
      order: 'pre',
      handler: html =>
      html
        .replaceAll('%SEO_TITLE%', seo.title)
        .replaceAll('%SEO_DESC%', seo.description)
        .replaceAll('%THEME_BG%', theme.bg)
        .replaceAll('%THEME_ACCENT_ENC%', encodeURIComponent(theme.accent))
        .replace('%THEME_VARS%', vars)
        .replace('%JSON_LD%', JSON.stringify(jsonLd).replace(/</g, '\\u003c'))
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), companyHtml()]
});
