const cacheName = "kapitelweise-detail-v1";
const apiCacheName = "kapitelweise-api";
const filesToCache = [
  "./html/bookClub.html",
  "./css/common.css",
  "./css/bookClub.css",
  "./js/config.js",
  "./js/offlineCache.js",
  "./js/register-sw.js",
  "./js/pages/bookClub.js",
  "./js/pages/bookClubView.js",
  "./js/api/bookApi.js",
  "./js/api/clubApi.js",
  "./js/api/graphqlRequest.js",
  "./js/api/meetingApi.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js",
  "https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js",
];
const staticHosts = [self.location.host, "cdn.jsdelivr.net", "ajax.googleapis.com"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => cache.addAll(filesToCache)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== cacheName && key !== apiCacheName)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  const targetCache = staticHosts.includes(url.host) ? cacheName : apiCacheName;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(targetCache).then((cache) => cache.put(e.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(e.request, { ignoreSearch: e.request.mode === "navigate" })
          .then((cached) => cached || Response.error()),
      ),
  );
});
