const CACHE_NAME = 'autocomplaint-v1';
const urlsToCache = [
    '/',
    '/manifest.json',
    '/src/css/style.css',
    '/src/css/responsive.css',
    '/src/js/app.js',
    '/src/js/api.js',
    '/src/js/bookmarkManager.js',
    '/src/js/formHandler.js',
    '/src/js/pwa.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});