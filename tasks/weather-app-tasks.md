# Backlog do Weather App

Fonte: `plans/weather-app-plan.md`.

Cada tarefa tem um alvo principal e deve ser implementável e verificável dentro de suas dependências.

Ordem de implementação: fundação técnica → tipos → funções puras → services → hook → componentes → integração → testes → hardening.

## Sequência de implementação

1. Fundação técnica: T-01, T-02
2. Tipos: T-03, T-04
3. Funções puras: T-05, T-06, T-07
4. Services e contratos de API: T-08, T-09, T-10, T-11
5. Hook e fluxo de estado: T-12, T-13
6. Componentes e UI: T-14, T-15, T-16, T-17, T-18, T-19
7. Integração da tela: T-20
8. Testes: T-21, T-22, T-23, T-24, T-25, T-26
9. Hardening e validação final: T-27

Dependências estruturais:
- Qualquer tarefa de tipos depende da base técnica concluída.
- Funções puras dependem dos tipos definidos.
- Services dependem dos contratos de domínio e das funções puras.
- O hook depende dos services e do reducer.
- Componentes dependem do hook e das regras puras.
- A integração da tela acontece somente após UI isolada.
- Testes só iniciam após integração e serviços estabilizados.
- Hardening depende da suíte de testes e da validação completa.

## Fundação técnica

### T-01 — Configurar a base técnica
- ID: T-01
- Título: Configurar a base técnica
- Descrição curta: Garantir Vite, TypeScript strict, Tailwind, Biome e Vitest configurados.
- Critérios de aceite:
  - [ ] `pnpm dev`, `pnpm build`, `pnpm lint` e `pnpm test` estão definidos e iniciam sem erro de configuração.
  - [ ] `tsconfig` mantém `strict: true` e `pnpm build` conclui com código de saída zero.
- Rastreabilidade: RNF-07; estratégia de validação.
- Dependências: Nenhuma
- Arquivos prováveis: `package.json`, `vite.config.ts`, `tsconfig*.json`, `tailwind.config.js`, `biome.json`
- Tipo: Infra

### T-02 — Criar o esqueleto da aplicação
- ID: T-02
- Título: Criar o esqueleto da aplicação
- Descrição curta: Criar os diretórios previstos e o ponto de entrada mínimo que renderiza o componente raiz.
- Critérios de aceite:
  - [ ] Existem `src/components`, `src/services`, `src/hooks`, `src/lib`, `src/types` e `tests`.
  - [ ] `src/main.tsx` renderiza `App` e `pnpm build` conclui sem erro de módulo ou TypeScript.
- Rastreabilidade: plano técnico, seção Project Structure; RNF-07.
- Dependências: T-01
- Arquivos prováveis: `src/main.tsx`, `src/App.tsx`, diretórios de `src/` e `tests/`
- Tipo: Infra

## Entrega 1 — Tipos do domínio

As tarefas desta entrega definem os contratos internos e externos antes de qualquer regra de negócio ou acesso à rede.

### T-03 — Definir os tipos internos do domínio meteorológico
- ID: T-03
- Título: Definir os tipos internos do domínio meteorológico
- Descrição curta: Modelar localidades, clima atual, previsão, erros, unidades e estados da aplicação.
- Critérios de aceite:
  - [ ] Os tipos incluem `Location`, `CurrentWeather`, `DailyWeather`, `WeatherReport`, `WeatherError` e `WeatherState`.
  - [ ] Temperaturas internas permanecem em Celsius e campos opcionais usam `undefined`.
  - [ ] Os estados cobrem `idle`, `validating`, `loading-location`, `selecting-location`, `loading-weather`, `success`, `empty` e `error`, além da unidade ativa.
- Rastreabilidade: RF-03, RF-04, RF-05, RF-06, RF-07; CA-06, CA-07, CA-08, CA-09.
- Dependências: T-02
- Arquivos prováveis: `src/types/weather.ts`
- Tipo: Data

