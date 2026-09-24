// =====================================================================
// Service Worker — Control de Salas (Centro de Convenciones)
//
// IMPORTANTE PARA FUTURAS ACTUALIZACIONES:
// Cada vez que subas una versión nueva del código, tenés que cambiar
// el número de CACHE_VERSION de abajo (ej. de 'v1.07' a 'v1.08'). Usamos
// v1.xx para actualizaciones normales y recién pasamos a v2.0 cuando sea
// un cambio grande de verdad.
// =====================================================================
const CACHE_VERSION = 'v1.07';
const CACHE_NAME = `centro-convenciones-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});
