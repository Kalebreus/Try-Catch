const formulario = document.getElementById('form-pedido');
const campoNome = document.getElementById('nome-pedido');
const campoCenario = document.getElementById('cenario');
const campoTempo = document.getElementById('tempo-ms');
const botaoIniciar = document.getElementById('iniciar');
const estadoPedido = document.getElementById('estado-pedido');
const etapaValidacao = document.getElementById('etapa-validacao');
const etapaPreparo = document.getElementById('etapa-preparo');
const etapaEntrega = document.getElementById('etapa-entrega');
const diagnostico = document.getElementById('diagnostico');
const logPedido = document.getElementById('log-pedido');
let emExecucao = false;
let totalFinally = 0;

function definirCarregamento(carregando) {
  botaoIniciar.disabled = carregando;
  campoNome.disabled = carregando;
  campoCenario.disabled = carregando;
  campoTempo.disabled = carregando;
  document.getElementById('painel-pedido').setAttribute('aria-busy', String(carregando));
  document.getElementById('carregamento').textContent = 'Carregando: ' + carregando;
}

function registrar(mensagem) {
  const item = document.createElement('li');
  item.textContent = mensagem;
  logPedido.append(item);
}

function mensagemAmigavel(erro) {
  if (erro.name === 'ValidationError') return 'Informe um nome antes de iniciar a simulação.';
  if (erro.name === 'CookingError') return 'Houve uma falha no preparo. A entrega não foi iniciada.';
  if (erro.name === 'DeliveryError') return 'A pizza ficou pronta, mas a entrega falhou.';
  if (erro instanceof RangeError) return 'Escolha um tempo entre 100 e 10000 ms.';
  return 'Não foi possível concluir esta tentativa. Confira as informações do erro.';
}

async function processarPedido() {
  if (emExecucao) return;
  emExecucao = true;
  definirCarregamento(true);
  logPedido.replaceChildren();
  etapaValidacao.textContent = 'Validação: não iniciada';
  etapaPreparo.textContent = 'Preparo: não iniciado';
  etapaEntrega.textContent = 'Entrega: não iniciada';
  diagnostico.textContent = 'Nenhum erro capturado nesta tentativa.';
  estadoPedido.dataset.estado = 'loading';
  estadoPedido.textContent = 'Iniciando a tentativa...';
  let etapaAtual = 'validacao';

  try {
    registrar('try: validar os dados antes de iniciar o preparo.');
    // novalidate no formulário permite observar esta validação em JavaScript.
    const nome = validarPedido(campoNome.value);
    const delayMs = Number(campoTempo.value);
    if (!Number.isFinite(delayMs) || delayMs < 100 || delayMs > 10000) {
      throw new RangeError('O tempo deve estar entre 100 e 10000 ms.');
    }
    const cenario = campoCenario.value;
    etapaValidacao.textContent = 'Validação: concluída';

    etapaAtual = 'preparo';
    etapaPreparo.textContent = 'Preparo: em andamento';
    estadoPedido.textContent = 'Aguardando o preparo...';
    const pronta = await orderPizza({
      delayMs: delayMs,
      fail: cenario === 'cozinha',
      onProgress: registrar
    });
    etapaPreparo.textContent = 'Preparo: concluído';
    registrar(pronta);

    // Esta etapa só começa se o await de orderPizza tiver sucesso.
    etapaAtual = 'entrega';
    etapaEntrega.textContent = 'Entrega: em andamento';
    estadoPedido.textContent = 'Aguardando a entrega...';
    const entregue = await deliverPizza({
      delayMs: delayMs,
      fail: cenario === 'entrega',
      onProgress: registrar
    });
    etapaEntrega.textContent = 'Entrega: concluída';
    registrar(entregue);
    estadoPedido.dataset.estado = 'success';
    estadoPedido.textContent = nome + ': ' + entregue;
  } catch (erro) {
    if (etapaAtual === 'validacao') etapaValidacao.textContent = 'Validação: falhou';
    else if (etapaAtual === 'preparo') etapaPreparo.textContent = 'Preparo: falhou';
    else etapaEntrega.textContent = 'Entrega: falhou';

    estadoPedido.dataset.estado = 'error';
    estadoPedido.textContent = mensagemAmigavel(erro);
    diagnostico.textContent = 'Nome: ' + erro.name + '\nMensagem: ' + erro.message;
    registrar('catch: erro capturado — ' + erro.name + '.');
    // Diagnóstico técnico; a interface já informa o problema de forma amigável.
    console.error(erro);
  } finally {
    // Limpeza comum ao sucesso, validação inválida e falhas assíncronas.
    registrar('finally: encerrar o carregamento e liberar os controles.');
    definirCarregamento(false);
    emExecucao = false;
    totalFinally = totalFinally + 1;
    document.getElementById('total-finally').textContent = totalFinally;
  }
}

formulario.addEventListener('submit', function (evento) {
  evento.preventDefault();
  processarPedido();
});

let interacoes = 0;
document.getElementById('interagir').addEventListener('click', function () {
  interacoes = interacoes + 1;
  document.getElementById('contador').textContent = 'Interações: ' + interacoes;
});
