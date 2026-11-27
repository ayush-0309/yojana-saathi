import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PUBLIC_FILES = ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

// Emits sw.js with the exact list of built files, so the app works offline.
function serviceWorker() {
  return {
    name: 'yojana-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const built = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !f.endsWith('.woff') && f !== 'index.html');
      const assets = ['./', ...built, ...PUBLIC_FILES];
      const source = readFileSync(new URL('./src/sw-template.js', import.meta.url), 'utf8')
        .replace('__VERSION__', Date.now().toString(36))
        .replace('__ASSETS__', JSON.stringify(assets));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// Content-Security-Policy for the built site only (the dev server needs inline scripts).
function csp() {
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${process.env.VITE_LLM_EXTRACT_URL ? ` ${new URL(process.env.VITE_LLM_EXTRACT_URL).origin}` : ''}`,
    "manifest-src 'self'",
    "worker-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
  return {
    name: 'yojana-csp',
    apply: 'build',
    transformIndexHtml: (html) => html.replace('<!-- CSP -->', `<meta http-equiv="Content-Security-Policy" content="${policy}" />`),
  };
}

export default defineConfig({
  // Relative asset paths: the same build works at / (Docker) and /yojana-saathi/ (GitHub Pages)
  base: './',
  plugins: [react(), serviceWorker(), csp()],
  server: { port: 5173, host: true },
  test: { environment: 'node' },
});
