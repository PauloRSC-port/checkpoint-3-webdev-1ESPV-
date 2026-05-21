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