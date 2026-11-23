# Exercícios — try/catch, erros e carregamento

São seis exercícios progressivos e um desafio final. Vamos começar com um erro síncrono e avançar até um fluxo de preparo e entrega com validação, falhas e limpeza.

## Como praticar

Abra a demonstração no navegador e use o **Console** das ferramentas de desenvolvimento. Todos os exemplos são simulações locais, sem serviço real de pedidos ou entregas.

**Recarregue a página antes de cada exercício.** Copie cada bloco inteiro, incluindo as chaves `{ ... }`, e espere a execução terminar antes de iniciar outro. As variáveis ficam locais ao bloco e as soluções não alteram a interface nem adicionam listeners.

Cada solução usa uma função assíncrona executada imediatamente: `(async () => { ... })()`. O Console pode mostrar `Promise {<pending>}` ou outro resultado do bloco; aguarde os `console.log()` indicados.

Os helpers disponíveis são:

- `orderPizza({ delayMs, fail, onProgress })`: retorna uma Promise com `'Pizza pronta!'`, ou rejeita com erro chamado `CookingError`.
- `deliverPizza({ delayMs, fail, onProgress })`: retorna uma Promise com `'Pizza entregue!'`, ou rejeita com erro chamado `DeliveryError`.
- `validarPedido(nome)`: retorna o nome sem espaços nas pontas ou lança um erro chamado `ValidationError`.

Os nomes `CookingError`, `DeliveryError` e `ValidationError` são identificadores definidos no código da demonstração por meio de `erro.name`. Não são classes nativas do JavaScript; os objetos continuam sendo instâncias de `Error`.

Usaremos `delayMs: 10` para acelerar os exercícios. O padrão dos helpers continua sendo 3.000 ms por etapa. Não confira durações exatas: os timers dependem do agendamento do navegador.

Os helpers não escrevem mensagens no Console automaticamente. Para observar o início de cada etapa, passamos uma função em `onProgress` quando necessário.

## 1. Básico — lançar, capturar e continuar

**Objetivo:** observar o efeito de um erro síncrono dentro de `try`.

1. Lance um `Error` com a mensagem `'Falha de teste.'`.
2. Confira seu nome e sua mensagem no `catch`.
3. Registre uma mensagem depois do bloco para demonstrar que a execução continuou.

<details>
<summary>Ver solução, resultados e explicação</summary>

```js
{
  (async () => {
    try {
      throw new Error('Falha de teste.');
      console.log('Esta linha não deve aparecer.');
    } catch (erro) {
      console.log(erro.name); // Error
      console.log(erro.message); // Falha de teste.
      console.log(erro instanceof Error); // true
    }

    console.log('O código continuou.'); // O código continuou.
  })();
}
```

`throw` interrompe a execução normal do `try`. A linha seguinte dentro dele não executa; o controle passa para o `catch`.

Depois do tratamento, a execução segue adiante. Neste exemplo, o erro foi tratado sem ser lançado novamente.

O `try/catch` não é um observador de qualquer erro futuro da aplicação: ele protege o fluxo executado naquele trecho. Para rejeições assíncronas, precisaremos aguardar a Promise dentro do `try`, como nos próximos exercícios.

</details>

## 2. Básico — validar antes de iniciar o trabalho

**Objetivo:** impedir um preparo quando o nome do pedido é inválido.

1. Crie uma função assíncrona que valide o nome antes de chamar `orderPizza()`.
2. Conte quantos preparos foram iniciados.
3. Teste um nome com apenas espaços e trate a falha.
4. Teste `'  Ana  '` e confira o nome normalizado e o resultado.

<details>
<summary>Ver solução, resultados e explicação</summary>

```js
{
  (async () => {
    let preparosIniciados = 0;

    async function prepararPara(nome) {
      const nomeValido = validarPedido(nome);
      preparosIniciados += 1;

      const resultado = await orderPizza({ delayMs: 10 });
      return `${nomeValido}: ${resultado}`;
    }

    try {
      await prepararPara('   ');
    } catch (erro) {
      console.log(erro.name); // ValidationError
      console.log(erro.message); // Informe um nome para identificar o pedido.
    }

    console.log(preparosIniciados); // 0

    const resultado = await prepararPara('  Ana  ');
    console.log(resultado); // Ana: Pizza pronta!
    console.log(preparosIniciados); // 1
  })();
}
```

