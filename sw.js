// ══════════════════════════════════════════════════════════
// VloerAssistent — Service Worker v5
// Strategie: network-first voor app, cache-first voor data
// ══════════════════════════════════════════════════════════

const CACHE_NAME = 'vloerapp-v5';

// ── Installatie ───────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting(); // Activeer meteen zonder te wachten
});

// ── Activatie: wis oude caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch strategie ───────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. App zelf (index.html): ALTIJD network-first
  //    → Als online: laad nieuwste versie + sla op in cache
  //    → Als offline: gebruik cache
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html') || url.pathname.endsWith('vloerapp')) {
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Google Sheets data: network-first met cache fallback
  if (url.hostname === 'docs.google.com') {
    event.respondWith(
      fetch(event.request, {cache: 'no-store'})
        .then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return resp;
        })
        .catch(() => {
          console.log('[SW] Offline — gecachte Sheets data');
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. Weer API: network-first, stil falen als offline
  if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 4. Al het andere (sw.js zelf, fonts, etc): network-first
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
