# Try/Catch — erros e carregamento com o exemplo da pizza

Esta aula independente ensina a tratar falhas síncronas e assíncronas com `try`, `catch` e `finally`. O exemplo acompanha um pedido: validar os dados, preparar a pizza, entregá-la e encerrar o carregamento, inclusive quando algo dá errado.

O preparo e a entrega são **simulações locais com temporizadores**, executadas no navegador. Depois do guia, pratique em [EXERCICIOS.md](./EXERCICIOS.md) e consulte a [documentação, os sites e os canais indicados](./RECURSOS.md).

## 1. Noções para começar

- Uma **função** reúne instruções. `return` devolve um resultado ao chamador.
- Uma **Promise** representa um resultado futuro. Pode ficar pendente, cumprir com um valor ou rejeitar com um motivo.
- Nos helpers desta aula, `resolve` entrega a string de sucesso e `reject` rejeita a Promise com um erro.
- Uma função `async` retorna uma Promise. Dentro dela, `await` aguarda outra Promise: recebe seu valor ou lança o motivo da rejeição naquele ponto.
- `setTimeout(callback, tempo)` agenda uma função para depois. O tempo é uma espera mínima aproximada, não um horário exato de execução.

Enquanto o pedido aguarda os temporizadores, o navegador pode atender outros eventos. Isso permite clicar no contador da página; não significa que código pesado passe a executar em paralelo.

## 2. Abrir e explorar a demonstração

Abra `index.html` em um navegador atual, com JavaScript habilitado. Você pode abrir o arquivo diretamente: **não é obrigatório iniciar um servidor**, instalar pacotes ou conectar-se à internet para executar a simulação. Os links de estudo, naturalmente, apontam para páginas externas.

Na interface:

1. Mantenha um nome preenchido e escolha **“Preparo e entrega com sucesso”**.
2. Deixe a espera em **3000 ms por etapa** e inicie o pedido.
3. Acompanhe validação, preparo e entrega. O sucesso completo demora aproximadamente seis segundos.
4. Clique em **“Interagir enquanto aguarda”** durante a espera.
5. Observe o carregamento voltar a `false`, os controles serem liberados e o contador de execuções de `finally` aumentar.

Abra as ferramentas de desenvolvimento, normalmente com `F12`, para acompanhar o **Console**. Os exemplos deste guia são para o Console dessa página. Recarregue antes de cada experimento, espere sua conclusão e copie o bloco completo; as chaves externas evitam conflitos entre declarações.

## 3. O código recebido e a extensão didática

O arquivo [codigo-original.js](./codigo-original.js) guarda as funções recebidas para consulta. Cada uma retorna uma Promise que **apenas cumpre**, depois de aproximadamente três segundos:

| Função | Resultado de sucesso |
| --- | --- |
| `orderPizza()` | `'Pizza pronta!'` |
| `deliverPizza()` | `'Pizza entregue!'` |

Esse arquivo não é carregado pelo HTML: a demonstração usa as versões de `pizza.js`, evitando declarar os mesmos nomes duas vezes. Não acrescente os dois scripts à página simultaneamente.

A extensão mantém os nomes e resultados, mas acrescenta opções:

| Opção | Função na simulação |
| --- | --- |
| `delayMs` | Espera da etapa; padrão de `3000` ms. |
| `fail: true` | Faz aquela etapa rejeitar em vez de cumprir. |
| `onProgress` | Callback opcional para receber a mensagem de início da etapa. |

Os helpers não imprimem mensagens implicitamente no Console. A página passa sua função de registro em `onProgress`. Você pode passar `console.log` nos experimentos para acompanhar as mensagens.

## 4. Entender Error, throw e catch

Um objeto `Error` descreve uma falha. Suas propriedades mais usadas aqui são `name`, que identifica o tipo ou nome do erro, e `message`, que explica o problema.

`throw erro` interrompe o fluxo normal e procura um tratamento. O `catch` recebe esse objeto; ele não desfaz automaticamente o trabalho que já aconteceu.

Você pode criar e lançar o erro na mesma instrução:

```js
{
  try {
    throw new Error('Não há ingredientes suficientes.');
  } catch (erro) {
    console.log(erro.name); // Error
    console.log(erro.message); // Não há ingredientes suficientes.
  }
}
```

Experimente a validação síncrona:

