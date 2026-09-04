const CACHE_NAME = "clima-app-v8";

const ARQUIVOS_PARA_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


// ============================================
// INSTALAÇÃO
// ============================================

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then((cache) => {

                return cache.addAll(
                    ARQUIVOS_PARA_CACHE
                );

            })

    );

    self.skipWaiting();
});


// ============================================
// ATIVAÇÃO
// ============================================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
            .then((nomesDosCaches) => {

                return Promise.all(

                    nomesDosCaches
                        .filter(
                            (nome) =>
                                nome !== CACHE_NAME
                        )
                        .map(
                            (nome) =>
                                caches.delete(nome)
                        )

                );

            })

    );

    self.clients.claim();
});


// ============================================
// REQUISIÇÕES
// ============================================

self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request)
            .then((resposta) => {

                if (resposta) {
                    return resposta;
                }

                return fetch(event.request);

            })

    );

});