### T-04 — Definir os tipos das respostas externas
- ID: T-04
- Título: Definir os tipos das respostas externas
- Descrição curta: Separar os contratos de geocoding e forecast dos tipos consumidos pela UI.
- Critérios de aceite:
  - [ ] Há tipos próprios para os payloads externos de geocoding e forecast.
  - [ ] Os tipos representam campos opcionais e arrays usados na validação runtime, incluindo `results`, `current`, `daily`, `time` e temperaturas.
- Rastreabilidade: contrato de integração, seções 4.1 e 4.2; RNF-05.
- Dependências: T-03
- Arquivos prováveis: `src/types/api.ts`
- Tipo: Data

## Entrega 2 — Funções puras

As tarefas desta entrega não fazem chamadas HTTP nem dependem de estado global.

### T-05 — Implementar a normalização e validação de busca
- ID: T-05
- Título: Implementar a normalização e validação de busca
- Descrição curta: Criar funções puras para aparar, validar e classificar o termo pesquisado.
- Critérios de aceite:
  - [ ] Espaços externos são removidos e entradas vazias ou inválidas são rejeitadas.
  - [ ] Nenhuma função depende de estado global ou dispara efeitos colaterais, e o termo normalizado vazio é rejeitado antes de qualquer chamada de serviço.
- Rastreabilidade: RF-01; CA-01, CA-02; RNF-05.
- Dependências: T-03
- Arquivos prováveis: `src/lib/validation.ts`
- Tipo: Data

### T-06 — Implementar conversão e formatação de temperatura
- ID: T-06
- Título: Implementar conversão e formatação de temperatura
- Descrição curta: Centralizar conversão Celsius/Fahrenheit e arredondamento para apresentação.
- Critérios de aceite:
  - [ ] As conversões implementam `F = (C * 9 / 5) + 32` e `C = (F - 32) * 5 / 9` sem conversão acumulada.
  - [ ] A apresentação arredonda ao inteiro mais próximo, exibe `°C` ou `°F` e ausências não geram `NaN`.
- Rastreabilidade: RF-05; CA-07; RNF-08.
- Dependências: T-03
- Arquivos prováveis: `src/lib/temperature.ts`, `src/lib/format.ts`
- Tipo: Data

### T-07 — Implementar o mapeamento de códigos meteorológicos
- ID: T-07
- Título: Implementar o mapeamento de códigos meteorológicos
- Descrição curta: Mapear códigos WMO para descrição e rótulo de ícone, incluindo códigos desconhecidos.
- Critérios de aceite:
  - [ ] O mapeamento cobre céu limpo, nuvens, neblina, chuva, neve e tempestade.
  - [ ] Código desconhecido retorna exatamente `Condição indisponível` sem lançar exceção.
- Rastreabilidade: RF-03, RF-04; contrato de integração, seção 4.3; RNF-05, RNF-08.
- Dependências: T-03
- Arquivos prováveis: `src/lib/weather-code.ts`
- Tipo: Data

## Entrega 3 — Services e contratos de API
### T-08 — Validar e transformar geocoding
- ID: T-08
- Título: Validar e transformar geocoding
- Descrição curta: Converter um payload de geocoding em `Location[]` sem realizar chamadas HTTP.
- Critérios de aceite:
  - [ ] `results` ausente ou vazio produz lista vazia.
  - [ ] Só localidades com nome e coordenadas numéricas são aceitas.
  - [ ] Payload incompleto é tratado sem exceção não controlada e localidades válidas preservam nome, país e coordenadas.
- Rastreabilidade: RF-02; CA-04, CA-05; contrato de integração, seção 4.1; RNF-05.
- Dependências: T-03, T-04, T-05
- Arquivos prováveis: `src/services/geocoding.ts`
- Tipo: Data

