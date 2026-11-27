import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths: the same build works at / (Docker) and /yojana-saathi/ (GitHub Pages)
  base: './',
  plugins: [react()],
  server: { port: 5173, host: true },
  test: { environment: 'node' },
});
