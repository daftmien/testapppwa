 
// Nom du cache
const CACHE_NAME = "pwa-cache-v3";

// Installation du Service Worker et pré-chargement en cache
self.addEventListener("install", event => {
    console.log("📥 Service Worker installé - Prêt pour la mise en cache dynamique !");
    self.skipWaiting();
});

// Activation et suppression des anciens caches (mais conservation des fichiers déjà en cache)
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

// Interception des requêtes et mise en cache dynamique + conservation après fermeture
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                        console.log(`✅ Fichier ajouté au cache : ${event.request.url}`);
                    }
                    return networkResponse;
                });
            });
        }).catch(() => {
            // Fallback pour assurer le mode hors-ligne total
            if (event.request.destination === "document" || event.request.mode === "navigate") {
                console.warn("📄 Fallback : Chargement de index.html hors-ligne");
                return caches.match("/index.html");
            } else if (event.request.destination === "image") {
                console.warn("🖼 Fallback : Chargement d'une image depuis le cache :", event.request.url);
                return caches.match(event.request.url);
            } else if (event.request.destination === "audio") {
                console.warn("🎵 Fallback : Chargement d'un fichier audio depuis le cache :", event.request.url);
                return caches.match(event.request.url);
            } else if (event.request.destination === "script") {
                console.warn("📜 Fallback : Chargement d'un script JS depuis le cache :", event.request.url);
                return caches.match(event.request.url);
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
