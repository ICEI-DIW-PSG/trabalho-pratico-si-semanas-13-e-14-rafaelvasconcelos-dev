console.log("Script carregado com sucesso!"); // Testa se o script foi carregado corretamente

// --- BOTÕES E ELEMENTOS DO FORMULÁRIO ---
const botaoEnviarContato = document.getElementById('btnEnviarContato');
const botaoLimparContato = document.getElementById('limparFormContato');

const botaoEnviarInscricao = document.getElementById('btnEnviarInscricao');
const botaoLocalizarInscricao = document.getElementById('btnLocalizarInscricao');
const botaoLimparFormulario = document.getElementById('btnLimpar');
const botaoAlterarInscricao = document.getElementById('btnAlterarInscricao');
const botaoExcluirInscricao = document.getElementById('btnExcluirInscricao');

const containerNoticias = document.getElementById('feed-noticias');
const containerEventos = document.getElementById('agenda-eventos');
const containerCarrossel = document.getElementById('carousel-inner');
const containerDetalhes = document.getElementById('detalhe-item');

// --- ESTADO INICIAL DOS BOTÕES ---
if (botaoExcluirInscricao) botaoExcluirInscricao.disabled = true; // Evita exclusão acidental
if (botaoAlterarInscricao) botaoAlterarInscricao.disabled = true; // Evita alteração acidental

// --- CARREGAMENTO DE DADOS AO ABRIR A PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {

    // --- Página Inicial: carrossel, notícias e eventos ---
    if (containerNoticias && containerEventos) {

        // Carrossel de banners
        fetch('http://localhost:3000/banners')
            .then(resposta => resposta.ok ? resposta.json() : Promise.reject('Erro ao buscar os banners'))
            .then(banners => {
                banners.forEach((banner, indice) => {
                    containerCarrossel.innerHTML += `
                        <div class="carousel-item ${indice === 0 ? 'active' : ''}">
                            <a href="inscricao.html" class="text-decoration-none text-dark">
                                <img src="${banner.imagem}" class="d-block mx-auto img-fluid rounded" alt="${banner.nome}">
                                <div class="carousel-caption d-block d-sm-block bg-white bg-opacity-75 rounded p-2 text-center">
                                    <h5>${banner.nome}</h5>
                                    <p>${banner.descricao}</p>
                                </div>
                            </a>
                        </div>`;
                });
            })
            .catch(console.error);

        // Notícias
        fetch('http://localhost:3000/noticias')
            .then(resposta => resposta.ok ? resposta.json() : Promise.reject('Erro ao buscar as notícias'))
            .then(noticias => {
                noticias.forEach(noticia => {
                    containerNoticias.innerHTML += `
                        <div class="card shadow-sm border-start border-4 border-warning p-3">
                            <h5 class="card-title">${noticia.titulo}</h5>
                            <p class="card-text">${noticia.descricao}</p>
                            <p><img src="${noticia.imagem}" class="img-fluid rounded shadow-sm w-50"></p>
                            <a href="detalhes.html?tipo=noticia&id=${noticia.id}" class="btn btn-primary btn-sm">Leia mais</a>
                        </div>`;
                });
            })
            .catch(console.error);

        // Agenda de Eventos
        fetch('http://localhost:3000/eventos')
            .then(resposta => resposta.ok ? resposta.json() : Promise.reject('Erro ao buscar os eventos'))
            .then(eventos => {
                eventos.forEach(evento => {
                    containerEventos.innerHTML += `
                        <div class="card shadow-sm border-start border-4 border-primary p-3 text-center">
                            <h5 class="card-title">${evento.titulo}</h5>
                            <p class="card-text">Data: ${evento.data}<br>${evento.descricao}</p>
                            <a href="detalhes.html?tipo=evento&id=${evento.id}" class="btn btn-outline-primary btn-sm">Detalhes</a>
                        </div>`;
                });
            })
            .catch(console.error);
    }

    // --- Página de Detalhes ---
    if (containerDetalhes) {
        const parametrosURL = new URLSearchParams(window.location.search);
        const tipo = parametrosURL.get('tipo'); // noticia ou evento
        const id = parseInt(parametrosURL.get('id'));

        const endpoint = tipo === 'noticia' ? 'http://localhost:3000/noticias' :
                         tipo === 'evento' ? 'http://localhost:3000/eventos' : '';

        if (endpoint) {
            fetch(endpoint)
                .then(resposta => resposta.json())
                .then(itens => {
                    const item = itens.find(i => i.id === id);
                    if (!item) {
                        containerDetalhes.innerHTML = '<p class="text-center">Item não encontrado.</p>';
                        return;
                    }
                    if (tipo === 'noticia') {
                        containerDetalhes.innerHTML = `
                            <div class="row g-5">
                                <div class="col-md-6">
                                    <img src="${item.imagem}" class="img-fluid rounded shadow-sm w-100" alt="${item.titulo}">
                                </div>
                                <div class="col-md-6">
                                    <h1 class="fw-bold">${item.titulo}</h1>
                                    <p class="lead">${item.descricao}</p>
                                    <hr>
                                    <p>${item.conteudo}</p>
                                </div>
                            </div>`;
                    } else if (tipo === 'evento') {
                        containerDetalhes.innerHTML = `
                            <div class="row g-5">
                                <div class="col-md-6">
                                    <img src="${item.imagem}" class="img-fluid rounded shadow-sm" alt="${item.titulo}">
                                </div>
                                <div class="col-md-6">
                                    <h1 class="fw-bold">${item.titulo}</h1>
                                    <p class="lead"><strong>Data:</strong> ${item.data}</p>
                                    <p class="lead"><strong>Local:</strong> ${item.local}</p>
                                    <hr>
                                    <p>${item.descricao}</p>
                                </div>
                            </div>`;
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar o item:', error);
                    containerDetalhes.innerHTML = '<p class="text-center">Erro ao carregar o item.</p>';
                });
        }
    }
});

