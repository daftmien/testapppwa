 
// Nom du cache
const CACHE_NAME = "solo-rouge-cache-v4";

// Liste des fichiers à mettre en cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/save_restore_slides.js",
  "/manifest.json",
  "/sw.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/fonts/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2",
  "/audios/92325de9-63a1-4198-ace2-01cd48e31fcc.mpga"
];

// Installation du Service Worker et mise en cache des fichiers essentiels
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📥 Mise en cache des fichiers essentiels...");
      
      // Ajouter les fichiers un par un et ignorer ceux qui échouent
      return Promise.all(
        FILES_TO_CACHE.map(url =>
          fetch(url, { cache: "no-store" })
            .then(response => {
              if (!response.ok) {
                console.warn(`⚠️ Impossible de mettre en cache ${url} (HTTP ${response.status})`);
                return;
              }
              return cache.put(url, response);
            })
            .catch(err => console.warn(`⚠️ Erreur lors de la mise en cache de ${url}:`, err))
        )
      );
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
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch(() => {
      if (event.request.destination === "document") {
        return caches.match("/index.html");
      } else if (event.request.destination === "audio") {
        return caches.match("/audios/92325de9-63a1-4198-ace2-01cd48e31fcc.mpga");
      } else if (event.request.destination === "font") {
        return caches.match("/fonts/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2");
      }
    })
  );
});