`validarPedido()` é síncrona e lança um erro quando o nome não é válido. Como ela é chamada dentro de uma função `async`, essa falha faz a Promise de `prepararPara()` rejeitar. O `await` dentro do `try` permite capturar essa rejeição.

A contagem continua em zero no primeiro teste porque a execução não chegou à linha que inicia o preparo. No segundo teste, a validação remove os espaços das pontas e o pedido segue normalmente.

Validar antes de iniciar trabalho evita executar operações que já sabemos que não deveriam acontecer.

</details>

## 3. Intermediário — aguardar preparo e entrega com limpeza

**Objetivo:** executar as duas etapas em sequência e encerrar o estado de carregamento.

1. Ative uma variável local `carregando` antes do `try`.
2. Aguarde `orderPizza()` e só depois chame `deliverPizza()`.
3. Use `onProgress` para registrar o início de cada etapa.
4. Em `finally`, defina `carregando` como `false`.

<details>
<summary>Ver solução, resultados e explicação</summary>

```js
{
  (async () => {
    let carregando = true;
    console.log(carregando); // true

    try {
      const pizza = await orderPizza({
        delayMs: 10,
        onProgress: (mensagem) => console.log(mensagem)
      });
      // Pedido da pizza enviado para a cozinha...
      console.log(pizza); // Pizza pronta!

      const entrega = await deliverPizza({
        delayMs: 10,
        onProgress: (mensagem) => console.log(mensagem)
      });
      // A pizza está a caminho...
      console.log(entrega); // Pizza entregue!
    } finally {
      carregando = false;
      console.log(carregando); // false
    }
  })();
}
```

A ordem das mensagens será: `true`, início do preparo, `Pizza pronta!`, início da entrega, `Pizza entregue!` e `false`.

O segundo helper só é chamado depois de o primeiro terminar com sucesso. Neste fluxo, a entrega depende do preparo; não queremos iniciar as duas etapas concorrentemente.

`finally` executa quando o fluxo sai do `try`, tanto no sucesso quanto em uma falha. Ele serve para limpeza, mas não captura a falha por conta própria. Aqui usamos um cenário de sucesso; nos próximos exercícios acrescentaremos o `catch`.

Na interface da demonstração, a mesma ideia permite reabilitar controles, ajustar `aria-busy` e encerrar o estado de carregamento. Aqui alteramos apenas uma variável local.

</details>

## 4. Intermediário — falha no preparo deve impedir a entrega

**Objetivo:** conferir qual etapa deixou de executar depois de uma rejeição.

1. Configure `orderPizza()` com `fail: true`.
2. Coloque a chamada à entrega depois do `await` do preparo.
3. Use uma flag para identificar se a entrega chegou a ser iniciada.
4. Trate o erro e encerre o carregamento em `finally`.

<details>
<summary>Ver solução, resultados e explicação</summary>

```js
{
  (async () => {
    let carregando = true;
    let entregaIniciada = false;

    try {
      await orderPizza({ delayMs: 10, fail: true });

      entregaIniciada = true;
      await deliverPizza({ delayMs: 10 });
    } catch (erro) {
      console.log(erro.name); // CookingError
      console.log(erro.message); // A cozinha não conseguiu preparar a pizza.
      console.log(erro instanceof Error); // true
    } finally {
      carregando = false;
    }

    console.log(entregaIniciada); // false
    console.log(carregando); // false
  })();
}
```

A rejeição do preparo é observada no `await`. O fluxo passa diretamente para o `catch`, sem chegar à atribuição de `entregaIniciada` nem à chamada de `deliverPizza()`.

`CookingError` é o nome atribuído ao objeto de erro pelo helper. Não usamos `instanceof CookingError`, pois a demonstração não declarou uma classe com esse nome.