```js
{
  try {
    validarPedido('   ');
    console.log('Esta linha não será alcançada.');
  } catch (erro) {
    console.log(erro.name); // ValidationError
    console.log(erro.message); // Informe um nome para identificar o pedido.
  }
}
```

`validarPedido(nome)` lança uma exceção para nomes vazios, compostos só de espaços ou que não sejam strings. Com uma string válida, devolve o nome sem espaços nas extremidades.

`ValidationError`, `CookingError` e `DeliveryError` são nomes atribuídos à propriedade `name` de objetos criados com `new Error(...)`. Este projeto não define classes com esses nomes, e eles não são tipos nativos do JavaScript. Já `RangeError`, usado para um tempo inválido, é um tipo nativo.

## 5. Tratar Promises com async/await

Coloque a validação e os `await` dentro do `try`:

```js
{
  (async () => {
    let carregando = true;

    try {
      const nome = validarPedido('Pedido de estudo');
      const pronta = await orderPizza({ delayMs: 100, onProgress: console.log });
      console.log(pronta); // Pizza pronta!

      const entregue = await deliverPizza({ delayMs: 100, onProgress: console.log });
      console.log(nome + ': ' + entregue); // Pedido de estudo: Pizza entregue!
    } catch (erro) {
      console.log(erro.name, erro.message);
    } finally {
      carregando = false;
      console.log('Carregando:', carregando); // false
    }
  })();
}
```

A função assíncrona imediatamente executada permite usar `await`. O Console pode mostrar uma Promise antes das mensagens; aguarde o resultado.

O preparo e a entrega são **sequenciais**: a chamada a `deliverPizza()` só acontece depois de `orderPizza()` cumprir. Aqui não queremos iniciar os dois ao mesmo tempo, pois a entrega depende de a pizza estar pronta.

Acrescente `fail: true` às opções de `orderPizza()` e repita. A rejeição é observada no primeiro `await`, o fluxo vai ao `catch` e a entrega não começa. Se colocar `fail: true` apenas em `deliverPizza()`, o preparo termina antes da falha da entrega. Em ambos os casos, `finally` encerra o carregamento.

Sem `await`, um `try/catch` em torno da chamada não passa a capturar uma rejeição futura. Você precisa aguardar a Promise dentro do `try` ou tratar a cadeia com `.catch()`.

## 6. Por que o temporizador usa reject

O callback de `setTimeout` executa depois, em outra execução. Um `throw` solto ali não é capturado automaticamente pelo `try` que agendou o temporizador, nem rejeita por si só a Promise da operação.

Este é um **antipadrão ilustrativo, não um exemplo para executar**:

```js
// Não executar: a exceção do callback ficaria sem o tratamento desejado.
// setTimeout(() => { throw new Error('A cozinha falhou'); }, 100);
```

Nos helpers, o callback chama `reject(erro)` e retorna. Assim, a falha pertence à Promise aguardada e chega ao `catch` do consumidor. O caminho de sucesso chama `resolve(...)`.

## 7. O papel de cada bloco na interface

`processarPedido()`, em `index.js`, controla uma tentativa completa:

| Momento | Responsabilidade |
| --- | --- |
| Antes do `try` | Marcar `emExecucao`, iniciar o carregamento e limpar os registros anteriores. |
| `try` | Validar nome e tempo; aguardar preparo e entrega; apresentar sucesso. |
| `catch` | Identificar a etapa que falhou, mostrar uma mensagem amigável e registrar diagnóstico técnico com `console.error(erro)`. |
| `finally` | Encerrar o carregamento, liberar controles, restaurar `aria-busy="false"` e incrementar o contador. |

O formulário usa `novalidate` para que a validação em JavaScript seja observada dentro do `try`. A interface aceita tempos de **100 a 10000 ms**, com padrão de 3000. Os helpers isolados aceitam qualquer número finito não negativo; essa regra é mais ampla que a escolhida para o formulário.

`emExecucao` impede sobrepor pedidos, além de os campos ficarem desabilitados durante a espera. O botão do contador continua disponível. A mensagem de erro é tratada na tela; o diagnóstico vermelho no Console dos cenários de falha é um registro intencional, não uma rejeição sem tratamento.

Compare estes cenários:

