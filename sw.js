
// Nom du cache
const CACHE_NAME = "solo-rouge-cache-v2";

// Liste des fichiers à mettre en cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/save_restore_slides.js",
  "/manifest.json",
  "/sw.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/audio/background.mp3", // Remplace par le bon chemin de tes fichiers audio
  "/audio/effect1.mp3",
  "/audio/effect2.mp3"
];

// Installation du Service Worker et mise en cache des fichiers essentiels
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📥 Mise en cache des fichiers essentiels...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation du Service Worker et suppression des anciens caches
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
  self.clients.claim();
});

// Gestion des requêtes réseau avec fallback au cache
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Met en cache les nouvelles ressources (sauf celles venant de sources externes)
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      // Si hors-ligne et ressource introuvable, fournir une page de secours
      if (event.request.destination === "document") {
        return caches.match("/index.html");
      }
    })
  );
});