### T-09 — Implementar o cliente HTTP de geocoding
- ID: T-09
- Título: Implementar o cliente HTTP de geocoding
- Descrição curta: Encapsular a requisição de localidades, timeout e conversão de erros.
- Critérios de aceite:
  - [ ] A chamada usa `name`, `count`, `language=pt` e `format=json`.
  - [ ] Timeout de 10 segundos e `AbortSignal` são respeitados.
  - [ ] Erros de rede, timeout e HTTP são convertidos para `WeatherError` com `kind`, mensagem em pt-BR e indicação de retry.
- Rastreabilidade: RF-02, RF-06, RF-07; CA-01, CA-05, CA-08; RNF-03, RNF-04, RNF-05, RNF-08.
- Dependências: T-08
- Arquivos prováveis: `src/services/geocoding.ts`
- Tipo: Data

### T-10 — Validar e transformar forecast
- ID: T-10
- Título: Validar e transformar forecast
- Descrição curta: Converter o payload meteorológico em `WeatherReport` com dados alinhados.
- Critérios de aceite:
  - [ ] `timezone`, bloco diário e cinco datas válidas são exigidos.
  - [ ] Dados atuais e diários são associados corretamente por índice/data.
  - [ ] Arrays inconsistentes e campos ausentes resultam em resposta inválida ou indisponível, sem `undefined`, `null` ou `NaN` na saída.
- Rastreabilidade: RF-03, RF-04; CA-06; contrato de integração, seção 4.2; RNF-05, RNF-08.
- Dependências: T-03, T-04
- Arquivos prováveis: `src/services/forecast.ts`
- Tipo: Data

### T-11 — Implementar o cliente HTTP de forecast
- ID: T-11
- Título: Implementar o cliente HTTP de forecast
- Descrição curta: Encapsular a chamada de previsão para uma localidade, com coordenadas e timeout.
- Critérios de aceite:
  - [ ] A consulta usa campos atuais/diários, cinco dias, `timezone=auto` e Celsius.
  - [ ] Coordenadas inválidas são rejeitadas antes do `fetch`.
  - [ ] HTTP inválido, JSON quebrado e payload incompleto viram `WeatherError` tratável e não atualizam a tela com dados parciais inválidos.
- Rastreabilidade: RF-03, RF-06; CA-03, CA-08; RNF-04, RNF-05.
- Dependências: T-09, T-10
- Arquivos prováveis: `src/services/forecast.ts`
- Tipo: Data

## Entrega 4 — Hook e fluxo de estado

### T-12 — Implementar o reducer do fluxo meteorológico
- ID: T-12
- Título: Implementar o reducer do fluxo meteorológico
- Descrição curta: Modelar transições puras para busca, seleção, sucesso, erro, retry e unidade.
- Critérios de aceite:
  - [ ] O reducer mantém status, query, localidades, seleção, relatório, unidade e erro.
  - [ ] Nova busca limpa resultados antigos e `requestId` descarta respostas obsoletas.
  - [ ] Retry repete a última operação válida sem nova digitação.
- Rastreabilidade: RF-02, RF-05, RF-06, RF-07; CA-07, CA-08, CA-09; RNF-05.
- Dependências: T-03, T-05, T-06, T-07
- Arquivos prováveis: `src/hooks/weatherReducer.ts`
- Tipo: Data

### T-13 — Implementar o hook de busca e concorrência
- ID: T-13
- Título: Implementar o hook de busca e concorrência
- Descrição curta: Conectar o reducer aos serviços, abort controllers e operações de localização/clima.
- Critérios de aceite:
  - [ ] O hook expõe estado e ações para submeter, selecionar, repetir e trocar unidade.
  - [ ] Requisições anteriores podem ser abortadas e nunca sobrescrevem a operação mais recente.
  - [ ] Falhas de serviço chegam ao estado com `WeatherError.kind`, mensagem em pt-BR e `retryable` coerentes com a falha.
- Rastreabilidade: RF-02, RF-05, RF-06, RF-07; CA-08, CA-09; RNF-04, RNF-05.
- Dependências: T-09, T-11, T-12
- Arquivos prováveis: `src/hooks/useWeatherSearch.ts`
- Tipo: Data

