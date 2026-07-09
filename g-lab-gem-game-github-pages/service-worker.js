// g-Lab Gem Game v111 — final ring allows gem overlap like other stones
const CACHE_NAME = 'g-lab-gem-game-v111-final-ring-overlap';
const ASSETS = [
  './', './index.html', './style.css', './app.js?v=111', './manifest.webmanifest?v=111',
  './assets/outer-bg-art-nouveau.png', './assets/board-bg-v89.png?v=89', './assets/g-lab-logo.jpg',
  './assets/gem-assets/00-garnet.png', './assets/gem-assets/01-amethyst.png',
  './assets/gem-assets/02-aquamarine.png', './assets/gem-assets/03-diamond.png',
  './assets/gem-assets/04-emerald.png', './assets/gem-assets/05-pearl.png',
  './assets/gem-assets/06-ruby.png', './assets/gem-assets/07-peridot.png',
  './assets/gem-assets/08-sapphire.png', './assets/gem-assets/09-opal.png',
  './assets/gem-assets/10-topaz.png', './assets/gem-assets/11-turquoise.png',
  './assets/gem-assets/12-final-ring.png',
  './assets/flower-assets/ume-v89.png?v=89',
  './assets/flower-assets/shakuyaku-v89.png?v=89',
  './assets/flower-assets/kiku-v89.png?v=89',
  './assets/flower-assets/botan-v89.png?v=89',
  './assets/flower-assets/botan-variegated-v89.png?v=89',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const needsFreshCopy =
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/app.js') ||
    url.pathname.includes('/assets/flower-assets/');

  if (needsFreshCopy) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
