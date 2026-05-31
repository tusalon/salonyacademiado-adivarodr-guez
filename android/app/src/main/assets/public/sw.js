// sw.js - Service Worker para SalÃ³n Academia DoÃ±a Diva RodrÃ­guez 

const CACHE_NAME = 'salonyacademiado-adivarodr-guez-v48';
const urlsToCache = [
  '/salonyacademiado-adivarodr-guez/',
  '/salonyacademiado-adivarodr-guez/index.html',
  '/salonyacademiado-adivarodr-guez/admin.html',
  '/salonyacademiado-adivarodr-guez/admin-login.html',
  '/salonyacademiado-adivarodr-guez/calendar.html',
  '/salonyacademiado-adivarodr-guez/setup-wizard.html',
  '/salonyacademiado-adivarodr-guez/editar-negocio.html',
  '/salonyacademiado-adivarodr-guez/manifest.json',
  '/salonyacademiado-adivarodr-guez/icons/icon-72x72.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-96x96.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-128x128.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-144x144.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-152x152.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-192x192.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-384x384.png',
  '/salonyacademiado-adivarodr-guez/icons/icon-512x512.png',
  '/salonyacademiado-adivarodr-guez/vendor/react.production.min.js',
  '/salonyacademiado-adivarodr-guez/vendor/react-dom.production.min.js',
  '/salonyacademiado-adivarodr-guez/vendor/babel.min.js',
  '/salonyacademiado-adivarodr-guez/vendor/bcrypt.min.js',
  '/salonyacademiado-adivarodr-guez/vendor/tailwind-browser.js',
  '/salonyacademiado-adivarodr-guez/vendor/lucide/lucide.css',
  '/salonyacademiado-adivarodr-guez/vendor/lucide/lucide.woff2'
];

// ============================================
// INSTALACIÃ“N
// ============================================
self.addEventListener('install', event => {
  console.log('ðŸ“¦ ðŸ“¦ Service Worker instalando...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('âœ… Cache creado, guardando archivos...');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('âŒ Error al cachear archivos:', error);
      })
  );
});

// ============================================
// ACTIVACIÃ“N
// ============================================
self.addEventListener('activate', event => {
  console.log('ðŸ”„ ðŸ”„ Service Worker activado, limpiando caches antiguos...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('ðŸ—‘ï¸ ðŸ—‘ï¸ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('âœ… Service Worker activado y listo');
      return self.clients.claim();
    })
  );
});

// ============================================
// ESTRATEGIA DE CACHÃ‰
// ============================================
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean HTTP
  if (!event.request.url.startsWith('http')) return;
  
  // âš¡ âš ï¸ NO INTERCEPTAR WHATSAPP (ESENCIAL PARA iOS)
  if (event.request.url.includes('wa.me') || 
      event.request.url.includes('api.whatsapp.com') ||
      event.request.url.includes('whatsapp.com')) {
    console.log('ðŸ“± ðŸ“± Dejando pasar WhatsApp sin cache');
    return;
  }
  
  // Ignorar otras APIs externas
  if (event.request.url.includes('supabase.co')) return;
  if (event.request.url.includes('ntfy.sh')) return;
  if (event.request.url.includes('unsplash.com')) return;
  if (event.request.url.includes('cdn.') || 
      event.request.url.includes('unpkg.com') || 
      event.request.url.includes('trickle.so')) {
    return;
  }

  // Estrategia: Network First, fallback a cache
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si la respuesta es vÃ¡lida, guardar en cache
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('ðŸ“¦ ðŸ“¦ Sirviendo desde cache:', event.request.url);
            return cachedResponse;
          }
          // Si no hay cache y es imagen, devolver icon por defecto
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
            return caches.match('/salonyacademiado-adivarodr-guez/icons/icon-192x192.png');
          }
          return new Response('Error de red', { status: 408 });
        });
      })
  );
});

// ============================================
// MANEJO DE MENSAJES
// ============================================
self.addEventListener('message', event => {
  console.log('ðŸ“¨ ðŸ“„ Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('â© â© Saltando waiting...');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('ðŸ§¹ ðŸ§¹ Limpiando todo el cache...');
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log('ðŸ—‘ï¸ ðŸ—‘ï¸ Cache eliminado:', cacheName);
      });
    });
  }
});

console.log('âœ… Service Worker configurado para SalÃ³n Academia DoÃ±a Diva RodrÃ­guez ');
console.log('ðŸ“¦ Cache:', CACHE_NAME);
console.log('ðŸ“„ Archivos a cachear:', urlsToCache.length);

