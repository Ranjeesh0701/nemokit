import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gscToken =
    env.VITE_GSC_VERIFICATION_TOKEN ||
    process.env.VITE_GSC_VERIFICATION_TOKEN ||
    env.GSC_VERIFICATION_TOKEN ||
    process.env.GSC_VERIFICATION_TOKEN ||
    '';

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gsc-verification-plugin',
        transformIndexHtml(html: string) {
          if (gscToken && gscToken.trim()) {
            return html.replace(
              '<!-- %GSC_VERIFICATION% -->',
              `<meta name="google-site-verification" content="${gscToken.trim()}" />`
            );
          }
          return html.replace('<!-- %GSC_VERIFICATION% -->', '');
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['pwa-icon.svg'],
        manifest: {
          name: 'Nemokit — Modern Utility Platform',
          short_name: 'Nemokit',
          description:
            'Your tools. One place. No clutter. 100% private, client-side developer utilities.',
          theme_color: '#faf9f6',
          background_color: '#faf9f6',
          display: 'standalone',
          orientation: 'any',
          icons: [
            {
              src: '/pwa-icon.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        },
      }),
    ],
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('pdf-lib')) {
              return 'pdf-lib';
            }
          },
        },
      },
    },
  };
});