## Entrega 5 — Componentes

### T-14 — Implementar o formulário de busca
- ID: T-14
- Título: Implementar o formulário de busca
- Descrição curta: Criar a entrada acessível que valida e submete uma consulta.
- Critérios de aceite:
  - [ ] Entrada vazia não dispara rede e apresenta validação associada ao campo.
  - [ ] Loading bloqueia submissões duplicadas equivalentes.
  - [ ] Label, role, mensagem de erro e foco são acessíveis por teclado e o texto submetido permanece após erro.
- Rastreabilidade: RF-01, RF-06; CA-01, CA-02; RNF-02, RNF-08.
- Dependências: T-05, T-13
- Arquivos prováveis: `src/components/SearchForm.tsx`
- Tipo: UI

### T-15 — Implementar a seleção de localidade
- ID: T-15
- Título: Implementar a seleção de localidade
- Descrição curta: Renderizar resultados e iniciar forecast após seleção explícita.
- Critérios de aceite:
  - [ ] Cada opção exibe nome, país e, quando disponíveis, estado/região e código do país.
  - [ ] Com duas ou mais opções, nenhum forecast é chamado antes da seleção; selecionar uma opção dispara exatamente um forecast pelas coordenadas escolhidas.
  - [ ] Zero resultados exibe estado vazio, não chama forecast e não mantém relatório anterior.
- Rastreabilidade: RF-02, RF-06; CA-04, CA-05; RNF-02, RNF-08.
- Dependências: T-13, T-14
- Arquivos prováveis: `src/components/LocationOptions.tsx`
- Tipo: UI

### T-16 — Implementar o resumo do clima atual
- ID: T-16
- Título: Implementar o resumo do clima atual
- Descrição curta: Renderizar temperatura, descrição e placeholders do clima atual.
- Critérios de aceite:
  - [ ] Temperatura e descrição aparecem quando disponíveis.
  - [ ] Nome da localidade, país e unidade ativa aparecem junto do resumo.
  - [ ] Ausências nunca exibem `undefined`, `null` ou `NaN` e mostram placeholder explícito.
- Rastreabilidade: RF-03; CA-06; RNF-05, RNF-08.
- Dependências: T-06, T-07, T-13
- Arquivos prováveis: `src/components/CurrentWeather.tsx`
- Tipo: UI

### T-17 — Implementar a previsão diária
- ID: T-17
- Título: Implementar a previsão diária
- Descrição curta: Renderizar cinco dias com máximas, mínimas e condição meteorológica.
- Critérios de aceite:
  - [ ] São renderizadas exatamente cinco entradas, em ordem cronológica, cada uma com data, mínima, máxima, condição e unidade.
  - [ ] Campos ausentes usam placeholders sem remover ou reordenar a entrada.
- Rastreabilidade: RF-04; CA-03, CA-06; RNF-01, RNF-05, RNF-08.
- Dependências: T-06, T-07, T-13
- Arquivos prováveis: `src/components/DailyForecast.tsx`
- Tipo: UI

### T-18 — Implementar o controle de unidade
- ID: T-18
- Título: Implementar o controle de unidade
- Descrição curta: Permitir alternar Celsius/Fahrenheit apenas na projeção visual.
- Critérios de aceite:
  - [ ] O controle altera a unidade exibida sem alterar o relatório em Celsius.
  - [ ] A troca não dispara nova chamada de rede.
  - [ ] Celsius é a opção inicial; o controle é operável por teclado, indica a unidade ativa visual e semanticamente e exibe o símbolo correto.
- Rastreabilidade: RF-05; CA-07; RNF-02, RNF-08.
- Dependências: T-06, T-13
- Arquivos prováveis: `src/components/TemperatureUnitToggle.tsx`
- Tipo: UI

