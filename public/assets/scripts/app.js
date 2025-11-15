// --- TESTE DE CARREGAMENTO DO SCRIPT ---
console.log("Script carregado com sucesso!");

// --- ELEMENTOS GLOBAIS ---
const formLogin = document.getElementById('formLogin');
const loginMessage = document.getElementById('loginMessage');
const btnLogout = document.getElementById('btnLogout');

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
if (botaoExcluirInscricao) botaoExcluirInscricao.disabled = true;
if (botaoAlterarInscricao) botaoAlterarInscricao.disabled = true;

// --- CONSTANTES DE AUTENTICAÇÃO ---
const ADMIN_USER = 'admin';
const ADMIN_PASS = '12345';
const AUTH_KEY = 'isAuthenticated';

// --- FUNÇÕES AUXILIARES DE DATA ---
function formatarDataParaFullCalendar(dataString) {
    const partes = dataString.split('/');
    if (partes.length === 3) return `${partes[2]}-${partes[1]}-${partes[0]}`;
    return dataString;
}

function dateToDDMMYYYY(date) {
    const d = new Date(date);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// --- AUTENTICAÇÃO ---

function checkAuth() {
    return localStorage.getItem(AUTH_KEY) === 'true';
}

// Redireciona para login se não estiver autenticado e estiver numa página admin
const isAdminPage = window.location.pathname.includes('admin.html');
if (isAdminPage && !checkAuth()) {
    window.location.href = 'login.html';
}

function login(username, password) {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem(AUTH_KEY, 'true');
        window.location.href = 'admin.html';
    } else if (loginMessage) {
        loginMessage.style.display = 'block';
    }
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}

// --- EVENTOS DE LOGIN ---
formLogin?.addEventListener('submit', e => {
    e.preventDefault();
    login(
        document.getElementById('username').value.trim(),
        document.getElementById('password').value.trim()
    );
});
btnLogout?.addEventListener('click', logout);

