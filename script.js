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