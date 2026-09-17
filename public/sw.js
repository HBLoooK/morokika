const CACHE = 'morokika-store-v7'
const CORE = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/fonts/dm-sans-400.ttf',
  '/fonts/dm-sans-500.ttf',
  '/fonts/dm-sans-600.ttf',
  '/fonts/italiana-400.ttf',
  '/fonts/fraunces-400.ttf',
  '/fonts/fraunces-500.ttf',
  '/fonts/fraunces-italic-400.ttf',
  '/fonts/fraunces-italic-500.ttf',
  '/images/hero-cake.webp',
  '/images/pistachio-blossom.webp',
  '/images/atlas-chocolate.webp',
  '/images/rose-raspberry.webp',
  '/images/collection-anniversaires.webp',
  '/images/citrus-saffron.webp',
  '/images/date-caramel.webp',
  '/images/vanilla-fig.webp',
  '/images/praline-coffee.webp',
  '/images/berry-cheesecake.webp',
  '/images/signature-box.webp',
  '/images/atelier-detail.webp',
  '/images/story-ingredients.webp',
  '/images/story-atelier.webp',
  '/images/story-table.webp'
]

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('morokika-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || request.headers.has('authorization')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then(cache => cache.put('/', copy))
          }
          return response
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone()
        caches.open(CACHE).then(cache => cache.put(request, copy))
      }
      return response
    }))
  )
})
