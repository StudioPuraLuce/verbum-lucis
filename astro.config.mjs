import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://verbumlucis.it',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // Per usare shadcn
    }),
    sitemap({
      filter: (page) => !page.includes('/admin'),
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date(),
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