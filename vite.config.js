import { defineConfig } from 'vite';

export default defineConfig({
  // relative paths, so the built kiosk works from any folder or sub-path
  base: './',
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900, // three.js is large by design
  },
});
