(function() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", registerServiceWorkers);
  }
  
  function registerServiceWorkers() {
    const urlsToChache = {
      type: "CACHE_URLS",
      payload: [
        location.href,
        ...performance.getEntriesByType("resource").map((r) => r.name),
      ],
    };
    navigator.serviceWorker
      .register("../sw-cache-resource.js")
      .then((reg) => {
        console.log("Service Worker is registered");
  
        if (reg.installing) {
          console.log("Sending INITIAL message with resurces to chache...");
          reg.installing.postMessage(urlsToChache);
        } else if (reg.waiting) {
          console.log("Sending UPDATE message with resurces to chache...");
          reg.waiting.postMessage(urlsToChache);
        } else if (reg.active) {
          console.log("Sending UPDATE message with resurces to chache...");
          reg.active.postMessage(urlsToChache);
        }
      })
      .catch((e) => {
        console.error("Register was failed with", e);
      });
  }
})()
