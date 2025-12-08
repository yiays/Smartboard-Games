const CACHE_VER = 'v0.0.7';
const CACHE_FILES = [
  '/',
  '/common.js',
  '/common.css',
  '//cdn.yiays.com/jquery-3.7.1.min.js',
  '//cdn.yiays.com/yiaycons/yiaycons.css',
  '//fonts.googleapis.com/css2?family=Roboto:wght@400;900&display=swap',
  '/trivia/5secondrule.html',
  '/trivia/flashcards.html',
  '/trivia/flashcards.json',
  '/stem/magicsquares.html',
  '/stem/quickmaths.html',
  '/english/anagrams.html',
  '/english/dictionary.txt',
  '/fun/marbles.html'
];

// Install procedure
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VER)
    .then((cache) => {
      cache.addAll(CACHE_FILES);
    })
  )
});

// Caching
// helper to normalize cache keys (strip query for same-origin)
function normalizeCacheKey(requestOrUrl) {
  const url = typeof requestOrUrl === 'string'
    ? new URL(requestOrUrl, self.location.origin)
    : new URL(requestOrUrl.url);
  // For same-origin requests use origin+pathname so query params are ignored
  if (url.origin === self.location.origin) return url.origin + url.pathname;
  // For cross-origin keep full href
  return url.href;
}

self.addEventListener('fetch', (e) => {
  const cacheKey = normalizeCacheKey(e.request);

  e.respondWith(
    caches.match(cacheKey)
    .then((res) => {
      if(res) return res; // Cache hit

      // Cache miss
      var url = e.request.clone();
      return fetch(url).then((nres) => {
        if(!nres || nres.status !== 200 || nres.type !== 'basic')
          return nres;
        
        if(cacheKey in CACHE_FILES) {
          // Cache the result now
          var newfile = nres.clone();

          caches.open(CACHE_VER)
          .then((cache) => {
            cache.put(cacheKey, newfile);
          });
        }

        return nres;
      })
    })
  )
});

// Deleting old cache versions on update
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
    .then((keys) => {
      return Promise.all(keys.map((key, i) => {
        if(key !== CACHE_VER){
          return caches.delete(keys[i]);
        }
      }));
    })
  );
});