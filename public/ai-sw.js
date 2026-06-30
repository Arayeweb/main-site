/* Araaye AI — lightweight service worker (scope: /ai)
   Goal: make the app installable + a graceful offline fallback.
   Strategy: network-first for navigations (always fresh AI app),
   stale-while-revalidate for static assets. No aggressive caching
   of API/chat responses — those must stay live. */

const VERSION = "araaye-ai-v1";
const ASSET_CACHE = `${VERSION}-assets`;
const PAGE_CACHE = `${VERSION}-pages`;

// Only cache GET requests for these static asset types.
const ASSET_DEST = new Set(["style", "script", "image", "font"]);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API / auth / chat streaming — keep it live.
  if (url.pathname.startsWith("/api/")) return;

  // App navigations: network-first, fall back to cache when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(PAGE_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (err) {
          const cached = await caches.match(request);
          return cached || (await caches.match("/ai")) || Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (ASSET_DEST.has(request.destination)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((resp) => {
            if (resp && resp.status === 200) cache.put(request, resp.clone());
            return resp;
          })
          .catch(() => cached);
        return cached || network;
      })()
    );
  }
});
