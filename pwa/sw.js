
console.log('Script loaded!')
var cacheStorageKey = 'pwa-test-1'

var cacheList = [
  '/',
  "index.html",
  "favicon.png"
]



self.addEventListener('install', function(e) {
  console.log('Cache event!')
  e.waitUntil(
    caches.open(cacheStorageKey).then(function(cache) {
      console.log('Adding to Cache:', cacheList)
      return cache.addAll(cacheList)
    }).then(function() {
      console.log('Skip waiting!')
      return self.skipWaiting()       // 调试时通过 skipWaiting() 来设置 skip waiting 标记,这样每次 Service Worker 安装后就会被立即激活
    })
  )
})

self.addEventListener('activate', function(e) {
  console.log('Activate event')
  e.waitUntil(
    Promise.all(
      caches.keys().then(cacheNames => {
        return cacheNames.map(name => {
          if (name !== cacheStorageKey) {
            return caches.delete(name)
          }
        })
      })
    ).then(() => {
      console.log('Clients claims.')
      console.log(self.clients)
      return self.clients.claim()
    })
  )
   return self.clients.matchAll()
    .then(function (clients) {
        if (clients && clients.length) {
            clients.forEach(function (client) {
                client.postMessage({
                  cacheKey: cacheStorageKey
                });
            })
        }
    })
})

self.addEventListener('fetch', function(e) {
  // console.log('Fetch event:', e.request.url)
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response != null) {
        console.log('Using cache for:', e.request.url)
        return response
      }
      console.log('Fallback to fetch:', e.request.url)
      return fetch(e.request.url)
    })
  )
})

