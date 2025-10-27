const CACHE_NAME = "eloity-v1.0.0";
const STATIC_CACHE = "eloity-static-v1.0.0";
const DYNAMIC_CACHE = "eloity-dynamic-v1.0.0";

// Files to cache for offline use
const STATIC_FILES = [
  "/",
  "/app/feed",
  "/marketplace",
  "/crypto",
  "/messages",
  "/profile",
  "/rewards",
  "/offline.html",
  "/manifest.json",
  // Add critical CSS and JS files here
];

// API endpoints that can work offline
const CACHEABLE_APIS = [
  "/api/user/profile",
  "/api/notifications",
  "/api/rewards",
];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("SW: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("SW: Static files cached");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("SW: Failed to cache static files", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("SW: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("SW: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("SW: Activated");
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith("http")) return;

  // Skip API requests, Bybit requests, and other external API calls
  if (
    url.pathname.startsWith("/api/") || 
    url.hostname.includes("bybit.com") ||
    url.hostname.includes("coingecko.com") ||
    url.hostname.includes("supabase.co") ||
    request.headers.get('accept')?.includes('application/json') ||
    request.headers.get('content-type')?.includes('application/json')
  ) {
    // For API requests, bypass cache and go directly to network
    return;
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("SW: Network failed for navigation, checking cache");

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    const offlinePage = await caches.match("/offline.html");
    if (offlinePage) {
      return offlinePage;
    }

    // Fallback response
    return new Response(
      "<html><body><h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p></body></html>",
      { headers: { "Content-Type": "text/html" } },
    );
  }
}

// Handle API requests with cache-first for specific endpoints
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheableAPI = CACHEABLE_APIS.some((api) =>
    url.pathname.startsWith(api),
  );

  if (isCacheableAPI && request.method === "GET") {
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Return cached response and update in background
        fetchAndCache(request);
        return cachedResponse;
      }

      return await fetchAndCache(request);
    } catch (error) {
      console.log("SW: API request failed", error);
      return new Response(
        JSON.stringify({ error: "Network unavailable", offline: true }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // For non-cacheable APIs, just try network
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Network unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses for static assets only
    if (networkResponse.status === 200 && request.destination !== 'document') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("SW: Failed to fetch static asset", error);

    // Return a fallback for images
    if (request.destination === "image") {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image unavailable</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } },
      );
    }

    throw error;
  }
}

// Fetch and cache helper function
async function fetchAndCache(request) {
  const networkResponse = await fetch(request);

  if (networkResponse.status === 200) {
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("SW: Background sync triggered", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error("SW: Failed to process offline action", error);
      }
    }
  } catch (error) {
    console.error("SW: Background sync failed", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("SW: Push notification received");

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error("SW: Failed to parse push data", error);
      data = { title: "New notification", body: "You have a new update" };
    }
  }

  const options = {
    body: data.body || "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    image: data.image,
    data: data.data || {},
    actions: data.actions || [
      {
        action: "view",
        title: "View",
        icon: "/icons/view-icon.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/dismiss-icon.png",
      },
    ],
    requireInteraction: data.urgent || false,
    silent: false,
    tag: data.tag || "general",
    renotify: true,
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Eloity", options),
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("SW: Notification clicked", event.action);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no matching client is found, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

// Handle share target
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === "/share" && event.request.method === "POST") {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  const formData = await request.formData();
  const title = formData.get("title") || "";
  const text = formData.get("text") || "";
  const url = formData.get("url") || "";
  const files = formData.getAll("files");

  // Store shared data for the main app to retrieve
  const sharedData = { title, text, url, files: files.length };

  // Store in cache or IndexedDB for the main app to access
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.put(
    "/shared-data",
    new Response(JSON.stringify(sharedData), {
      headers: { "Content-Type": "application/json" },
    }),
  );

  // Redirect to the create post page
  return Response.redirect("/create?shared=true", 302);
}

// Utility functions for IndexedDB operations
async function getOfflineActions() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function processOfflineAction(action) {
  // Implementation would process queued offline actions
  console.log("Processing offline action:", action);
}

async function removeOfflineAction(id) {
  // Implementation would remove processed action from IndexedDB
  console.log("Removing offline action:", id);
}

// Cache size management
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    const deleteCount = keys.length - maxSize;
    const keysToDelete = keys.slice(0, deleteCount);

    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
  }
}

// Periodic cache cleanup
setInterval(() => {
  limitCacheSize(DYNAMIC_CACHE, 100); // Keep last 100 dynamic cache entries
}, 300000); // Every 5 minutes

console.log("SW: Service Worker script loaded");