// --- FORMULÁRIO DE CONTATO ---
botaoEnviarContato?.addEventListener('click', evento => {
    evento.preventDefault(); // Evita envio padrão do formulário

    const formulario = document.getElementById('formContato');
    if (!formulario) return;
    if (!formulario.checkValidity()) { // checa se todos os campos required estão preenchidos
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    enviarMensagemContato(); // só envia se estiver tudo preenchido

    // Limpa os campos após envio
    formulario.reset();

});

botaoLimparContato?.addEventListener('click', evento => {
    evento.preventDefault();
    const formulario = document.getElementById('formContato');
    formulario.reset();
});

// Envia a mensagem de contato para o servidor
function enviarMensagemContato() {
    fetch('http://localhost:3000/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nome: document.getElementById('nomeContato').value.trim(),
            telefone: document.getElementById('telefoneContato').value.trim(),
            email: document.getElementById('emailContato').value.trim(),
            mensagem: document.getElementById('mensagemContato').value.trim()
        })
    })
    .then(resposta => resposta.ok ? resposta.json() : Promise.reject('Erro ao enviar mensagem'))
    .then(() => alert('Sua dúvida foi enviada com sucesso! Em breve entraremos em contato.'))
    .catch(console.error);
}

// --- FORMULÁRIO DE INSCRIÇÃO ---
botaoEnviarInscricao?.addEventListener('click', evento => {
    evento.preventDefault(); // Evita envio padrão

    const formulario = document.getElementById('formInscricao');
    if (!formulario) return;
    if (!formulario.checkValidity()) { // checa se todos os campos required estão preenchidos
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    enviarInscricao(); // só envia se estiver tudo preenchido

    // Limpa os campos após envio
    formulario.reset();
});

botaoLimparFormulario?.addEventListener('click', evento => {
    evento.preventDefault();
    limparFormularioInscricao();
    botaoEnviarInscricao.disabled = false; // Permite novo envio
});

// Função que retorna os dados preenchidos no formulário
function obterDadosFormulario() {
    return {
        nome: document.getElementById('nomeInscricao').value.trim(),
        CPF: document.getElementById('cpfInscricao').value.trim(),
        email: document.getElementById('emailInscricao').value.trim(),
        telefone: document.getElementById('telefoneInscricao').value.trim(),
        curso: document.getElementById('cursoInscricao').value.trim()
    };
}

// Limpa campos e reabilita botões
function limparFormularioInscricao() {
    ['nomeInscricao','cpfInscricao','emailInscricao','telefoneInscricao','cursoInscricao'].forEach(id => {
        document.getElementById(id).value = '';
    });
    const inputCPF = document.getElementById('cpfInscricao');
    delete inputCPF.dataset.inscritoId;
    botaoAlterarInscricao.disabled = true;
    botaoExcluirInscricao.disabled = true;
}

// Envia inscrição
function enviarInscricao() {
    const dados = obterDadosFormulario();
    fetch('http://localhost:3000/inscritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
    .then(resposta => resposta.ok ? resposta.json() : Promise.reject('Erro ao enviar inscrição'))
    .then(() => alert('Sua inscrição foi enviada com sucesso!'))
    .catch(console.error);
}

// Localizar inscrição pelo CPF
botaoLocalizarInscricao?.addEventListener('click', evento => {
    evento.preventDefault();
    localizarInscricao();
});

function localizarInscricao() {
    const inputCPF = document.getElementById('cpfInscricao');
    const cpf = inputCPF.value.trim();
    if (!cpf) return alert('Por favor, preencha o CPF.');

    fetch(`http://localhost:3000/inscritos?CPF=${cpf}`)
        .then(resposta => resposta.ok ? resposta.json() : Promise.reject('Erro ao localizar inscrição'))
        .then(dados => {
            if (!dados.length) return alert('Inscrição não encontrada para o CPF informado.');
            const inscrito = dados[0];

            document.getElementById('nomeInscricao').value = inscrito.nome;
            document.getElementById('emailInscricao').value = inscrito.email;
            document.getElementById('telefoneInscricao').value = inscrito.telefone;
            document.getElementById('cursoInscricao').value = inscrito.curso;

            inputCPF.dataset.inscritoId = inscrito.id;

            botaoEnviarInscricao.disabled = true;
            botaoAlterarInscricao.disabled = false;
            botaoExcluirInscricao.disabled = false;
        })
        .catch(console.error);
}

// --- ALTERAR INSCRIÇÃO ---
botaoAlterarInscricao?.addEventListener('click', evento => {
    evento.preventDefault(); // Evita envio padrão do formulário
    alterarInscricao();
});

function alterarInscricao() {
    const inputCPF = document.getElementById('cpfInscricao');
    const idInscrito = inputCPF.dataset.inscritoId; // Pega o ID do inscrito armazenado no dataset

    if (!idInscrito) {
        alert('Localize a inscrição antes de alterar.');
        return;
    }

    const dadosAtualizados = {
        nome: document.getElementById('nomeInscricao').value.trim(),
        CPF: inputCPF.value.trim(),
        email: document.getElementById('emailInscricao').value.trim(),
        telefone: document.getElementById('telefoneInscricao').value.trim(),
        curso: document.getElementById('cursoInscricao').value.trim()
    };

    fetch(`http://localhost:3000/inscritos/${idInscrito}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
    })
    .then(resposta => {
        if (!resposta.ok) throw new Error('Erro ao alterar inscrição');
        return resposta.json();
    })
    .then(() => {
        alert('Inscrição alterada com sucesso!');
        
        // Limpa formulário e reabilita botões
        limparFormularioInscricao();
        botaoEnviarInscricao.disabled = false; // Permite nova inscrição
        botaoAlterarInscricao.disabled = true;
        botaoExcluirInscricao.disabled = true;
    })
    .catch(erro => {
        console.error('Erro ao alterar inscrição:', erro);
        alert('Houve um erro ao alterar a inscrição. Tente novamente mais tarde.');
    });
}


// Excluir inscrição
botaoExcluirInscricao?.addEventListener('click', evento => {
    evento.preventDefault();
    const inputCPF = document.getElementById('cpfInscricao');
    const id = inputCPF.dataset.inscritoId;
    if (!id) return alert('Localize a inscrição antes de excluir.');

    fetch(`http://localhost:3000/inscritos/${id}`, { method: 'DELETE' })
        .then(resposta => {
            if (!resposta.ok) return Promise.reject('Erro ao excluir inscrição');
            return true;
        })
        .then(() => {
            alert('Inscrição excluída com sucesso!');
            limparFormularioInscricao();
            botaoEnviarInscricao.disabled = false;
        })
        .catch(console.error);
});