| Entrada ou cenário | Resultado esperado |
| --- | --- |
| Nome válido, sucesso | Preparo e entrega concluídos. |
| Falha no preparo | `CookingError`; entrega não iniciada. |
| Falha na entrega | `DeliveryError`; preparo já concluído. |
| Nome vazio | `ValidationError`; nenhum temporizador de preparo iniciado. |
| Tempo fora da faixa da interface | `RangeError`; nenhuma etapa assíncrona iniciada. |

Em cada tentativa iniciada, a limpeza ocorre ao sair do `try/catch`. Depois de uma falha, faça outra tentativa de sucesso para observar a restauração dos controles.

## 8. Avançar: recuperar, relançar e limpar

Capturar um erro não significa necessariamente continuar como se tudo tivesse dado certo. Um `catch` pode apresentar uma mensagem e concluir o fluxo, devolver um resultado alternativo explícito ou **relançar** o erro para outro nível tratar.

```js
{
  (async () => {
    async function preparar() {
      try {
        return await orderPizza({ delayMs: 100, fail: true });
      } catch (erro) {
        console.log('A camada de preparo observou:', erro.name);
        throw erro;
      }
    }

    try {
      await preparar();
    } catch (erro) {
      console.log('O chamador recebeu:', erro.message);
    }
  })();
}
```

O `await` dentro do `try` permite que esse `catch` local observe a rejeição. O tratamento externo evita deixá-la sem acompanhamento. Na demonstração, o controlador trata a falha para atualizar a interface e encerra a tentativa.

Use `finally` para a limpeza comum, não para produzir o resultado do pedido. **Evite `return` dentro de `finally`**: ele pode substituir um retorno anterior ou impedir que um erro continue se propagando. Uma nova falha na própria limpeza também pode esconder o erro original. O bloco não reinicia etapas nem transforma falha em sucesso.

### Bloco finally e método .finally()

O bloco pertence à estrutura `try/catch/finally`. Já `promessa.finally(callback)` acrescenta uma etapa a uma cadeia e devolve uma nova Promise. O callback não recebe o valor de sucesso nem o motivo da rejeição.

```js
{
  (async () => {
    const resultado = await Promise.resolve('Pizza pronta!')
      .finally(() => 'Outra mensagem');

    console.log(resultado); // Pizza pronta!
  })();
}
```

Um retorno normal do callback é ignorado, preservando o resultado anterior. Se ele devolver uma Promise, a cadeia aguarda sua conclusão: cumprir preserva o resultado; rejeitar ou lançar um erro muda o resultado da nova Promise. Portanto, `.finally()` também exige cuidado para não introduzir uma falha durante a limpeza.

## 9. Exercícios e próximos passos

Os [seis exercícios e o desafio final](./EXERCICIOS.md) incluem soluções explicadas: observar sucesso, provocar falhas, validar dados e conferir a limpeza. Tente resolver antes de abrir cada resposta.

Em [RECURSOS.md](./RECURSOS.md), há documentação e aulas de canais reais para aprofundar o tema. Excalidraw é um apoio opcional para desenhar os caminhos de sucesso e falha. Se usar IA, peça: “Mostre em qual linha este fluxo entra no catch e faça uma pergunta antes de dar a solução”. Confira as explicações no código e nas fontes; essas ferramentas não são necessárias para executar o projeto.

## Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `codigo-original.js` | Funções recebidas, somente para consulta. |
| `pizza.js` | Helpers com simulação de falha e validação. |
| `index.js` | Controle da tentativa e atualização da interface. |
| `index.html` e `styles.css` | Página e apresentação visual. |
| `EXERCICIOS.md` e `RECURSOS.md` | Prática com soluções e fontes de estudo. |

O HTML carrega `pizza.js` e depois `index.js`, com `defer`, disponibilizando os helpers antes de conectar os controles.

## Verificação do material

A página foi conferida no Chromium nos cenários de sucesso, falha no preparo, falha na entrega, nome inválido e tempo inválido. Os testes confirmaram a interrupção antes da entrega quando o preparo falha, a liberação dos controles e de `aria-busy` em `finally`, a nova tentativa após erro e a apresentação do nome como texto.

As sete soluções dos exercícios foram executadas e tiveram seus resultados conferidos, incluindo a diferença entre o bloco `finally` e o método `.finally()`, o relançamento do erro e a limpeza antes de o chamador observar o resultado.
