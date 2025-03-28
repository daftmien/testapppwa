 
// Nom du cache
const CACHE_NAME = "solo-rouge-cache-v9";

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

// Installation du Service Worker et mise en cache immédiate de TOUS les fichiers
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📥 Mise en cache FORCÉE de tous les fichiers...");
      return cache.addAll(FILES_TO_CACHE);
    }).catch(err => console.warn("⚠️ Erreur lors de la mise en cache :", err))
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

// Gestion des requêtes réseau avec fallback au cache (garantie que tout marche hors-ligne)
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
      // Fallback pour assurer que tout fonctionne hors-ligne
      if (event.request.destination === "document" || event.request.mode === "navigate") {
        console.warn("📄 Fallback : Chargement de index.html hors-ligne");
        return caches.match("/index.html");
      } else if (event.request.destination === "audio") {
        console.warn("🎵 Fallback : Chargement d'un fichier audio depuis le cache pour :", event.request.url);
        return caches.match(event.request.url);
      } else if (event.request.destination === "image") {
        console.warn("🖼 Fallback : Chargement d'une image depuis le cache pour :", event.request.url);
        return caches.match(event.request.url);
      } else {
        console.warn("🚫 Fichier non trouvé dans le cache :", event.request.url);
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
