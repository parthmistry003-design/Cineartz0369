const CACHE_NAME = 'cineartz036-v2';

self.addEventListener('install', () => {
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
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Don't intercept Supabase, CDN, or other external requests.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
