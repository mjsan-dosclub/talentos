// TalentOS Progressive Web App Service Worker (v1.0.0)
const CACHE_NAME = "talentos-cache-v1";
const PRECACHE_ASSETS = [
  "/",
  "/checkin",
  "/favicon.ico",
  "/dos-club-logo.png",
  "/manifest.webmanifest",
];

// Install: Cache offline shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[TalentOS SW] Precache non-critical warning:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-while-revalidate for static assets, network-first for APIs
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip caching for API and non-GET requests
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Offline fallback for navigations
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
      });
    })
  );
});

// Background Push Notification handling
self.addEventListener("push", (event) => {
  let data = { title: "TalentOS Announcement", body: "New update from DeScience OS Club", url: "/" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.content,
    icon: "/dos-club-logo.png",
    badge: "/favicon.ico",
    data: {
      url: data.url || "/checkin",
    },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Open TalentOS" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || "TalentOS Alert", options));
});

// Notification click behavior
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/checkin";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
