# Complemento do Backlog: Priorização e Rastreabilidade

Este documento complementa `tasks/weather-app-tasks.md` com a classificação, a sequência de entrega e a cobertura dos requisitos funcionais.

## Priorização e tamanho

| ID | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | P |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | P |
| T-05 | P0 | P |
| T-06 | P0 | P |
| T-07 | P0 | P |
| T-08 | P0 | P |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | M |
| T-12 | P0 | M |
| T-13 | P0 | G |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | P |
| T-17 | P0 | M |
| T-18 | P0 | P |
| T-19 | P0 | M |
| T-20 | P0 | M |
| T-21 | P0 | P |
| T-22 | P1 | P |
| T-23 | P0 | M |
| T-24 | P0 | M |
| T-25 | P0 | M |
| T-26 | P0 | G |
| T-27 | P0 | M |

P0 bloqueia o fluxo principal ou um requisito obrigatório. P1 amplia a evidência e a robustez depois do fluxo principal, sem impedir a primeira demonstração. P2 fica reservado para melhorias fora do escopo atual; não há tarefa P2 neste backlog.

## Fatias verticais de entrega

1. **Fatia 0 - Base executável:** T-01 e T-02. Configuração validada e shell React renderizando; já há algo visível, embora sem funcionalidade meteorológica.
2. **Fatia 1 - Contratos e caminho de dados:** T-03 a T-13. Tipos, validação, conversões, parsing, clientes HTTP, reducer e hook prontos para a UI.
3. **Fatia 2 - Primeira previsão visível:** T-14 a T-20. Formulário, seleção, feedback, clima atual, cinco dias, unidade e composição da tela; começa pelo caso de uma cidade.
4. **Fatia 3 - Evidência automatizada:** T-21 a T-26. Testes unitários, serviços, reducer/hook, componentes e fluxos E2E, incluindo estados alternativos e responsividade.
5. **Fatia 4 - Release hardening:** T-27. Validação final, acessibilidade, concorrência, timeout, campos ausentes e execução completa da suíte.

As fatias respeitam as dependências declaradas: T-12 e T-13 vêm antes dos componentes, e T-20 só entra depois de T-14 a T-19. A primeira demonstração do produto acontece na Fatia 2; a Fatia 0 entrega feedback visual imediato sobre a aplicação inicial.

## Matriz de rastreabilidade: requisitos funcionais

| Requisito funcional | Tarefas que o implementam | Cobertura |
| --- | --- | --- |
| RF-01 Buscar uma cidade | T-05, T-12, T-13, T-14, T-19, T-20, T-21, T-25, T-26 | Coberto |
| RF-02 Resolver a cidade | T-03, T-04, T-08, T-09, T-12, T-13, T-15, T-19, T-20, T-22, T-23, T-25, T-26 | Coberto |
| RF-03 Consultar e exibir o clima atual | T-03, T-04, T-07, T-10, T-11, T-13, T-16, T-20, T-21, T-23, T-25, T-26 | Coberto |
| RF-04 Exibir a previsão diária | T-03, T-04, T-06, T-07, T-10, T-11, T-13, T-17, T-20, T-21, T-23, T-25, T-26 | Coberto |
| RF-05 Alternar unidade de temperatura | T-03, T-06, T-12, T-13, T-18, T-20, T-21, T-24, T-25, T-26 | Coberto |
| RF-06 Estados da interface | T-03, T-09, T-11, T-12, T-13, T-14, T-15, T-19, T-20, T-23, T-24, T-25, T-26 | Coberto |
| RF-07 Repetir e substituir consultas | T-03, T-09, T-11, T-12, T-13, T-19, T-20, T-23, T-24, T-25, T-26 | Coberto |

Não há requisito funcional sem tarefa correspondente. T-21 cobre testes unitários da conversão de unidade; T-23 cobre services com `fetch` mockado; T-25 cobre componentes nos estados loading, erro e vazio; T-26 cobre o fluxo E2E principal, incluindo viewport mobile.