### T-19 — Implementar estados de feedback
- ID: T-19
- Título: Implementar estados de feedback
- Descrição curta: Exibir loading, erro, retry e mensagens de operação em português.
- Critérios de aceite:
  - [ ] Os estados inicial, validação, loading de localização, seleção, loading de clima, sucesso, vazio e erro são identificáveis na UI.
  - [ ] Erros de validação, rede, timeout e HTTP exibem mensagem compreensível em pt-BR.
  - [ ] Retry fica disponível quando a operação for recuperável e repete a última operação sem exigir nova digitação.
- Rastreabilidade: RF-01, RF-02, RF-06, RF-07; CA-01, CA-02, CA-05, CA-08; RNF-03, RNF-04, RNF-08.
- Dependências: T-13, T-14
- Arquivos prováveis: `src/components/WeatherStatus.tsx`
- Tipo: UI

## Entrega 6 — Integração da aplicação

### T-20 — Compor a tela principal
- ID: T-20
- Título: Compor a tela principal
- Descrição curta: Integrar hook, busca, seleção, clima, previsão, unidade e feedback no componente raiz.
- Critérios de aceite:
  - [ ] `App` encaminha estado e ações sem componentes visuais chamarem APIs diretamente.
  - [ ] Todos os estados do fluxo são renderizados sem sobreposição, rolagem horizontal ou dados antigos após nova busca.
  - [ ] O fluxo permanece utilizável em 320 px, 768 px e 1280 px.
- Rastreabilidade: RF-01 a RF-07; CA-01 a CA-10; RNF-01, RNF-02, RNF-08.
- Dependências: T-14, T-15, T-16, T-17, T-18, T-19
- Arquivos prováveis: `src/App.tsx`
- Tipo: UI

## Entrega 7 — Testes e garantia de qualidade

### T-21 — Testar utilitários de domínio
- ID: T-21
- Título: Testar utilitários de domínio
- Descrição curta: Cobrir normalização, temperatura, formatação e códigos WMO com testes unitários.
- Critérios de aceite:
  - [ ] Existem testes para aparo/validação de termo, ambas as fórmulas de temperatura, arredondamento, valores ausentes e códigos WMO conhecidos e desconhecidos.
  - [ ] Os testes são determinísticos, não usam rede e verificam `Condição indisponível` para código desconhecido.
- Rastreabilidade: RF-01, RF-03, RF-04, RF-05; CA-01, CA-02, CA-06, CA-07; RNF-05, RNF-08.
- Dependências: T-05, T-06, T-07
- Arquivos prováveis: `tests/lib/**`
- Tipo: Test

### T-22 — Testar transformação de geocoding
- ID: T-22
- Título: Testar transformação de geocoding
- Descrição curta: Cobrir payloads válidos, vazios e inválidos do parser de localidades.
- Critérios de aceite:
  - [ ] Há testes para `results` ausente/vazio, campos inválidos, zero resultados e localidades válidas com contexto geográfico.
  - [ ] Nenhum teste depende da rede real e o parser não lança exceção para payload incompleto.
- Rastreabilidade: RF-02; CA-04, CA-05; RNF-05.
- Dependências: T-08
- Arquivos prováveis: `tests/services/geocoding.test.ts`
- Tipo: Test

### T-23 — Testar clientes HTTP
- ID: T-23
- Título: Testar clientes HTTP
- Descrição curta: Cobrir clientes de geocoding e forecast com `fetch` mockado.
- Critérios de aceite:
  - [ ] Parâmetros, resposta de sucesso, HTTP não-2xx, timeout de 10 s e falha de rede são verificados para os dois clientes.
  - [ ] JSON malformado, coordenadas inválidas, campos ausentes e arrays diários incompatíveis são cobertos sem chamada real.
- Rastreabilidade: contrato de integração, seções 4.1 e 4.2; RF-02, RF-03, RF-06; CA-01, CA-03, CA-08; RNF-04, RNF-05.
- Dependências: T-09, T-11
- Arquivos prováveis: `tests/services/geocoding-client.test.ts`, `tests/services/forecast-client.test.ts`
- Tipo: Test

