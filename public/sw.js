const CACHE_NAME = 'maslaconnect-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg'
];

// Instalar el service worker y cachear archivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activar el service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia de cache: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta
        const responseClone = response.clone();
        
        // Guardar en cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // Si falla, intentar cache
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response('No hay conexión y el recurso no está en cache', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
