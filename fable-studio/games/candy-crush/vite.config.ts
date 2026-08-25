import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: '.',
  base: './',
  resolve: {
    alias: {
      '@nanagames/engine': resolve(__dirname, '../../packages/engine/src'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
    host: true,
  },
  preview: {
    port: 5174,
  },
});
