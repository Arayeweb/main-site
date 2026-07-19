/* Araaye AI — lightweight service worker (scope: /ai/) */
const CACHE_VERSION = "ar-ai-v1";
const PRECACHE = [
  "/ai-offline.html",
  "/ai.webmanifest",
  "/assets/ai-icon-192.png",
  "/assets/ai-icon-512.png",
  "/assets/ai-icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ar-ai-") && key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".webmanifest")
  );
}

function isAiNavigation(request, url) {
  if (request.mode !== "navigate") return false;
  return url.pathname === "/ai" || url.pathname.startsWith("/ai/");
}

async function networkFirstNavigation(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch {
    const cached = await caches.match("/ai-offline.html");
    return (
      cached ||
      new Response("آفلاین هستید. لطفاً اتصال اینترنت را بررسی کنید.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    return (
      (await caches.match(request)) ||
      new Response("", { status: 504, statusText: "Offline" })
    );
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Never cache API / auth / streaming responses
  if (isApiRequest(url)) return;

  if (isAiNavigation(request, url)) {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
