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

const botaoBuscar = document.getElementById("buscar");
const campoCidade = document.getElementById("cidade");
const resultado = document.getElementById("resultado");
const offlineAviso = document.getElementById("offlineAviso");
const botaoInstalar = document.getElementById("instalarBtn");


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

window.addEventListener("online", atualizarConexao);
window.addEventListener("offline", atualizarConexao);


// ============================================
// BOTÃO BUSCAR
// ============================================

if (botaoBuscar) {

    botaoBuscar.addEventListener("click", buscarClima);

}


// ============================================
// TECLA ENTER
// ============================================

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

async function buscarClima() {

    const cidade = campoCidade.value.trim();

    console.log("Cidade pesquisada:", cidade);


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


    // Carregamento
    resultado.innerHTML =
        "<p>Consultando o clima...</p>";


    try {

        // ========================================
        // BUSCAR CIDADE
        // ========================================

        const urlBusca =
            `${GEO_URL}?name=${encodeURIComponent(cidade)}` +
            `&count=1&language=pt&format=json`;

        const respostaCidade =
            await fetch(urlBusca);


        if (!respostaCidade.ok) {

            throw new Error(
                "Não foi possível consultar a cidade."
            );

        }


        const dadosCidade =
            await respostaCidade.json();


        // Cidade não encontrada
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


        // ========================================
        // BUSCAR CLIMA
        // ========================================

        const urlClima =
            `${CLIMA_URL}?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,` +
            `relative_humidity_2m,` +
            `wind_speed_10m`;


        const respostaClima =
            await fetch(urlClima);


        if (!respostaClima.ok) {

            throw new Error(
                "Erro ao consultar o clima."
            );

        }


        const dadosClima =
            await respostaClima.json();


        console.log(
            "JSON recebido:",
            dadosClima
        );


        // ========================================
        // DADOS
        // ========================================

        const temperatura =
            dadosClima.current.temperature_2m;

        const umidade =
            dadosClima.current.relative_humidity_2m;

        const vento =
            dadosClima.current.wind_speed_10m;


        // ========================================
        // MOSTRAR RESULTADO
        // ========================================

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

    } catch (erro) {

        console.error(
            "Erro ao buscar clima:",
            erro
        );

        resultado.innerHTML = `
            <p>
                Não foi possível consultar
                o clima dessa cidade.
            </p>
        `;

    }

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
// BOTÃO DE INSTALAÇÃO
// ============================================

if (botaoInstalar) {

    botaoInstalar.addEventListener(
        "click",
        async () => {

            if (!promptDeInstalacao) {

                console.log(
                    "A instalação ainda não está disponível."
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

    window.addEventListener(
        "load",
        async () => {

            try {

                const registro =
                    await navigator.serviceWorker.register(
                        "./sw.js"
                    );


                console.log(
                    "Service Worker registrado com sucesso!"
                );


                console.log(
                    "Scope:",
                    registro.scope
                );


                if (registro.active) {

                    console.log(
                        "Service Worker está ativo e funcionando!"
                    );

                }

            } catch (erro) {

                console.error(
                    "Erro ao registrar o Service Worker:",
                    erro
                );

            }

        }
    );

}