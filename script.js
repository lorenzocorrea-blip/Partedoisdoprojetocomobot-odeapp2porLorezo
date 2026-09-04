// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const GEO_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

const CLIMA_URL =
    "https://api.open-meteo.com/v1/forecast";


// ============================================
// ELEMENTOS DA PÁGINA
// ============================================

const botaoBuscar =
    document.getElementById("buscar");

const campoCidade =
    document.getElementById("cidade");

const resultado =
    document.getElementById("resultado");

const offlineAviso =
    document.getElementById("offlineAviso");

const botaoInstalar =
    document.getElementById("instalarBtn");


// ============================================
// INDICADOR DE CONEXÃO
// ============================================

function atualizarConexao() {

    if (!offlineAviso) {
        return;
    }

    if (navigator.onLine) {
        offlineAviso.style.display = "none";
    } else {
        offlineAviso.style.display = "block";
    }
}


// Inicialização
atualizarConexao();


// Detecta perda de internet
window.addEventListener("offline", () => {
    atualizarConexao();
});


// Detecta retorno da internet
window.addEventListener("online", () => {
    atualizarConexao();
});


// ============================================
// EVENTOS
// ============================================

botaoBuscar.addEventListener("click", buscarClima);

campoCidade.addEventListener("keydown", (evento) => {

    if (evento.key === "Enter") {
        buscarClima();
    }

});


// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

function buscarClima() {

    const cidade = campoCidade.value.trim();


    // Campo vazio
    if (cidade === "") {

        resultado.innerHTML =
            "<p>Digite o nome de uma cidade.</p>";

        campoCidade.focus();

        return;
    }


    // Sem internet
    if (!navigator.onLine) {

        resultado.innerHTML =
            "<p>Você está sem conexão com a internet.</p>";

        return;
    }


    // Mensagem de carregamento
    resultado.innerHTML =
        "<p>Consultando o clima...</p>";


    // ============================================
    // BUSCA A CIDADE
    // ============================================

    const urlBusca =
        `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
        `&count=1&language=pt&format=json`;


    fetch(urlBusca)

        .then((resposta) => {

            if (!resposta.ok) {

                throw new Error(
                    "Não foi possível consultar a cidade."
                );
            }

            return resposta.json();
        })


        // ========================================
        // RECEBE A CIDADE
        // ========================================

        .then((dadosCidade) => {

            if (
                !dadosCidade.results ||
                dadosCidade.results.length === 0
            ) {

                throw new Error(
                    "Cidade não encontrada."
                );
            }


            const cidadeEncontrada =
                dadosCidade.results[0];


            const latitude =
                cidadeEncontrada.latitude;

            const longitude =
                cidadeEncontrada.longitude;

            const nome =
                cidadeEncontrada.name;


            // ====================================
            // BUSCA O CLIMA
            // ====================================

            const urlClima =
                `${CLIMA_URL}?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&current=temperature_2m,` +
                `relative_humidity_2m,` +
                `wind_speed_10m`;


            return fetch(urlClima)

                .then((resposta) => {

                    if (!resposta.ok) {

                        throw new Error(
                            "Erro ao consultar o clima."
                        );
                    }

                    return resposta.json();
                })

                .then((dadosClima) => {

                    return {
                        nome: nome,
                        clima: dadosClima
                    };

                });

        })


        // ========================================
        // MOSTRA O RESULTADO
        // ========================================

        .then(({ nome, clima }) => {

            console.log(
                "JSON recebido:",
                clima
            );


            const temperatura =
                clima.current.temperature_2m;

            const umidade =
                clima.current.relative_humidity_2m;

            const vento =
                clima.current.wind_speed_10m;


            resultado.innerHTML = `

                <div class="card-clima">

                    <h2>${nome}</h2>

                    <p>
                        Temperatura:
                        <strong>
                            ${temperatura} °C
                        </strong>
                    </p>

                    <p>
                        Umidade:
                        <strong>
                            ${umidade}%
                        </strong>
                    </p>

                    <p>
                        Vento:
                        <strong>
                            ${vento} km/h
                        </strong>
                    </p>

                </div>

            `;

        })


        // ========================================
        // ERRO
        // ========================================

        .catch((erro) => {

            console.error(erro);

            resultado.innerHTML = `
                <p>
                    Não foi possível consultar
                    o clima dessa cidade.
                </p>
            `;

        });

}


// ============================================
// BOTÃO DE INSTALAR O APP (PWA)
// ============================================

// Guarda o evento que o navegador dispara quando o app
// preenche os requisitos para ser instalado (manifest válido,
// service worker registrado, servido em HTTPS, etc.)
let promptDeInstalacao = null;


// O Chrome/Edge/Android disparam esse evento em vez de mostrar
// o prompt automático. Interceptamos para controlar quando mostrar.
window.addEventListener("beforeinstallprompt", (evento) => {

    // Impede o mini-banner automático do navegador
    evento.preventDefault();

    // Guarda o evento para usar depois, no clique do botão
    promptDeInstalacao = evento;

    // Mostra o botão de instalar, que estava escondido
    if (botaoInstalar) {
        botaoInstalar.hidden = false;
    }
});


// Clique no botão "Instalar App"
if (botaoInstalar) {

    botaoInstalar.addEventListener("click", async () => {

        if (!promptDeInstalacao) {
            return;
        }

        // Esconde o botão enquanto o usuário decide
        botaoInstalar.hidden = true;

        // Mostra o prompt nativo de instalação
        promptDeInstalacao.prompt();

        // Espera a escolha do usuário (aceitou ou recusou)
        const escolha = await promptDeInstalacao.userChoice;

        console.log(
            "Resposta do usuário à instalação:",
            escolha.outcome
        );

        // Esse evento só pode ser usado uma vez
        promptDeInstalacao = null;

    });

}


// Disparado quando o app é efetivamente instalado
window.addEventListener("appinstalled", () => {

    console.log("App instalado com sucesso!");

    if (botaoInstalar) {
        botaoInstalar.hidden = true;
    }

    promptDeInstalacao = null;

});


// ============================================
// SERVICE WORKER
// ============================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker
            .register("./sw.js")
            .then(() => {

                console.log(
                    "Service Worker registrado com sucesso."
                );

            })
            .catch((erro) => {

                console.error(
                    "Erro ao registrar o Service Worker:",
                    erro
                );

            });

    });

}