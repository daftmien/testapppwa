 
// Nom du cache
const CACHE_NAME = "solo-rouge-cache-v10";

// Liste des fichiers à mettre en cache (incluant tous les fichiers du jeu)
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/save_restore_slides.js",
  "/manifest.json",
  "/sw.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/fonts/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2",
  "/audios/slide1.mp3",
  "/audios/slide2.mp3",
  "/audios/slide3.mp3",
  "/audios/slide4.mp3",
  "/audios/slide5.mp3",
  "/images/background1.jpg",
  "/images/background2.jpg",
  "/images/background3.jpg",
  "/images/background4.jpg",
  "/images/background5.jpg"
];

// Installation du Service Worker et mise en cache des fichiers (avec gestion des erreurs)
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📥 Tentative de mise en cache des fichiers...");
      
      // Ajout des fichiers un par un et gestion des erreurs
      return Promise.allSettled(
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
    }).catch(err => console.warn("⚠️ Erreur lors de l'ouverture du cache :", err))
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
      // Fallback pour garantir le fonctionnement hors-ligne
      if (event.request.destination === "document" || event.request.mode === "navigate") {
        return caches.match("/index.html");
      } else if (event.request.destination === "audio") {
        return caches.match(event.request.url);
      } else if (event.request.destination === "image") {
        return caches.match(event.request.url);
      }
    })
  );
});

// Vérification après installation pour voir si tout est bien en cache
self.addEventListener("message", event => {
  if (event.data && event.data.type === "CHECK_CACHE") {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        console.log("🔍 Fichiers actuellement en cache :", keys.map(request => request.url));
      });
    });
  }
});
