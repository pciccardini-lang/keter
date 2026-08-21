// Service worker di Keter — v2
//
// Tre livelli di cache si sovrappongono: la CDN di GitHub Pages, la cache HTTP
// del browser e questa. Un semplice fetch(req) consulta la cache HTTP prima di
// andare in rete, quindi il "network-first" della v1 restituiva file vecchi
// senza accorgersene. Qui i file che cambiano a ogni pubblicazione vengono
// richiesti con un parametro anticache e cache:'no-store', che scavalca sia il
// browser sia la CDN. Il resto (icone, manifest, librerie CDN) resta cache-first.

const CACHE = 'keter-v2';

const APP_SHELL = [
  './',
  './index.html',
  './data.js',
  './modifiche.json',
  './app.jsx',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
];

// File che devono essere sempre freschi
const FRESH_PATTERN = /(\/|\/index\.html|\/data\.js|\/modifiche\.json|\/app\.jsx)$/;

function isFresh(url) {
  return FRESH_PATTERN.test(url.pathname);
}

// Richiesta che aggira cache HTTP e CDN: URL diverso + no-store
function bustedRequest(input) {
  const u = new URL(typeof input === 'string' ? input : input.url, self.location.href);
  u.searchParams.set('_sw', Date.now());
  return new Request(u.toString(), { cache: 'no-store', credentials: 'same-origin' });
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Ogni file singolarmente: se uno manca, l'installazione non fallisce
      Promise.all(
        APP_SHELL.map((path) => {
          const url = new URL(path, self.location.href);
          const req = isFresh(url) ? bustedRequest(url) : new Request(url.toString());
          return fetch(req)
            .then((res) => (res && res.ok ? cache.put(url.toString(), res) : null))
            .catch(() => null);
        })
      )
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Mai intercettare le chiamate all'API Anthropic
  if (url.hostname === 'api.anthropic.com') return;

  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin && isFresh(url)) {
    // Sempre dalla rete vera, cache solo come riserva offline
    event.respondWith(
      fetch(bustedRequest(url))
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            // Si salva con l'URL pulito, senza il parametro anticache
            caches.open(CACHE).then((cache) => cache.put(url.pathname + url.search, copy));
          }
          return res;
        })
        .catch(() =>
          caches
            .match(url.pathname + url.search)
            .then((c) => c || caches.match('./index.html'))
        )
    );
    return;
  }

  if (sameOrigin) {
    // Altri file dello stesso dominio: network-first classico
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  // Librerie CDN e font: cache-first, le versioni sono fissate
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
    )
  );
});
