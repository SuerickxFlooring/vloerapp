// VloerAssistent — Service Worker v7
// BELANGRIJK: app HTML nooit cachen — altijd live laden
// Alleen data cachen voor offline gebruik

const CACHE_NAME = 'vloerapp-data-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // App HTML: NOOIT cachen — altijd van server laden
  if (url.hostname === 'suerickxflooring.github.io' || url.hostname === 'myhub65.github.io') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Google Sheets data: network-first, cache als fallback bij offline
  if (url.hostname === 'docs.google.com') {
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .then(resp => {
          if (resp.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resp.clone()));
          }
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Weer API: network-first, cache als fallback
  if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          if (resp.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, resp.clone()));
          }
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Al het andere: gewoon ophalen
  event.respondWith(fetch(event.request));
});