### T-24 — Testar reducer e hook
- ID: T-24
- Título: Testar reducer e hook
- Descrição curta: Validar transições, retry, unidade e descarte de respostas obsoletas.
- Critérios de aceite:
  - [ ] Estados `idle`, `validating`, `loading-location`, `selecting-location`, `loading-weather`, `empty`, `error` e `success` estão cobertos.
  - [ ] Retry, `requestId`, abort de operação substituída e troca de unidade têm testes isolados, incluindo a ausência de nova chamada na troca de unidade.
- Rastreabilidade: RF-05, RF-06, RF-07; CA-07, CA-08, CA-09; RNF-04, RNF-05.
- Dependências: T-12, T-13
- Arquivos prováveis: `tests/hooks/**`
- Tipo: Test

### T-25 — Testar componentes da interface
- ID: T-25
- Título: Testar componentes da interface
- Descrição curta: Validar componentes visuais e interações acessíveis com Testing Library.
- Critérios de aceite:
  - [ ] Busca válida, validação vazia, seleção múltipla, loading, erro, vazio, sucesso, retry e troca de unidade estão cobertos.
  - [ ] Testes usam roles/labels, simulam botão/Enter/teclado e verificam mensagens sem `undefined`, `null` ou `NaN`.
- Rastreabilidade: RF-01 a RF-07; CA-01 a CA-08; RNF-02, RNF-08.
- Dependências: T-14, T-15, T-16, T-17, T-18, T-19, T-20
- Arquivos prováveis: `tests/components/**`
- Tipo: Test

### T-26 — Testar fluxos completos no navegador
- ID: T-26
- Título: Testar fluxos completos no navegador
- Descrição curta: Validar pesquisa, seleção, retry, concorrência, teclado e responsividade com Playwright.
- Critérios de aceite:
  - [ ] Há E2E determinístico, com `page.route`, para sucesso com cinco dias, cidade homônima, vazio, erro e retry.
  - [ ] Respostas fora de ordem não sobrescrevem a busca atual e a troca de unidade não cria nova requisição.
  - [ ] Nos viewports de 320 px, 768 px e 1280 px, `scrollWidth` não excede `clientWidth` e não há elementos sobrepostos no fluxo principal.
  - [ ] Busca, seleção, retry e troca de unidade são operáveis por teclado.
- Rastreabilidade: RF-01 a RF-07; CA-01 a CA-10; RNF-01, RNF-02, RNF-03, RNF-05, RNF-07, RNF-08.
- Dependências: T-20, T-23, T-25
- Arquivos prováveis: `tests/e2e/**`, `playwright.config.ts`
- Tipo: Test

## Entrega 8 — Hardening

### T-27 — Executar hardening e validação final
- ID: T-27
- Título: Executar hardening e validação final
- Descrição curta: Exercitar falhas, concorrência, acessibilidade, responsividade e a suíte de qualidade antes da entrega.
- Critérios de aceite:
  - [ ] `pnpm lint`, `pnpm build` e `pnpm test` concluem com código de saída zero.
  - [ ] `pnpm test:e2e` conclui com código de saída zero no ambiente configurado, ou a indisponibilidade do ambiente fica registrada sem mascarar falhas.
  - [ ] A revisão confirma que timeout, respostas fora de ordem, campos ausentes, códigos WMO desconhecidos, teclado e viewports de 320 px, 768 px e 1280 px estão verificados.
  - [ ] Cada User Story tem ao menos um teste derivado de CA e os RNFs aplicáveis têm verificação documentada.
- Rastreabilidade: todos os RFs e CAs; RNF-01 a RNF-08; seção 7 e estratégia de validação da spec.
- Dependências: T-21, T-22, T-23, T-24, T-25, T-26
- Arquivos prováveis: `biome.json`, `src/**`, `tests/**`
- Tipo: Infra

## Ordenação final

A sequência separa contratos, lógica pura, parsing, clientes HTTP, estado,
componentes e cada camada de teste. Assim, cada tarefa tem um resultado
observável e as dependências apontam para o menor incremento necessário.
