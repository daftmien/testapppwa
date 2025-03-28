
// Liste des fichiers à mettre en cache
const CACHE_NAME = "solo-rouge-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/save_restore_slides.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/sw.js",
  "/audio/background.mp3", // Ajouter les fichiers audio ici
  "/audio/effect1.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📥 Mise en cache des fichiers essentiels");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log("🗑 Suppression de l'ancien cache :", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      if (event.request.destination === "document") {
        return caches.match("/index.html");
      }
    })
  );
});