// --- CARREGAMENTO DE DADOS AO ABRIR A PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {

    // Página Inicial: carrossel, notícias e eventos
    if (containerNoticias && containerEventos && containerCarrossel) {

        fetch('http://localhost:3000/banners')
            .then(res => res.ok ? res.json() : Promise.reject('Erro ao buscar banners'))
            .then(banners => {
                banners.forEach((banner, i) => {
                    containerCarrossel.innerHTML += `
                        <div class="carousel-item ${i === 0 ? 'active' : ''}">
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

        fetch('http://localhost:3000/noticias')
            .then(res => res.ok ? res.json() : Promise.reject('Erro ao buscar notícias'))
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

        fetch('http://localhost:3000/eventos')
            .then(res => res.ok ? res.json() : Promise.reject('Erro ao buscar eventos'))
            .then(eventos => {
                // Ordena pelo campo 'data' do mais próximo para o mais distante
                eventos.sort((a, b) => {
                    const dataA = new Date(a.data.split('/').reverse().join('-')); // transforma dd/mm/yyyy em yyyy-mm-dd
                    const dataB = new Date(b.data.split('/').reverse().join('-'));
                    return dataB - dataA;
                });

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

    // Página de detalhes
    if (containerDetalhes) {
        const params = new URLSearchParams(window.location.search);
        const tipo = params.get('tipo');
        const id = parseInt(params.get('id'), 10);

        const endpoint = tipo === 'noticia' ? 'http://localhost:3000/noticias' :
                         tipo === 'evento' ? 'http://localhost:3000/eventos' : '';

        if (endpoint) {
            fetch(endpoint)
                .then(res => res.json())
                .then(itens => {
                    const item = itens.find(i => i.id === id);
                    if (!item) return containerDetalhes.innerHTML = '<p class="text-center">Item não encontrado.</p>';

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
                .catch(err => {
                    console.error('Erro ao carregar item:', err);
                    containerDetalhes.innerHTML = '<p class="text-center">Erro ao carregar o item.</p>';
                });
        }
    }

    // Calendário público
    if (document.getElementById('calendar')) inicializarCalendarioPublico();

    // Calendário admin
    if (document.getElementById('calendarAdmin')) {
        if (!checkAuth()) return window.location.href = 'login.html';
        inicializarCalendarioAdmin();
    }
});

// --- CALENDÁRIO PÚBLICO ---
function inicializarCalendarioPublico() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        headerToolbar: { 
            left: 'prev,next today', 
            center: 'title', 
            right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Lista'
            },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('http://localhost:3000/eventos')
                .then(res => res.json())
                .then(data => {
                    successCallback(data.map(e => ({
                        id: e.id,
                        title: e.titulo,
                        start: formatarDataParaFullCalendar(e.data),
                        extendedProps: { descricao: e.descricao, local: e.local }
                    })));
                })
                .catch(failureCallback);
        },
        eventClick: info => window.location.href = `detalhes.html?tipo=evento&id=${info.event.id}`
    });

    calendar.render();
}

// --- CALENDÁRIO ADMIN ---
let adminCalendarInstancia;
function inicializarCalendarioAdmin() {
    const calendarEl = document.getElementById('calendarAdmin');
    if (!calendarEl) return;

    adminCalendarInstancia = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        editable: true,
        headerToolbar: { 
            left: 'prev,next today', 
            center: 'title', 
            right: 'dayGridMonth,timeGridWeek,timeGridDay' },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            list: 'Lista'
            },
        events: function(fetchInfo, successCallback, failureCallback) {
            fetch('http://localhost:3000/eventos')
                .then(res => res.json())
                .then(data => {
                    successCallback(data.map(e => ({
                        id: e.id,
                        title: e.titulo,
                        start: formatarDataParaFullCalendar(e.data),
                        extendedProps: { descricao: e.descricao, local: e.local, imagem: e.imagem }
                    })));
                })
                .catch(failureCallback);
        },
        eventClick: info => preencherFormularioEvento(info.event),
        eventDrop: info => {
            const evento = info.event;
            const novoDia = dateToDDMMYYYY(evento.start);
            if (!confirm(`Mover "${evento.title}" para ${novoDia}?`)) return info.revert();

            salvarEvento(evento.id, {
                titulo: evento.title,
                data: novoDia,
                local: evento.extendedProps.local,
                descricao: evento.extendedProps.descricao,
                imagem: evento.extendedProps.imagem
            });
        }
    });

    adminCalendarInstancia.render();

    const form = document.getElementById('formGerenciarEvento');
    const btnExcluir = document.getElementById('btnExcluirEvento');
    const btnLimpar = document.getElementById('btnLimparForm');

    form?.addEventListener('submit', e => {
        e.preventDefault();
        salvarEvento(document.getElementById('eventoId').value, obterDadosFormularioEvento());
    });

    btnExcluir?.addEventListener('click', () => {
        const eventoId = parseInt(document.getElementById('eventoId').value, 10);
        if (!eventoId) return alert('Selecione um evento válido antes de excluir.');
        excluirEvento(eventoId);
    });

    btnLimpar?.addEventListener('click', limparFormularioEvento);
}

// --- FUNÇÕES CRUD DE EVENTOS ---
function obterDadosFormularioEvento() {
    return {
        titulo: document.getElementById('eventoTitulo').value.trim(),
        data: document.getElementById('eventoData').value.trim(),
        local: document.getElementById('eventoLocal').value.trim(),
        descricao: document.getElementById('eventoDescricao').value.trim(),
        imagem: document.getElementById('eventoImagem').value.trim() || ''
    };
}

function limparFormularioEvento() {
    document.getElementById('formGerenciarEvento')?.reset();
    document.getElementById('eventoId').value = '';
    document.getElementById('btnSalvarEvento').textContent = 'Adicionar Evento';
    document.getElementById('btnExcluirEvento').disabled = true;
}

function preencherFormularioEvento(evento) {
    document.getElementById('eventoId').value = evento.id;
    document.getElementById('eventoTitulo').value = evento.title;
    document.getElementById('eventoData').value = dateToDDMMYYYY(evento.start);
    document.getElementById('eventoLocal').value = evento.extendedProps.local;
    document.getElementById('eventoDescricao').value = evento.extendedProps.descricao;
    document.getElementById('eventoImagem').value = evento.extendedProps.imagem || '';
    document.getElementById('btnSalvarEvento').textContent = 'Salvar Alterações';
    document.getElementById('btnExcluirEvento').disabled = false;
}

async function salvarEvento(eventoId, dados) {
    const method = eventoId ? 'PUT' : 'POST';
    const url = eventoId ? `http://localhost:3000/eventos/${eventoId}` : 'http://localhost:3000/eventos';

    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        if (!res.ok) throw new Error(`Erro ao ${eventoId ? 'atualizar' : 'adicionar'} evento.`);
        alert(`Evento ${eventoId ? 'atualizado' : 'adicionado'} com sucesso!`);
        limparFormularioEvento();
        adminCalendarInstancia.refetchEvents();
    } catch (err) {
        console.error('Erro de CRUD:', err);
        alert(`Falha ao ${eventoId ? 'atualizar' : 'adicionar'} evento: ${err.message}`);
    }
}

async function excluirEvento(eventoId) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
        const res = await fetch(`http://localhost:3000/eventos/${eventoId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erro ao excluir evento.');
        alert('Evento excluído com sucesso!');
        limparFormularioEvento();
        adminCalendarInstancia.refetchEvents();
    } catch (err) {
        console.error('Erro de CRUD:', err);
        alert(`Falha ao excluir evento: ${err.message}`);
    }
}

// --- FORMULÁRIO DE CONTATO ---
botaoEnviarContato?.addEventListener('click', e => {
    e.preventDefault();
    const form = document.getElementById('formContato');
    if (!form || !form.checkValidity()) return alert('Por favor, preencha todos os campos obrigatórios.');
    enviarMensagemContato();
    form.reset();
});

botaoLimparContato?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('formContato')?.reset();
});

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
    .then(res => res.ok ? res.json() : Promise.reject('Erro ao enviar mensagem'))
    .then(() => alert('Sua dúvida foi enviada com sucesso! Em breve entraremos em contato.'))
    .catch(console.error);
}

// --- FORMULÁRIO DE INSCRIÇÃO ---
botaoEnviarInscricao?.addEventListener('click', e => {
    e.preventDefault();
    const form = document.getElementById('formInscricao');
    if (!form || !form.checkValidity()) return alert('Por favor, preencha todos os campos obrigatórios.');
    enviarInscricao();
    form.reset();
});

botaoLimparFormulario?.addEventListener('click', e => {
    e.preventDefault();
    limparFormularioInscricao();
    botaoEnviarInscricao.disabled = false;
});

function obterDadosFormulario() {
    return {
        nome: document.getElementById('nomeInscricao').value.trim(),
        CPF: document.getElementById('cpfInscricao').value.trim(),
        email: document.getElementById('emailInscricao').value.trim(),
        telefone: document.getElementById('telefoneInscricao').value.trim(),
        curso: document.getElementById('cursoInscricao').value.trim()
    };
}

function limparFormularioInscricao() {
    ['nomeInscricao','cpfInscricao','emailInscricao','telefoneInscricao','cursoInscricao'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('cpfInscricao')?.removeAttribute('data-inscrito-id');
    botaoAlterarInscricao.disabled = true;
    botaoExcluirInscricao.disabled = true;
}

function enviarInscricao() {
    fetch('http://localhost:3000/inscritos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obterDadosFormulario())
    })
    .then(res => res.ok ? res.json() : Promise.reject('Erro ao enviar inscrição'))
    .then(() => alert('Sua inscrição foi enviada com sucesso!'))
    .catch(console.error);
}

botaoLocalizarInscricao?.addEventListener('click', e => { e.preventDefault(); localizarInscricao(); });

function localizarInscricao() {
    const inputCPF = document.getElementById('cpfInscricao');
    const cpf = inputCPF.value.trim();
    if (!cpf) return alert('Por favor, preencha o CPF.');

    fetch(`http://localhost:3000/inscritos?CPF=${cpf}`)
        .then(res => res.ok ? res.json() : Promise.reject('Erro ao localizar inscrição'))
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

botaoAlterarInscricao?.addEventListener('click', e => {
    e.preventDefault();
    const inputCPF = document.getElementById('cpfInscricao');
    const inscritoId = parseInt(inputCPF.dataset.inscritoId, 10);
    if (!inscritoId) return alert('Nenhuma inscrição selecionada.');

    fetch(`http://localhost:3000/inscritos/${inscritoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obterDadosFormulario())
    })
    .then(res => res.ok ? res.json() : Promise.reject('Erro ao alterar inscrição'))
    .then(() => { alert('Inscrição atualizada com sucesso!'); limparFormularioInscricao(); })
    .catch(console.error);
});

botaoExcluirInscricao?.addEventListener('click', e => {
    e.preventDefault();
    const inputCPF = document.getElementById('cpfInscricao');
    const inscritoId = parseInt(inputCPF.dataset.inscritoId, 10);
    if (!inscritoId) return alert('Nenhuma inscrição selecionada.');
    if (!confirm('Deseja realmente excluir esta inscrição?')) return;

    fetch(`http://localhost:3000/inscritos/${inscritoId}`, { method: 'DELETE' })
        .then(res => res.ok ? res.json() : Promise.reject('Erro ao excluir inscrição'))
        .then(() => { alert('Inscrição excluída com sucesso!'); limparFormularioInscricao(); })
        .catch(console.error);
});
