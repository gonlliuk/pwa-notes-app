const resourceCache = "resource-cache-v2";

// Install event
self.addEventListener("install", (event) => {
  console.log("Servise Worker: is Installed.");
});

// Message event
self.addEventListener("message", (event) => {
  console.log("Servise Worker: waiting for messages...");

  if (event.data.type === "CACHE_URLS") {
    console.log("Servise Worker: recieved message with resources to chache.");
    event.waitUntil(
      caches
        .open(resourceCache)
        .then((cache) => {
          return cache.addAll(event.data.payload);
        })
        .then(() => {
          console.log("Servise Worker: all resources are cached.");
          self.skipWaiting();
        })
    );
  }
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Servise Worker: is Activated.");
  event.waitUntil(
    caches.keys().then((cacheKeys) => {
      console.log("Servise Worker: removing unused caches.");
      return Promise.all(
        cacheKeys
          .filter((key) => key !== resourceCache)
          .map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("Servise Worker: is Fetching...");
  event.respondWith(
    fetch(event.request).catch(() => {
      if (!event.request.url.includes("/api")) {
        return caches.match(event.request).then((res) => res);
      }
    })
  );
});
