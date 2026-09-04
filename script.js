// ============================================
// SERVICE WORKER
// ============================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registro =
                await navigator.serviceWorker.register("./sw.js");

            console.log(
                "Service Worker registrado com sucesso!"
            );

            console.log(
                "Scope:",
                registro.scope
            );

            // Verifica se o Service Worker está ativo
            if (registro.active) {

                console.log(
                    "Service Worker está ativo e funcionando!"
                );

            } else {

                console.log(
                    "Service Worker foi registrado, mas ainda está iniciando."
                );

            }

        } catch (erro) {

            console.error(
                "Erro ao registrar o Service Worker:",
                erro
            );

        }

    });

}