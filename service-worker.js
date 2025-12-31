const CACHE_VER = 'v0.1.2';
const CACHE_FILES = [
  '/',
  '/common.js',
  '/common.css',
  '//cdn.yiays.com/jquery-3.7.1.min.js',
  '//cdn.yiays.com/yiaycons/yiaycons.css',
  '//cdn.yiays.com/yiaycons/fonts/yiaycons.woff?xmc8zi',
  '/trivia/5secondrule.html',
  '/trivia/flashcards.html',
  '/trivia/flashcards.json',
  '/stem/magicsquares.html',
  '/stem/quickmaths.html',
  '/english/anagrams.html',
  '/english/dictionary.txt',
  '/fun/marbles.html'
];

let state = {
  _online: navigator.onLine,
  set online(value) {
    if(this._online == value) return;
    this._online = value;
    // Notify all open clients that the online state has changed
    return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'NEW_STATE', online: value });
      });
    });
  },
  get online() {
    return this._online;
  }
};

// Update online variable as status changes
self.addEventListener('online', () => state.online=true);
self.addEventListener('offline', () => state.online=false);



// Install procedure
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VER)
    .then(cache => {
      return cache.addAll(CACHE_FILES);
    })
    .catch(e => console.error)
    .then(() => {
      // Notify all open clients that a new service worker was installed and is waiting
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'NEW_SW_WAITING', version: CACHE_VER });
        });
      });
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
  const url = new URL(e.request.url);
  // Only handle same-origin requests to avoid interfering with extensions and external services like Cloudflare
  if (url.origin !== self.location.origin && !url.origin.endsWith('yiays.com')) return;

  const cacheKey = normalizeCacheKey(e.request);

  if(self.location.host.startsWith("127.0.0.1")) {
    // This is a development environment, update local files instantly
    if(new URL(e.request.url).origin == self.location.origin) {
      e.respondWith(fetchAndCache(cacheKey, e.request.clone()));
      return;
    }
  }
  else if(state.online) {
    // Always fetch fresh files when online
    e.respondWith(fetchAndCache(cacheKey, e.request.clone()));
    return;
  }

  // In any other case, attempt to load from cache first, then fetch
  e.respondWith(
    caches.match(cacheKey).then((res) => {
      if(res) return res; // Cache hit

      // Cache miss
      return fetchAndCache(cacheKey, e.request.clone());
    })
  );
});

async function fetchAndCache(cacheKey, url) {
  try {
    const res = await fetch(url);
    if (res && res.status == 200 && res.type == 'basic') {
      let resUrl = new URL(res.url);
      if(!state.online && !resUrl.host.startsWith('127.0.0.1') && resUrl.protocol.startsWith('http')) {
        state.online = true;
        console.log(`Online because ${res.url} loaded successfully`);
      }
      
      if (cacheKey in CACHE_FILES) {
        // Cache the result now
        var newfile = res.clone();

        caches.open(CACHE_VER)
        .then((cache) => {
          cache.put(cacheKey, newfile);
        });
      }
    }
    return res;
  } catch (e) {
    state.online = false;
    console.error(e);
    let res = await caches.match(cacheKey);
    if(res) return res;
    console.error(`Failed to fetch ${cacheKey}, additionally, could not retrieve from cache.`);
    return new Response(null);
  }
}

// Deleting old cache versions on update
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
    .then((keys) => {
      return Promise.all(keys.map((key, i) => {
        if(key !== CACHE_VER){
          return caches.delete(keys[i]);
        }
        return Promise.resolve();
      }));
    })
  );
});

// Listen for client messages (e.g., ask the waiting SW to skipWaiting)
self.addEventListener('message', (event) => {
  if(event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }else if(event.data && event.data.type == 'GET_VER') {
    event.ports[0].postMessage({version: CACHE_VER});
  }else if(event.data && event.data.type == 'GET_STATE') {
    event.ports[0].postMessage({online: state.online});
  }
});