// =====================================================================
// Service Worker — Control de Salas (Centro de Convenciones)
//
// IMPORTANTE PARA FUTURAS ACTUALIZACIONES:
// Cada vez que subas una versión nueva del código, tenés que cambiar
// el número de CACHE_VERSION de abajo (por ejemplo de 'v1' a 'v2').
// Eso es lo que le avisa a la app que hay algo nuevo para descargar.
// Si no cambiás este número, los usuarios van a seguir viendo la
// versión vieja aunque subas archivos nuevos al repositorio.
// =====================================================================
const CACHE_VERSION = 'v2';
const CACHE_NAME = `centro-convenciones-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Al instalar una versión nueva del service worker, descarga y guarda
// en caché todos los archivos de la app.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Al activarse, borra cachés de versiones anteriores para no acumular
// basura ni servir archivos viejos por error.
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

// Estrategia: responder rápido desde el caché (para que la app abra al
// instante incluso sin señal), y en paralelo pedir la versión nueva a
// internet para tenerla lista la próxima vez.
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
