// Cup Clash Service Worker — PWA + Web Push
const CACHE_NAME = "cupclash-v7";
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
    icon:    data.icon    ?? "/icon-192.png",
    badge:   "/icon-192.png",
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

// Client-triggered skip waiting (sent from lib/pwa.ts on update detection)
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch — network first, cache fallback
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const { url } = event.request;
  if (!url.startsWith("http")) return; // skip chrome-extension, data URIs, etc.
  const { pathname } = new URL(url);
  if (pathname.startsWith("/auth") || pathname.startsWith("/api/")) return; // never cache auth or API

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