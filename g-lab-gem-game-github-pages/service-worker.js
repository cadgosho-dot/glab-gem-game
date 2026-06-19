const CACHE_NAME = 'g-lab-gem-game-github-pages-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './assets/outer-bg-art-nouveau.png',
  './assets/g-lab-logo.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './assets/gem-assets/00-garnet.png',
  './assets/gem-assets/01-amethyst.png',
  './assets/gem-assets/02-aquamarine.png',
  './assets/gem-assets/03-diamond.png',
  './assets/gem-assets/04-emerald.png',
  './assets/gem-assets/05-pearl.png',
  './assets/gem-assets/06-ruby.png',
  './assets/gem-assets/07-peridot.png',
  './assets/gem-assets/08-sapphire.png',
  './assets/gem-assets/09-opal.png',
  './assets/gem-assets/10-topaz.png',
  './assets/gem-assets/11-turquoise.png',
  './assets/gem-assets/12-final-ring.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
