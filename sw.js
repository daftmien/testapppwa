 
// Nom du cache
const CACHE_NAME = "pwa-cache-v1";

// Installation du Service Worker et mise en cache dynamique
self.addEventListener("install", event => {
    self.skipWaiting();
    console.log("📥 Service Worker installé - Prêt pour la mise en cache dynamique !");
});

// Activation et suppression des anciens caches
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

// Interception des requêtes et mise en cache dynamique
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    // Mise en cache uniquement des requêtes réussies
                    if (networkResponse && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                        console.log(`✅ Fichier mis en cache dynamiquement : ${event.request.url}`);
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            // Fallback pour assurer le mode hors-ligne total
            if (event.request.destination === "document" || event.request.mode === "navigate") {
                console.warn("📄 Fallback : Chargement de index.html hors-ligne");
                return caches.match("/index.html");
            }
        })
    );
});

// Vérification après installation pour voir les fichiers réellement en cache
self.addEventListener("message", event => {
    if (event.data && event.data.type === "CHECK_CACHE") {
        caches.open(CACHE_NAME).then(cache => {
            cache.keys().then(keys => {
                console.log("🔍 Fichiers actuellement en cache :", keys.map(request => request.url));
            });
        });
    }
});
