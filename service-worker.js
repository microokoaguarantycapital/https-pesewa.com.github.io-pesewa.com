/**
 * Pesewa.com Service Worker
 * Provides offline capabilities and PWA features
 */

const CACHE_NAME = 'pesewa-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/pages/dashboard.html',
  '/pages/groups.html',
  '/pages/lending.html',
  '/pages/borrowing.html',
  '/pages/ledger.html',
  '/pages/blacklist.html',
  '/pages/debt-collectors.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700&display=swap',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip Firebase and external API requests
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('cdnjs')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if found
        if (response) {
          return response;
        }

        // Clone the request because it can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it can only be used once
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(error => {
          // If both cache and network fail, show offline page
          console.log('Service Worker: Fetch failed; returning offline page', error);
          
          // For navigation requests, return offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // For other requests, return a custom offline response
          return new Response(JSON.stringify({
            error: 'You are offline. Please check your internet connection.',
            timestamp: new Date().toISOString()
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-loan-requests') {
    event.waitUntil(syncLoanRequests());
  }
});

async function syncLoanRequests() {
  try {
    const db = await openIndexedDB();
    const requests = await getAllFromIndexedDB(db, 'loanRequests');
    
    for (const request of requests) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/loans/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request.data)
        });
        
        if (response.ok) {
          // Remove from IndexedDB if successful
          await deleteFromIndexedDB(db, 'loanRequests', request.id);
        }
      } catch (error) {
        console.error('Failed to sync loan request:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// IndexedDB helper functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pesewa-offline', 1);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object store for offline loan requests
      if (!db.objectStoreNames.contains('loanRequests')) {
        const store = db.createObjectStore('loanRequests', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create object store for offline repayments
      if (!db.objectStoreNames.contains('repayments')) {
        const store = db.createObjectStore('repayments', { keyPath: 'id', autoIncrement: true });
        store.createIndex('loanId', 'loanId', { unique: false });
      }
    };
    
    request.onsuccess = event => resolve(event.target.result);
    request.onerror = event => reject(event.target.error);
  });
}

function getAllFromIndexedDB(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromIndexedDB(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from Pesewa.com',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Pesewa.com', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
    );
  }
});

// Periodic background sync for updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateCachedContent());
  }
});

async function updateCachedContent() {
  const cache = await caches.open(CACHE_NAME);
  
  for (const url of urlsToCache) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.log(`Failed to update ${url}:`, error);
    }
  }
}

// Message handling for background sync requests
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SYNC_LOAN_REQUEST') {
    event.waitUntil(storeLoanRequest(event.data.loanRequest));
  }
});

async function storeLoanRequest(loanRequest) {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction(['loanRequests'], 'readwrite');
    const store = transaction.objectStore('loanRequests');
    
    await store.add({
      data: loanRequest,
      timestamp: Date.now()
    });
    
    // Register for background sync
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-loan-requests');
    }
  } catch (error) {
    console.error('Failed to store loan request:', error);
  }
}