O helper chama `reject(erro)` dentro do callback do timer. Lançar um `throw` naquele callback posterior não faria o `try/catch` externo capturá-lo automaticamente.

</details>

## 5. Intermediário — falha na entrega após preparo bem-sucedido

**Objetivo:** distinguir uma falha na segunda etapa de uma falha no pedido inteiro desde o início.

1. Deixe o preparo concluir normalmente.
2. Registre que ele terminou.
3. Configure a entrega com `fail: true`.
4. Trate o erro de entrega e confira o estado final do carregamento.

<details>
<summary>Ver solução, resultados e explicação</summary>

```js
{
  (async () => {
    let carregando = true;
    let preparoConcluido = false;

    try {
      console.log(await orderPizza({ delayMs: 10 })); // Pizza pronta!
      preparoConcluido = true;

      console.log(await deliverPizza({ delayMs: 10, fail: true }));
      // Não há mensagem de sucesso da entrega: o await rejeita.
    } catch (erro) {
      console.log(erro.name); // DeliveryError
      console.log(erro.message); // A entrega não pôde ser concluída.
    } finally {
      carregando = false;
    }

    console.log(preparoConcluido); // true
    console.log(carregando); // false
  })();
}
```

O sucesso do preparo aconteceu e não é desfeito pela falha da entrega. A flag permite conferir isso sem interpretar toda falha como se nenhuma etapa tivesse ocorrido.

No `console.log(await deliverPizza(...))`, o argumento precisa ser avaliado antes de `console.log()` executar. Como o `await` rejeita, essa chamada não imprime uma mensagem de entrega concluída.

Em uma interface, a mensagem ao usuário pode explicar que o preparo terminou, mas a entrega falhou. O diagnóstico técnico pode preservar o erro original; não é necessário expor uma stack trace na página.

</details>

## 6. Avançado neste tema — quando finally mascara um erro

**Objetivo:** comparar um bloco `finally` com o callback de `.finally()`.

1. Observe um exemplo propositalmente incorreto: um bloco `finally` retorna uma mensagem mesmo depois de uma rejeição.
2. Reescreva a ideia usando `finally` apenas para limpeza e confira que a falha chega ao chamador.
3. Compare com `.finally(() => 'Outro valor')` em uma Promise bem-sucedida.

<details>
<summary>Ver solução, resultados e explicação</summary>

```js
{
  (async () => {
    // INCORRETO: serve apenas para observar o erro de implementação.
    async function fluxoIncorreto() {
      try {
        await orderPizza({ delayMs: 10, fail: true });
      } finally {
        return 'Sucesso aparente';
      }
    }

    console.log(await fluxoIncorreto()); // Sucesso aparente

    let carregando = true;

    async function fluxoCorreto() {
      try {
        return await orderPizza({ delayMs: 10, fail: true });
      } finally {
        carregando = false;
      }
    }

    try {
      await fluxoCorreto();
    } catch (erro) {
      console.log(erro.name); // CookingError
    }

    console.log(carregando); // false

    const valor = await Promise.resolve('Valor original').finally(() => {
      return 'Outro valor';
    });

    console.log(valor); // Valor original
  })();
}
```

No exemplo incorreto, o `return` do **bloco** `finally` substitui a falha anterior. O chamador recebe uma Promise cumprida com `'Sucesso aparente'`, embora o preparo tenha falhado. Esse comportamento não deve ser usado para limpar estado.

Na versão correta, `finally` apenas redefine a variável. A rejeição continua chegando ao `catch` do chamador.

O `return await` mantém a espera dentro do `try`, de modo que a limpeza ocorra após a operação terminar. Devolver a Promise sem aguardá-la faria o bloco `finally` executar cedo demais para esse objetivo.

Já o **callback** de `.finally()` tem outra regra: retornar um valor comum não substitui o resultado anterior. Por isso `'Valor original'` foi preservado. Entretanto, se esse callback lançar um erro ou retornar uma Promise rejeitada, a cadeia passa a rejeitar com essa nova falha.

</details>

