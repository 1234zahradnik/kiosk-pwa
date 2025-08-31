const CACHE = "kiosk-cache-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest"];
self.addEventListener("install", (evt) => {
  evt.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", (evt) => {
  evt.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (evt) => {
  const req = evt.request;
  evt.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      // Optionally cache GETs
      if (req.method === "GET") {
        const respClone = resp.clone();
        caches.open(CACHE).then(c => c.put(req, respClone));
      }
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});

// Background sync to flush local queued submissions
self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-submissions') {
    event.waitUntil(flushQueue());
  }
});

async function flushQueue() {
  const clientsArr = await self.clients.matchAll();
  for (const client of clientsArr) {
    try {
      const res = await client.postMessage({ type: "REQUEST_QUEUE" });
    } catch (e) { /* ignore */ }
  }
};