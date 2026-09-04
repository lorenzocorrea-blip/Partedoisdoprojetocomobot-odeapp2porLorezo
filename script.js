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

atualizarConexao();

window.addEventListener("offline", atualizarConexao);
window.addEventListener("online", atualizarConexao);


// ============================================
// EVENTOS
// ============================================

if (botaoBuscar) {
    botaoBuscar.addEventListener("click", buscarClima);
}

if (campoCidade) {
    campoCidade.addEventListener("keydown", (evento) => {

        if (evento.key === "Enter") {
            buscarClima();
        }

    });
}


// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

function buscarClima() {

    const cidade = campoCidade.value.trim();

    if (cidade === "") {

        resultado.innerHTML =
            "<p>Digite o nome de uma cidade.</p>";

        campoCidade.focus();

        return;
    }

    if (!navigator.onLine) {

        resultado.innerHTML =
            "<p>Você está sem conexão com a internet.</p>";

        return;
    }

    resultado.innerHTML =
        "<p>Consultando o clima...</p>";

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
// INSTALAÇÃO DA PWA
// ============================================

let promptDeInstalacao = null;

window.addEventListener(
    "beforeinstallprompt",
    (evento) => {

        console.log(
            "PWA pronta para instalação."
        );

        evento.preventDefault();

        promptDeInstalacao = evento;

        if (botaoInstalar) {
            botaoInstalar.hidden = false;
        }
    }
);


// ============================================
// BOTÃO INSTALAR
// ============================================

if (botaoInstalar) {

    botaoInstalar.addEventListener(
        "click",
        async () => {

            if (!promptDeInstalacao) {

                console.log(
                    "O navegador ainda não liberou a instalação."
                );

                return;
            }

            botaoInstalar.hidden = true;

            promptDeInstalacao.prompt();

            const escolha =
                await promptDeInstalacao.userChoice;

            console.log(
                "Resultado da instalação:",
                escolha.outcome
            );

            promptDeInstalacao = null;
        }
    );
}


// ============================================
// APP INSTALADO
// ============================================

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "Aplicativo instalado com sucesso!"
        );

        if (botaoInstalar) {
            botaoInstalar.hidden = true;
        }

        promptDeInstalacao = null;
    }
);


// ============================================
// SERVICE WORKER
// ============================================

if ("serviceWorker" in navigator) {

    window.addEventListener("load", async () => {

        try {

            const registro =
                await navigator.serviceWorker.register("./sw.js");

            console.log(
                "Service Worker registrado com sucesso:",
                registro.scope
            );

        } catch (erro) {

            console.error(
                "Erro ao registrar o Service Worker:",
                erro
            );

        }

    });

}