## Desafio final — criar um fluxo reutilizável sem esconder falhas

**Objetivo:** reunir validação, sequência, diagnóstico e limpeza em uma função assíncrona.

Crie `executarPedido(nome, opcoes)` e teste um cenário de cada vez. A função deve:

1. Ativar o carregamento antes do `try`.
2. Validar o nome antes de iniciar o preparo.
3. Aguardar preparo e entrega nessa ordem.
4. Registrar o nome do erro no `catch` e **lançar o mesmo erro novamente**.
5. Encerrar o carregamento em `finally`, incluindo erros de validação.
6. Permitir ao chamador observar o resultado ou a rejeição depois da limpeza.

Confira estes estados finais:

| Cenário | Resultado observado | Preparo concluído | Entrega iniciada | Carregando |
| --- | --- | --- | --- | --- |
| Sucesso | `'Pizza entregue!'` | `true` | `true` | `false` |
| Falha no preparo | `CookingError` | `false` | `false` | `false` |
| Falha na entrega | `DeliveryError` | `true` | `true` | `false` |
| Nome vazio | `ValidationError` | `false` | `false` | `false` |

<details>
<summary>Ver uma solução completa e explicada</summary>

```js
{
  (async () => {
    const estado = {
      carregando: false,
      preparoConcluido: false,
      entregaIniciada: false
    };

    async function executarPedido(nome, opcoes = {}) {
      estado.carregando = true;
      estado.preparoConcluido = false;
      estado.entregaIniciada = false;

      try {
        const nomeValido = validarPedido(nome);

        const pizza = await orderPizza({
          delayMs: 10,
          fail: opcoes.falharPreparo === true
        });
        estado.preparoConcluido = true;

        estado.entregaIniciada = true;
        const entrega = await deliverPizza({
          delayMs: 10,
          fail: opcoes.falharEntrega === true
        });

        return { nome: nomeValido, pizza, entrega };
      } catch (erro) {
        console.log('Erro registrado:', erro.name);
        throw erro;
      } finally {
        estado.carregando = false;
      }
    }

    async function testar(rotulo, nome, opcoes) {
      try {
        const pedido = await executarPedido(nome, opcoes);
        console.log(`${rotulo}: ${pedido.nome} - ${pedido.entrega}`);
      } catch (erro) {
        console.log(`${rotulo}: ${erro.name}`);
      }

      console.log(
        `${rotulo}: carregando=${estado.carregando}, ` +
        `preparo=${estado.preparoConcluido}, entrega=${estado.entregaIniciada}`
      );
    }

    await testar('Sucesso', '  Ana  ', {});
    await testar('Preparo', 'Ana', { falharPreparo: true });
    await testar('Entrega', 'Ana', { falharEntrega: true });
    await testar('Validação', '   ', {});
  })();
}
```

Saída esperada, nesta ordem:

```text
Sucesso: Ana - Pizza entregue!
Sucesso: carregando=false, preparo=true, entrega=true
Erro registrado: CookingError
Preparo: CookingError
Preparo: carregando=false, preparo=false, entrega=false
Erro registrado: DeliveryError
Entrega: DeliveryError
Entrega: carregando=false, preparo=true, entrega=true
Erro registrado: ValidationError
Validação: ValidationError
Validação: carregando=false, preparo=false, entrega=false
```

O `catch` de `executarPedido()` faz o registro e usa `throw erro` para preservar a rejeição original. Retornar uma mensagem nesse lugar recuperaria a Promise e faria o chamador receber um sucesso, contrariando o objetivo do desafio.

O `finally` executa antes de o chamador observar o retorno ou a rejeição. Por isso `testar()` sempre encontra `carregando` como `false`, inclusive quando a validação falha antes de qualquer timer ser iniciado.

As flags de preparo e entrega mostram até onde o pedido avançou. Uma falha na cozinha não começa a entrega; uma falha na entrega não apaga o preparo já concluído.

Os quatro testes são aguardados sequencialmente. Eles compartilham um estado local apenas para esta prática; não disparamos pedidos simultâneos nem alteramos os controles da página.

</details>
