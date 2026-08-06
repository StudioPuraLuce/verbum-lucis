import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

// Migrato a Cloudflare: Workers + D1 + KV/R2 + AI Gateway.
// platformProxy espone i binding (DB, ecc.) anche in `astro dev` locale.
export default defineConfig({
  site: 'https://verbumlucis.it',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // Per usare shadcn
    }),
    sitemap({
      filter: (page) => !page.includes('/admin'),
      changefreq: 'daily',
      priority: 0.7,
    }),
  ],
  i18n: {
    defaultLocale: 'it',
    locales: ['it'],
  },
  vite: {
    ssr: {
      noExternal: ['react-icons'],
    },
  },
});
