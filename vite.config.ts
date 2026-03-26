import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  base: '/job-app/',

  server: {
    // Vite handles headers for localhost development
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
  },

  worker: {
    format: 'es',
  },

  build: {
    sourcemap: true,
  },

  optimizeDeps: {
    exclude: ['sqlocal', '@sqlite.org/sqlite-wasm'],
  },
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    }
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,wasm,png,svg,ico}'],
        globIgnores: ['**/node_modules/**/*', '**/*.js.map']
      },
      manifest: {
        name: 'Jobs',
        short_name: 'jobs',
        description: 'Create and manage job materials/pricing information',
        display: 'standalone',
        theme_color: '#ffffff',
        icons: [
          { "src": "android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
          { "src": "android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" },
          { "src": "apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
        ]
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'android-chrome-192x192.png',
        'android-chrome-512x512.png'
      ],
    })
  ],
});