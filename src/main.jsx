import React from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted font: no third-party requests, and it works offline.
import '@fontsource/mukta/devanagari-400.css';
import '@fontsource/mukta/latin-400.css';
import '@fontsource/mukta/devanagari-600.css';
import '@fontsource/mukta/latin-600.css';
import '@fontsource/mukta/devanagari-700.css';
import '@fontsource/mukta/latin-700.css';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Offline support and "Add to home screen" (production builds only).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => { /* app still works online */ });
  });
}
