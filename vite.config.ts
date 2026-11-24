/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg', 'covers/*.{svg,webp}'],
      manifest: {
        name: 'CESAR Hub',
        short_name: 'CESAR Hub',
        description: 'Todos os serviços e ferramentas do CESAR em um só lugar.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0e1116',
        theme_color: '#0e1116',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // As capas entram no cache offline; os originais pesados de /images/ ficam de fora.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        globIgnores: ['images/**'],
        // O catálogo muda sem novo deploy do app: busca na rede primeiro (cache só se estiver offline ou lento).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/data/services.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'cesar-hub-catalog', networkTimeoutSeconds: 3 },
          },
        ],
        navigateFallback: '/index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});
