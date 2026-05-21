// ============================================================
//  script.js — Arcane Notes
//  Painel de Anotações + Consulta de Cartas do Magic: The Gathering
// ============================================================
 
// ============================================================
//  SEÇÃO 1 — PAINEL DE ANOTAÇÕES
// ============================================================
 
// Chave usada para salvar/recuperar anotações no localStorage
const STORAGE_KEY = 'arcane_anotacoes';
 
// Referências aos elementos do DOM relacionados às anotações
const inputAnotacao  = document.getElementById('input-anotacao');
const btnAdicionar   = document.getElementById('btn-adicionar');
const listaAnotacoes = document.getElementById('lista-anotacoes');
const btnLimpar      = document.getElementById('btn-limpar');
 
// ----------------------------------------------------------
//  Carrega as anotações salvas no localStorage ao iniciar
// ----------------------------------------------------------
function carregarAnotacoes() {
  // Lê o JSON salvo; se não existir, usa um array vazio
  const salvas = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  salvas.forEach(anotacao => renderizarAnotacao(anotacao));
  atualizarMensagemVazia();
}
 
// ----------------------------------------------------------
//  Salva o array atual de anotações no localStorage
// ----------------------------------------------------------
function salvarNoLocalStorage() {
  // Coleta o texto e a data de cada <li> existente
  const itens = [...listaAnotacoes.querySelectorAll('.anotacao-item')].map(li => ({
    texto: li.querySelector('.anotacao-texto').textContent,
    data:  li.querySelector('.anotacao-data').textContent,
    id:    li.dataset.id,
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
}
 
// ----------------------------------------------------------
//  Cria e insere um <li> com os dados da anotação no DOM
// ----------------------------------------------------------
function renderizarAnotacao(anotacao) {
  const li = document.createElement('li');
  li.classList.add('anotacao-item');
  li.dataset.id = anotacao.id;
 
  li.innerHTML = `
    <div class="anotacao-conteudo">
      <p class="anotacao-texto">${escapeHtml(anotacao.texto)}</p>
      <p class="anotacao-data">${anotacao.data}</p>
    </div>
    <button class="btn btn-danger btn-excluir" title="Excluir anotação">✕</button>
  `;
 
  // Adiciona evento de exclusão individual ao botão
  li.querySelector('.btn-excluir').addEventListener('click', () => excluirAnotacao(li));
 
  listaAnotacoes.prepend(li); // Insere no topo da lista
  atualizarMensagemVazia();
}
 
// ----------------------------------------------------------
//  Adiciona uma nova anotação (disparado pelo botão ou Enter)
// ----------------------------------------------------------
function adicionarAnotacao() {
  const texto = inputAnotacao.value.trim();
 
  // Valida que o campo não está vazio
  if (!texto) {
    inputAnotacao.focus();
    return;
  }
 
  // Monta o objeto da anotação com data/hora automáticas
  const anotacao = {
    id:    Date.now().toString(),       // ID único baseado no timestamp
    texto,
    data:  formatarDataHora(new Date()), // Data e hora atuais formatadas
  };
 
  renderizarAnotacao(anotacao);
  salvarNoLocalStorage();
 
  // Limpa o campo de texto após adicionar
  inputAnotacao.value = '';
  inputAnotacao.focus();
}
 
// ----------------------------------------------------------
//  Remove uma anotação individual do DOM e do localStorage
// ----------------------------------------------------------
function excluirAnotacao(elemento) {
  elemento.remove();
  salvarNoLocalStorage();
  atualizarMensagemVazia();
}
 
// ----------------------------------------------------------
//  Limpa TODAS as anotações após confirmação do usuário
// ----------------------------------------------------------
function limparTodasAnotacoes() {
  // Exibe caixa de confirmação antes de apagar tudo
  const confirmado = confirm('Tem certeza que deseja apagar todas as anotações? Esta ação não pode ser desfeita.');
 
  if (confirmado) {
    listaAnotacoes.innerHTML = ''; // Remove tudo do DOM
    localStorage.removeItem(STORAGE_KEY); // Remove do localStorage
    atualizarMensagemVazia();
  }
}
 
// ----------------------------------------------------------
//  Exibe mensagem quando a lista estiver vazia
// ----------------------------------------------------------
function atualizarMensagemVazia() {
  const existente = listaAnotacoes.querySelector('.empty-msg');
 
  if (listaAnotacoes.querySelectorAll('.anotacao-item').length === 0) {
    if (!existente) {
      const msg = document.createElement('li');
      msg.classList.add('empty-msg');
      msg.textContent = 'Nenhuma anotação ainda. Adicione a primeira!';
      listaAnotacoes.appendChild(msg);
    }
  } else {
    if (existente) existente.remove();
  }
}
 
// ----------------------------------------------------------
//  Formata um objeto Date para "dd/mm/aaaa às hh:mm:ss"
// ----------------------------------------------------------
function formatarDataHora(data) {
  const pad = n => String(n).padStart(2, '0');
  const d = pad(data.getDate());
  const m = pad(data.getMonth() + 1);
  const y = data.getFullYear();
  const h = pad(data.getHours());
  const mi = pad(data.getMinutes());
  const s  = pad(data.getSeconds());
  return `${d}/${m}/${y} às ${h}:${mi}:${s}`;
}
 
// ----------------------------------------------------------
//  Escapa caracteres HTML para evitar XSS
// ----------------------------------------------------------
function escapeHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
 
// --- Eventos do Painel de Anotações ---
 
// Clique no botão "Adicionar"
btnAdicionar.addEventListener('click', adicionarAnotacao);
 
// Permite adicionar anotação pressionando Enter no input
inputAnotacao.addEventListener('keydown', e => {
  if (e.key === 'Enter') adicionarAnotacao();
});
 
// Clique no botão "Limpar Todas"
btnLimpar.addEventListener('click', limparTodasAnotacoes);
 
// Inicializa: carrega anotações salvas ao abrir a página
carregarAnotacoes();
 
 
// ============================================================
//  SEÇÃO 2 — CONSULTA DE CARTAS DO MAGIC: THE GATHERING
// ============================================================
 
// Referências aos elementos do DOM da seção Magic
const inputCarta     = document.getElementById('input-carta');
const btnBuscar      = document.getElementById('btn-buscar');
const resultadoCarta = document.getElementById('resultado-carta');
 
// URL base da API pública de cartas do Magic
const API_URL = 'https://api.magicthegathering.io/v1/cards';
 
// Imagem padrão usada quando a carta não possui imagem própria
const IMAGEM_PADRAO = 'assets/imagem-padrao.jpg';
 
// ----------------------------------------------------------
//  Busca a carta na API e exibe o resultado
// ----------------------------------------------------------
async function buscarCarta() {
  const nome = inputCarta.value.trim();
 
  // Valida que o campo não está vazio
  if (!nome) {
    inputCarta.focus();
    return;
  }
 
  // Exibe mensagem de carregamento durante a requisição
  resultadoCarta.innerHTML = '<p class="loading-msg">⏳ Buscando carta...</p>';
 
  try {
    // Faz a requisição à API com o nome codificado na URL
    const resp = await fetch(`${API_URL}?name=${encodeURIComponent(nome)}`);
 
    // Verifica se a resposta da API foi bem-sucedida
    if (!resp.ok) {
      throw new Error(`Erro na requisição: status ${resp.status}`);
    }
 
    const dados = await resp.json();
 
    // Filtra resultados para encontrar uma correspondência exata (case-insensitive)
    const carta = dados.cards?.find(
      c => c.name.toLowerCase() === nome.toLowerCase()
    ) || dados.cards?.[0]; 
 
    if (!carta) {
      
      exibirErro(`Carta "${nome}" não encontrada. Verifique o nome em inglês.`);
      return;
    }
 
    
    exibirCarta(carta);
 
  } catch (erro) {
    
    console.error('Erro ao buscar carta:', erro);
    exibirErro('Falha ao consultar a API. Verifique sua conexão e tente novamente.');
  }
}
 

function exibirCarta(carta) {
  
  const imagem = carta.imageUrl || IMAGEM_PADRAO;
 
 
  const texto = carta.text || 'Sem texto de regras disponível.';
 
  
  const tipo = carta.type || 'Tipo desconhecido';
 
  resultadoCarta.innerHTML = `
    <div class="carta-card">
      <img
        class="carta-img"
        src="${imagem}"
        alt="${escapeHtml(carta.name)}"
        onerror="this.src='${IMAGEM_PADRAO}'"
      />
      <div class="carta-info">
        <p class="carta-nome">${escapeHtml(carta.name)}</p>
        <p class="carta-tipo">${escapeHtml(tipo)}</p>
        <p class="carta-texto">${escapeHtml(texto)}</p>
      </div>
    </div>
  `;
}
 

function exibirErro(mensagem) {
  resultadoCarta.innerHTML = `<p class="erro-msg">⚠️ ${escapeHtml(mensagem)}</p>`;
}
 
btnBuscar.addEventListener('click', buscarCarta);
 

inputCarta.addEventListener('keydown', e => {
  if (e.key === 'Enter') buscarCarta();
});