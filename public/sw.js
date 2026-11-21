// Quality Games app: works offline once opened. Pages are always fetched fresh when online (so the event and
// updates are never stale); the built files (/assets/…, names change on every update) come from the cache.
const CACHE = "qsl-v1";
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/play", "/manifest.webmanifest", "/icon-192.png"]).catch(() => {})));
});
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/play", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/play").then((r) => r || caches.match("/"))),
    );
    return;
  }
  if (url.pathname.startsWith("/assets/") || /\.(png|webmanifest)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          }),
      ),
    );
  }
});
