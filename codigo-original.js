// Código fornecido na aula, preservado para consulta.
// Este arquivo de referência não é carregado pelo index.html.
const orderPizza = () => {
  return new Promise((resolve) => {
    console.log('Pedido da pizza enviado para a cozinha...');

    setTimeout(() => {
      resolve('Pizza pronta!');
    }, 3000);
  });
};

// Simular uma API que entrega a pizza.
const deliverPizza = () => {
  return new Promise((resolve) => {
    console.log('A pizza está a caminho...');

    setTimeout(() => {
      resolve('Pizza entregue!');
    }, 3000);
  });
};
