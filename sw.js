/**
 * DARI LUXE ERP — Service Worker v22
 * Network-First for dynamic code & assets to prevent stale caching
 */

const CACHE_NAME = 'dariluxe-erp-v32';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/i18n.js',
  '/js/app.js',
  '/js/db.js',
  '/js/calculations.js',
  '/js/charts.js',
  '/js/daily_checkin.js',
  '/js/room_engineering.js',
  '/dari_luxe_logo.png',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching fresh assets v22...');
      return cache.addAll(STATIC_ASSETS).catch(e => console.warn(e));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Network-First for HTML and JS scripts (always serve fresh code immediately)
  if (req.mode === 'navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(req).then(networkResp => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return networkResp;
      }).catch(() => {
        return caches.match(req).then(cached => cached || (req.mode === 'navigate' ? caches.match('/index.html') : null));
      })
    );
    return;
  }

  // Cache-First for static images/fonts
  event.respondWith(
    caches.match(req).then(cached => {
      return cached || fetch(req).then(networkResp => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return networkResp;
      });
    })
  );
});
