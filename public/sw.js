// Cup Clash Service Worker — PWA + Web Push
const CACHE_NAME = "cupclash-v1";
const STATIC_ASSETS = ["/", "/dashboard", "/predictions", "/leaderboard"];

// Install — cache core routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  const options = {
    body:    data.body    ?? "Something happened in Cup Clash!",
    icon:    data.icon    ?? "/icons/icon-192.png",
    badge:   "/icons/badge-96.png",
    vibrate: [200, 100, 200],
    tag:     data.tag     ?? "cupclash",
    data:    { url: data.url ?? "/dashboard" },
    actions: data.actions ?? [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Cup Clash", options)
  );
});

// Notification click — open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// Fetch — network first, cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) return; // Never cache API calls

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});