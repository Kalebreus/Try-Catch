// Extensão didática do código da aula. Todas as operações são simulações locais.
// delayMs permite acelerar os exercícios; o padrão original continua sendo 3000 ms.
// onProgress recebe as mensagens iniciais, sem gerar logs implícitos no Console.

function orderPizza(opcoes = {}) {
  const delayMs = opcoes.delayMs === undefined ? 3000 : opcoes.delayMs;
  const deveFalhar = opcoes.fail === true;

  return new Promise(function (resolve, reject) {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
      reject(new RangeError('O tempo de preparo precisa ser um número não negativo.'));
      return;
    }

    if (typeof opcoes.onProgress === 'function') {
      opcoes.onProgress('Pedido da pizza enviado para a cozinha...');
    }

    setTimeout(function () {
      if (deveFalhar) {
        const erro = new Error('A cozinha não conseguiu preparar a pizza.');
        erro.name = 'CookingError';
        reject(erro);
        return;
      }
      resolve('Pizza pronta!');
    }, delayMs);
  });
}

function deliverPizza(opcoes = {}) {
  const delayMs = opcoes.delayMs === undefined ? 3000 : opcoes.delayMs;
  const deveFalhar = opcoes.fail === true;

  return new Promise(function (resolve, reject) {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
      reject(new RangeError('O tempo de entrega precisa ser um número não negativo.'));
      return;
    }

    if (typeof opcoes.onProgress === 'function') {
      opcoes.onProgress('A pizza está a caminho...');
    }

    setTimeout(function () {
      if (deveFalhar) {
        const erro = new Error('A entrega não pôde ser concluída.');
        erro.name = 'DeliveryError';
        reject(erro);
        return;
      }
      resolve('Pizza entregue!');
    }, delayMs);
  });
}

// throw manual e síncrono: o chamador deve tratar a validação dentro do try.
function validarPedido(nome) {
  if (typeof nome !== 'string' || nome.trim() === '') {
    const erro = new Error('Informe um nome para identificar o pedido.');
    erro.name = 'ValidationError';
    throw erro;
  }
  return nome.trim();
}
