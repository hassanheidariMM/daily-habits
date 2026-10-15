/* ============================================
   Daily Habits - Service Worker
   نسخه ۲.۰.۰ — PWA کامل
   ============================================ */

const CACHE_VERSION = 'daily-habits-v2.0.0';
const CACHE_STATIC = 'daily-habits-static-v2';
const CACHE_DYNAMIC = 'daily-habits-dynamic-v2';

// ============ فایل‌های ضروری ============
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',
  './themes.css',
  './animations.css',
  './data.js',
  './translations.js',
  './calendar.js',
  './items.js',
  './sounds.js',
  './stats.js',
  './notifications.js',
  './diary.js',
  './backup.js',
  './settings.js',
  './premium.js',
  './ads.js',
  './main.js',
  './icons/icon.svg',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

// ============ نصب ============
self.addEventListener('install', (event) => {
  console.log('🔧 SW: نصب...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        return cache.addAll(CORE_ASSETS)
          .then(() => {
            console.log('✅ SW: فایل‌ها کش شدن');
            return self.skipWaiting();
          })
          .catch(err => {
            console.warn('⚠️ SW: خطا در کش:', err);
          });
      })
  );
});

// ============ فعال‌سازی ============
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: فعال‌سازی...');
  
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => {
              return key !== CACHE_STATIC && 
                     key !== CACHE_DYNAMIC &&
                     key !== CACHE_VERSION;
            })
            .map(key => {
              console.log('🗑️ SW: پاک کردن کش قدیمی:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// ============ Fetch ============
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // فقط GET
  if (request.method !== 'GET') return;
  
  // اسکیپ درخواست‌های خارجی
  const url = new URL(request.url);
  if (url.origin !== location.origin) {
    return;
  }
  
  // اسکیپ تبلیغات و APIها
  if (url.pathname.includes('/api/') || 
      url.pathname.includes('/ads/') ||
      url.hostname.includes('tapsell')) {
    return;
  }
  
  // استراتژی: Cache First با آپدیت پس‌زمینه
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // اگه تو کش بود
        if (cachedResponse) {
          // در پس‌زمینه آپدیت کن
          fetch(request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_DYNAMIC)
                  .then(cache => cache.put(request, responseClone))
                  .catch(() => {});
              }
            })
            .catch(() => {});
          
          return cachedResponse;
        }
        
        // اگه تو کش نبود، از شبکه بگیر
        return fetch(request)
          .then(networkResponse => {
            // اگه معتبر بود، کش کن
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_DYNAMIC)
                .then(cache => cache.put(request, responseClone))
                .catch(() => {});
            }
            
            return networkResponse;
          })
          .catch(err => {
            // اگه شبکه هم نبود
            console.log('⚠️ SW: آفلاین — درخواست:', request.url);
            
            // برای ناوبری، index.html بده
            if (request.mode === 'navigate') {
              return caches.match('./index.html');
            }
            
            // برای بقیه، خطا بده
            return new Response('آفلاین هستی', {
              status: 503,
              statusText: 'Offline',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' }
            });
          });
      })
  );
});

// ============ پیام‌ها ============
self.addEventListener('message', (event) => {
  if (!event.data) return;
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(keys => 
          Promise.all(keys.map(key => caches.delete(key)))
        )
      );
      break;
      
    case 'CACHE_URLS':
      if (payload && Array.isArray(payload)) {
        event.waitUntil(
          caches.open(CACHE_DYNAMIC)
            .then(cache => cache.addAll(payload))
            .catch(() => {})
        );
      }
      break;
      
    default:
      console.log('📬 SW: پیام ناشناخته:', type);
  }
});

// ============ Push Notification ============
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Daily Habits',
      body: event.data.text() || 'یادآوری'
    };
  }
  
  const options = {
    body: data.body || '',
    icon: data.icon || 'icons/icon-192.svg',
    badge: 'icons/icon-192.svg',
    tag: data.tag || 'daily-habits',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Daily Habits', options)
  );
});

// ============ کلیک روی اعلان ============
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || './index.html';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // اگه اپ بازه، فوکوس کن
        for (const client of clientList) {
          if (client.url.includes('index.html') && 'focus' in client) {
            return client.focus();
          }
        }
        
        // وگرنه باز کن
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============ Sync ============
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // پشتیبان‌گیری خودکار
      Promise.resolve()
    );
  }
});

// ============ Periodic Sync (اگه پشتیبانی بشه) ============
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(
      self.registration.showNotification('Daily Habits', {
        body: 'یادت نره عادت‌هات رو انجام بدی! 🌿',
        icon: 'icons/icon-192.svg',
        tag: 'daily-reminder'
      })
    );
  }
});

console.log('✅ SW: Service Worker Daily Habits v2.0.0 بارگذاری شد');