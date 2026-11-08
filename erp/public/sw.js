/**
 * DARI LUXE ERP — High-Performance Offline PWA Service Worker
 * Ensures the app opens instantly on mobile & desktop even on construction sites
 * with poor or zero internet connectivity.
 */

const CACHE_NAME = 'dariluxe-erp-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/db.js',
  '/js/calculations.js',
  '/js/charts.js',
  '/js/daily_checkin.js',
  '/dari_luxe_logo.png',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

// Install: Precache all essential local app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching DARI LUXE ERP static assets...');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Cache addAll warning (some asset skipped):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart Caching Strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Only handle GET requests
  if (req.method !== 'GET') return;

  // 2. Local API requests (/api/): Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(JSON.stringify({ offline: true, message: 'Offline mode active' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 3. Static local files & CDN resources (Stale-While-Revalidate)
  event.respondWith(
    caches.match(req).then(cachedResp => {
      const fetchPromise = fetch(req).then(networkResp => {
        if (networkResp && networkResp.status === 200) {
          const clone = networkResp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return networkResp;
      }).catch(() => {
        // Fallback for HTML navigation requests if offline
        if (req.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return cachedResp;
      });

      return cachedResp || fetchPromise;
    })
  );
});
