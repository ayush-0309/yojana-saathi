/* Yojana साथी service worker — generated at build time (see vite.config.js).
   Precaches the whole app so it opens and works with no network. */
const CACHE = 'yojana-mwyunx8z';
const ASSETS = ["./","assets/mukta-devanagari-400-normal-E-N4UH8Z.woff2","assets/mukta-latin-600-normal-Bz-fyKhk.woff2","assets/mukta-latin-400-normal-D2pDlrOH.woff2","assets/mukta-latin-700-normal-BDSoPHaJ.woff2","assets/mukta-devanagari-600-normal-jqxTiceK.woff2","assets/mukta-devanagari-700-normal-e2YNb9XD.woff2","assets/index-zHXFnhhS.css","assets/index-D4C3tUAg.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png"];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('yojana-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: try the network for the newest version, fall back to the cached app.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./', copy)); }
          return res;
        })
        .catch(() => caches.match('./').then((hit) => hit || caches.match('index.html'))),
    );
    return;
  }

  // Files: hashed and never change, so the cache wins.
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
