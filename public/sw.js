var staticCacheName = 'mws-restaurant-static-v1';
var contentImgsCache = 'mws-restaurant-content-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];

self.addEventListener('install', function(event) {
  console.log("Service worker installed!");
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/index.html', //'/restaurant.html',
        '/js/main.js', 'js/restaurant_info.js', '/js/dbhelper.js',
        //'/css/styles.css', '/css/styles-responsive.css',
        '/data/restaurants.json'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('mws-restaurant-') &&
                 !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname === '/') {
      event.respondWith(serveFile('/index.html', event.request));
      return;
    }
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(serveFile('/restaurant.html', event.request));
      return;
    }
    if (requestUrl.pathname.startsWith('/img/')) {
      event.respondWith(servePhoto(event.request));
      return;
    }
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

let serveFile = (filePath, request) => {
  return new Promise(function(resolve, reject) {
    caches.match(filePath).then(res => {
      if (res) {
        resolve(res);
      } else {
        fetch(request).then(networkResponse => {
          caches.open(staticCacheName).then(function(cache) {
            cache.put(filePath, networkResponse.clone());
            resolve(networkResponse);
          });
        }, networkErr => {
          reject(networkErr);
        });
      }
    });
  });
}

let servePhoto = request => {
  var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  return caches.open(contentImgsCache).then(function(cache) {
    return cache.match(storageUrl).then(function(response) {
      let fetchedResult = fetch(request).then(function(networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });

      if (response) return response;
      return fetchedResult;
    });
  });
}

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
