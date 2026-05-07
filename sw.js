// ══════════════════════════════════════════════════════════
// VloerAssistent — Service Worker (offline werking)
// Versie: 2.0 — cache geforceerd vernieuwd
// ══════════════════════════════════════════════════════════

const CACHE_NAME = 'vloerapp-v2';
const OFFLINE_PAGE = '/vloerapp/index.html';

// Bestanden die altijd gecached worden bij installatie
const PRECACHE_URLS = [
  '/vloerapp/',
  '/vloerapp/index.html',
];

// ── Installatie: cache de app-shell ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activatie: verwijder oude caches ─────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Oude cache verwijderd:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first voor app, network-first voor data ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Sheets data: network-first, val terug op cache
  if (url.hostname === 'docs.google.com') {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          // Sla succesvolle response op in cache
          if (resp.ok) {
            const clone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return resp;
        })
        .catch(() => {
          // Offline: geef gecachte data terug
          console.log('[SW] Offline — gecachte Sheets data gebruikt');
          return caches.match(event.request);
        })
    );
    return;
  }

  // Open-Meteo weer: network-first, stil falen als offline
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

  // App zelf (HTML, JS, CSS): cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => {
        // Offline en niet in cache: stuur app terug
        return caches.match(OFFLINE_PAGE);
      });
    })
  );
});

// ── Background sync (als browser dit ondersteunt) ────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-registraties') {
    console.log('[SW] Background sync gestart');
    // De app handelt dit zelf af via syncPendingRegistraties()
  }
});
