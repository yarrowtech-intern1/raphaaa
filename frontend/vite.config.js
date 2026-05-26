import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      targets: ['defaults', 'chrome >= 64'],
      modernPolyfills: true,
    }),
  ],
  base: '/',
  server: {
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});
