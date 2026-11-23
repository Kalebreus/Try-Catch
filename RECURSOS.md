# Recursos para estudar Try/Catch e carregamento de dados

**Aula: Try/Catch — lidando com erros e carregamento de dados.**

**Links conferidos em 23/11/2026.** Os níveis são sugestões de estudo. Conhecer funções, Promises e `async/await` ajuda a acompanhar a prática.

A demonstração usa `orderPizza` e `deliverPizza` com temporizadores e resultados simulados. Ela funciona localmente, sem serviço externo e sem efetuar pedidos reais.

## Documentação e leitura complementar

| Fonte consultada | Idioma | Nível sugerido | Por que é útil |
| --- | --- | --- | --- |
| [MDN — try...catch](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/try...catch) | Português, com termos em inglês | Iniciante a intermediário | Explica os blocos `try`, `catch` e `finally`, a propagação de exceções e o efeito de um `return` dentro de `finally`. |
| [MDN — throw](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/throw) | Português | Iniciante com noções de funções | Mostra como lançar uma exceção explicitamente, interrompendo o fluxo normal até um tratamento apropriado. |
| [MDN — Error](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Error) | Português | Iniciante a intermediário | Referência para criar erros com uma mensagem e consultar propriedades como `name` e `message`, úteis para explicar uma falha ao usuário e investigar sua origem. |
| [MDN — Promise.prototype.finally](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally) | Português | Intermediário inicial | Permite comparar o método `.finally()` de uma Promise com o bloco `finally` da estrutura de controle. |
| [javascript.info — Error handling, try...catch](https://javascript.info/try-catch) | Inglês | Iniciante a intermediário | Apresenta exemplos de tratamento de erros e explica por que um `try/catch` externo não captura automaticamente uma exceção lançada depois, dentro de um temporizador. |

## Pontos para observar na simulação

- Coloque `await orderPizza(...)` e `await deliverPizza(...)` dentro do `try`. Se uma Promise aguardada rejeitar, o fluxo segue para o `catch`. Se o preparo falhar, a próxima chamada de entrega nessa sequência não será executada.
- Na função que simula uma falha dentro de `setTimeout`, chame `reject(new Error(...))`. Isso rejeita a Promise que o código consumidor está aguardando. Um `throw` solto no callback do temporizador ocorre em outra execução e não rejeita automaticamente aquela Promise nem é capturado pelo `try` externo que iniciou o timer.
- Use `finally` para encerrar o estado de carregamento e restaurar os controles da interface após sucesso ou falha. Mantenha os retornos de resultado no fluxo apropriado: um `return` dentro desse bloco pode substituir um retorno anterior ou impedir a propagação de uma exceção.

## Bloco finally e método .finally()

| Recurso | Como participa do fluxo | Cuidado na prática |
| --- | --- | --- |
| `try { ... } catch { ... } finally { ... }` | O bloco `finally` integra a estrutura de controle e executa a limpeza ao sair de `try`/`catch`. | Evite `return` ou novas falhas na limpeza que escondam o resultado ou o erro original. |
| `promessa.finally(callback)` | O método adiciona um callback à cadeia e retorna uma nova Promise. O callback não recebe o valor de sucesso nem o motivo da rejeição. | Um retorno normal do callback é ignorado, preservando o resultado anterior; lançar um erro ou retornar uma Promise rejeitada muda o resultado da nova Promise. |

## Canais em português

Os canais têm assuntos variados. As videoaulas diretamente relacionadas a este estudo estão na tabela seguinte.

| Canal | Idioma | Nível sugerido | Como aproveitar |
| --- | --- | --- | --- |
| [Serliv — Daniel Tapias Morales](https://www.youtube.com/@serliv) | Português | Iniciante a intermediário | Canal vinculado no [site do autor](https://serliv.com/). A aula abaixo concentra-se em `try/catch` e no lançamento explícito de erros. |
| [LuizTools](https://www.youtube.com/channel/UCtM4fMMVCxrXAmqMJ6ZL5Ww) | Português | Iniciante a intermediário; varia conforme a série | Canal de Luiz Duarte com a aula de `try`, `catch` e `finally` indicada abaixo. |

## Videoaulas específicas verificadas

| Aula e autor | Idioma | Nível sugerido | Relação com a prática |
| --- | --- | --- | --- |
| [Como usar TRY CATCH e THROW ERROR no JAVASCRIPT? AULA para INICIANTES](https://www.youtube.com/watch?v=PknztTlBGUk) — Serliv, Daniel Tapias Morales | Português | Iniciante com noções de funções | O conteúdo indexado apresenta sintaxe, exemplos de `try/catch` e lançamento de erro com `throw`. Serve de base para decidir onde sinalizar e onde tratar uma falha. |
| [Try, Catch e Finally em JavaScript](https://www.youtube.com/watch?v=kyqQArjMM1E) — LuizTools | Português | Iniciante com noções de funções | A descrição confirma o foco nas três estruturas de tratamento de erros. Use como apoio para separar o tratamento da falha da etapa de limpeza. |

A abertura direta dos vídeos falhou na ferramenta; títulos, autores e URLs foram conferidos pelos metadados do YouTube na busca, sem teste de reprodução.

## Roteiro de estudo

1. Leia a estrutura de `try/catch/finally` e identifique o papel de cada bloco no exemplo da pizza.
2. Execute o cenário de sucesso e acompanhe a sequência: iniciar carregamento, preparar, entregar e finalizar a limpeza.
3. Faça `orderPizza` rejeitar. Confira a mensagem recebida no `catch`, a interrupção da sequência e o encerramento do carregamento.
4. Faça apenas `deliverPizza` rejeitar. Compare essa falha com a do preparo e observe quais etapas já foram concluídas.
5. Use um `Error` com mensagem clara e examine suas propriedades no console. Explique a diferença entre sinalizar uma falha e capturá-la.
6. Confira se a interface volta a permitir outra tentativa após cada cenário. Compare o bloco `finally` usado com `async/await` ao método `.finally()` disponível em uma cadeia de Promises.

ChatGPT e Copilot podem apoiar explicações e revisão do código; Excalidraw pode ser usado para desenhar o fluxo. Essas ferramentas são opcionais para executar a demonstração local.
