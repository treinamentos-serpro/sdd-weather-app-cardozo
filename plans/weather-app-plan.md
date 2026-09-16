# Plano Técnico: Weather App

Fonte da verdade: `specs/weather-app-spec.md`.

## Architecture

A aplicação será uma SPA client-side em React, organizada em três camadas simples:

- **Apresentação:** formulário de busca, seleção de localidades, resumo do clima, previsão diária, controle de unidade e estados de feedback.
- **Serviços:** clientes HTTP para geocoding e forecast, com timeout, validação de resposta e conversão de erros para um formato interno.
- **Domínio/utilitários:** normalização do termo, transformação das respostas externas, mapeamento WMO, conversão de temperatura e formatação pt-BR.

O componente raiz coordenará o fluxo da consulta e manterá o estado da tela. Componentes visuais não chamarão as APIs diretamente. As funções de transformação serão puras para permitir testes unitários determinísticos.

A primeira versão não terá roteamento, backend, autenticação, persistência ou biblioteca externa de gerenciamento de estado.

## Tech Stack

- TypeScript em modo strict.
- React 19 e React DOM.
- Vite para desenvolvimento e build.
- Tailwind CSS para estilos responsivos e tema visual existente do projeto.
- `fetch` nativo para Open-Meteo.
- Vitest e Testing Library para testes unitários e de componentes.
- Playwright para fluxos E2E, teclado e viewports.
- Biome para lint e formatação.

Decisões:

- A API será consultada sempre com `temperature_unit=celsius`; Fahrenheit será calculado somente na apresentação.
- Não adicionar dependências para cache, estado global, datas ou requisições enquanto os requisitos puderem ser atendidos pela plataforma e pelas dependências já instaladas.
- O timeout será implementado com `AbortController` e um temporizador de 10 segundos por requisição.

## Project Structure

Estrutura prevista, mantendo a separação indicada pelo repositório:

```text
src/
  components/
    SearchForm.tsx
    LocationOptions.tsx
    CurrentWeather.tsx
    DailyForecast.tsx
    TemperatureUnitToggle.tsx
    WeatherStatus.tsx
  hooks/
    useWeatherSearch.ts
  services/
    geocoding.ts
    forecast.ts
  lib/
    format.ts
    temperature.ts
    weather-code.ts
    validation.ts
  types/
    weather.ts
    api.ts
  App.tsx
  main.tsx

tests/
  lib/
  services/
  components/
  e2e/
```

Os nomes são uma orientação de organização; a implementação pode consolidar arquivos quando isso reduzir complexidade sem misturar apresentação e acesso à API.

## Data Model

Tipos internos devem representar somente dados necessários à interface e manter Celsius como valor-base.

```ts
type TemperatureUnit = 'celsius' | 'fahrenheit'

type WeatherStatus =
  | 'idle'
  | 'validating'
  | 'loading-location'
  | 'selecting-location'
  | 'loading-weather'
  | 'success'
  | 'empty'
  | 'error'

interface Location {
  id?: number
  name: string
  region?: string
  country: string
  countryCode?: string
  latitude: number
  longitude: number
}

interface CurrentWeather {
  temperatureCelsius?: number
  weatherCode?: number
}

interface DailyWeather {
  date: string
  weatherCode?: number
  minTemperatureCelsius?: number
  maxTemperatureCelsius?: number
}

interface WeatherReport {
  location: Location
  timezone: string
  current: CurrentWeather
  daily: DailyWeather[] // sempre cinco entradas após transformação, quando possível
}

interface WeatherError {
  kind: 'validation' | 'network' | 'timeout' | 'http' | 'invalid-response' | 'unknown'
  message: string
  retryable: boolean
}

interface WeatherState {
  status: WeatherStatus
  query: string
  locations: Location[]
  selectedLocation?: Location
  report?: WeatherReport
  unit: TemperatureUnit
  error?: WeatherError
  requestId: number
  lastOperation?: 'location' | 'weather'
}
```

Contratos de serviço conceituais:

```ts
type SearchLocations = (query: string, signal?: AbortSignal) => Promise<Location[]>
type GetWeather = (location: Location, signal?: AbortSignal) => Promise<WeatherReport>
```

Respostas externas devem ter tipos próprios, separados dos tipos internos, e ser validadas antes de serem transformadas. Campos opcionais serão mantidos como `undefined`; a UI exibirá indisponibilidade em vez de valores falsos.

## Data Flow

1. O usuário submete o formulário.
2. O termo é aparado e validado. Se ficar vazio, a operação termina em estado `validating`, sem `fetch`.
3. Uma nova operação incrementa `requestId`, invalida resultados anteriores e inicia `loading-location`.
4. O serviço de geocoding consulta `name`, `count`, `language=pt` e `format=json`.
5. A resposta é validada e convertida em `Location[]`.
6. Com zero localidades, a tela vai para `empty`. Com uma, ela é selecionada automaticamente e o passo 8 começa. Com duas ou mais, a tela vai para `selecting-location`.
7. Ao selecionar uma localidade, o estado registra a opção por seus dados geográficos e inicia `loading-weather`.
8. O serviço de forecast consulta latitude, longitude, campos atuais e diários, cinco dias, `timezone=auto` e Celsius.
9. A resposta é validada, alinhada por índice/data e convertida em `WeatherReport`.
10. A tela renderiza `success` ou um estado parcial explícito para dados ausentes. A unidade altera apenas a projeção dos valores já armazenados.
11. Retry repete a última operação válida usando a query ou localidade armazenada, sem exigir nova digitação.
12. Antes de aplicar qualquer resposta ou erro, o fluxo compara o `requestId` da operação com o estado atual. Respostas antigas são descartadas; `AbortController` pode cancelar a requisição anterior como otimização.

Uma nova busca limpa opções e relatório assim que começa, evitando que dados de uma busca anterior pareçam pertencer ao novo termo.

## External APIs

### Geocoding

Endpoint: `https://geocoding-api.open-meteo.com/v1/search`.

Parâmetros:

- `name`: termo normalizado.
- `count`: limite pequeno e explícito definido pelo cliente.
- `language=pt`.
- `format=json`.

Contrato mínimo aceito:

```ts
interface GeocodingResponse {
  results?: Array<{
    id?: number
    name?: string
    admin1?: string
    country?: string
    country_code?: string
    latitude?: number
    longitude?: number
  }>
}
```

Uma opção só será criada se tiver nome não vazio e latitude/longitude numéricas. A ausência de `results` equivale a lista vazia.

### Forecast

Endpoint: `https://api.open-meteo.com/v1/forecast`.

Parâmetros fixos:

- `current=temperature_2m,weather_code`.
- `daily=weather_code,temperature_2m_max,temperature_2m_min`.
- `forecast_days=5`.
- `timezone=auto`.
- `temperature_unit=celsius`.

O cliente exigirá HTTP bem-sucedido, JSON válido, timezone, bloco diário e cinco datas. Cada valor diário será associado ao índice da data correspondente; arrays inconsistentes serão tratados como resposta inválida ou como campos indisponíveis conforme a validação definida. Latitude e longitude recebidas da localidade devem ser numéricas antes da chamada.

O mapeamento WMO será centralizado em função pura e cobrirá céu limpo, parcialmente nublado, nublado, neblina, chuva, neve e tempestade. Códigos desconhecidos retornarão `Condição indisponível`.

## State Management

Usar um estado local único no componente raiz, preferencialmente via `useReducer`, porque há transições relacionadas entre busca, seleção, retry, unidade e concorrência. O hook `useWeatherSearch` poderá encapsular o reducer, os controladores de abort e as chamadas aos serviços, expondo somente estado e ações para a UI.

Ações conceituais:

- `submitQuery(query)`.
- `locationsLoaded(requestId, locations)`.
- `selectLocation(requestId, location)`.
- `weatherLoaded(requestId, report)`.
- `operationFailed(requestId, error)`.
- `retry()`.
- `setUnit(unit)`.

A unidade não participa do ciclo de rede e não altera `WeatherReport`. O relatório em Celsius é a única fonte de verdade para renderização; a conversão e o arredondamento acontecem nas funções de apresentação.

## Error Handling

- Campo vazio: erro de validação associado ao input, foco retornável e nenhuma chamada externa.
- HTTP não-2xx: converter para `http`, com mensagem pt-BR e retry quando a operação puder ser repetida.
- Falha de rede: converter para `network`.
- Abort por timeout: converter para `timeout`; abort de uma operação substituída não deve aparecer como erro para o usuário.
- JSON inválido, coordenadas ausentes, arrays diários incompatíveis ou contrato incompleto: `invalid-response`.
- Erros inesperados: `unknown`, sem expor detalhes técnicos desnecessários.

Toda requisição terá limite de 10 segundos. A UI deve manter o termo pesquisado, indicar a operação em andamento, impedir submissões duplicadas equivalentes e permitir nova busca quando não houver ambiguidade. Retry deve mostrar novo carregamento e não reutilizar dados convertidos ou acumulados.

Dados faltantes no clima atual e em dias individuais renderizarão placeholder ou mensagem de indisponibilidade. A tela nunca exibirá `undefined`, `null` ou `NaN`.

## Testing Strategy

A cobertura será derivada dos critérios de aceitação e dos RNFs, dividida por ferramenta conforme o tipo de garantia que cada uma oferece: Vitest para lógica isolada e rápida (funções puras, services, componentes em isolamento); Playwright para fluxos reais no navegador, onde a integração entre camadas e o comportamento visual/responsivo importam.

### Vitest (unitário e componente)

- **Funções puras de conversão/formatação (`src/lib`):**
  - Normalização e validação do termo de busca (trim, mínimo de caracteres, string vazia).
  - Conversão Celsius ↔ Fahrenheit e arredondamento consistente em ambas as direções.
  - Formatação de data/temperatura em pt-BR.
  - Mapeamento de código WMO para descrição e ícone, incluindo código desconhecido (`Condição indisponível`).
  - Transformação/validação das respostas externas em tipos internos (`Location[]`, `WeatherReport`), com casos de campos ausentes.
- **Services com mock de `fetch` (`src/services`):**
  - Sucesso com payload válido.
  - Lista de resultados ausente ou vazia (geocoding).
  - HTTP não-2xx (mapear para erro `http`).
  - Timeout via `AbortController` (mapear para erro `timeout`).
  - JSON malformado ou contrato incompleto (mapear para `invalid-response`).
  - Coordenadas ausentes/inválidas na localidade selecionada.
  - Forecast com menos de cinco datas ou arrays diários desalinhados.
  - Nunca golpear a rede real: `fetch` é sempre mockado (`vi.fn` / `msw`, conforme o que já estiver disponível no projeto).
- **Componentes (Testing Library) nos quatro estados:**
  - **Loading:** indicador visível e acessível durante busca de localização e de clima; inputs bloqueados contra submissão duplicada.
  - **Erro:** mensagem pt-BR associada ao estado de erro, opção de retry visível e funcional, sem detalhes técnicos expostos.
  - **Vazio:** zero localidades encontradas e campos de clima indisponíveis (placeholder, nunca `undefined`/`NaN`).
  - **Sucesso:** múltiplas opções de localidade, seleção, resumo do clima atual e previsão de cinco dias renderizados corretamente; troca de unidade sem nova chamada de rede.

### Playwright (E2E)

- **Fluxos completos:**
  - Busca válida do início ao fim (termo → seleção, quando necessário → exibição do relatório).
  - Cidade homônima: forecast não é chamado antes da seleção explícita.
  - Nova busca substituindo resultados/relatório anteriores (sem "flash" de dado antigo).
  - Resposta fora de ordem (requisição lenta anterior não deve sobrescrever a mais recente).
  - Retry após erro repetindo a última operação válida.
  - Navegação completa via teclado (foco visível, ordem lógica, ativação por Enter/Space).
- **Viewport mobile:** suíte replicada (ou parametrizada) em 320 px, 768 px e 1280 px, verificando ausência de rolagem horizontal, ausência de sobreposição de conteúdo e controles com alvo de toque acessível.

Os testes devem verificar tanto chamadas/argumentos das APIs (via mocks/interceptação de rede) quanto o texto renderizado e os atributos semânticos (roles, labels). A validação local prevista é `pnpm lint`, `pnpm build`, `pnpm test` e, quando o ambiente estiver configurado, `pnpm test:e2e`.

## Risks & Trade-offs

Principais trade-offs técnicos do plano, com a decisão adotada e as alternativas descartadas:

| Trade-off | Decisão adotada | Alternativas consideradas e por que foram descartadas |
| --- | --- | --- |
| Gerenciamento de estado | `useReducer` local em `useWeatherSearch`, sem store global. | **Context/Redux/Zustand:** rejeitado por over-engineering para um único componente raiz consumindo o estado; adicionaria dependência e indireção sem benefício em uma SPA de tela única. |
| Cache/dedupe de requisições | Nenhum cache; cada busca dispara nova chamada, controlada por `requestId`. | **React Query/SWR:** rejeitado para manter a dependência mínima; o ganho (cache, retry automático) não compensa a complexidade adicional nesta fase, dado o volume baixo de chamadas. |
| Concorrência entre requisições | `requestId` monotônico descarta respostas obsoletas; `AbortController` cancela como otimização. | **Só `AbortController` sem `requestId`:** rejeitado porque abort não garante que a resposta antiga nunca chegue antes da nova em todos os ambientes; `requestId` é a guarda determinística. |
| Contrato da Open-Meteo mudar ou ficar indisponível | Cliente isolado em `services/`, validação explícita do payload, timeout de 10s, mensagens recuperáveis e mocks de contrato nos testes. | **Confiar no tipo de resposta sem validação runtime:** rejeitado por risco de `undefined`/`NaN` vazando para a UI; **backend próprio como proxy:** rejeitado por aumentar escopo além do especificado (sem backend na v1). |
| Ambiguidade de localidades (cidades homônimas) | Não consultar forecast até seleção explícita quando houver múltiplos resultados. | **Selecionar automaticamente o primeiro resultado:** rejeitado por risco de mostrar clima da cidade errada, violando critério de aceite. |
| Conversão de unidade (°C/°F) | Armazenar somente Celsius; converter sob demanda na apresentação. | **Armazenar valor na unidade atual e reconverter a cada toggle:** rejeitado por acumular erro de arredondamento e complicar o retry/estado. |
| Máquina de estados da UI | Enum de `status` (`idle`, `loading-*`, `success`, `empty`, `error`, ...) dentro do reducer. | **Biblioteca de state machine (XState):** rejeitado por over-engineering; o conjunto de estados é pequeno e estável o suficiente para um reducer simples. |
| Limite de resultados do geocoding | `count` pequeno e fixo, todas as opções retornadas exibidas para seleção manual. | **Paginação ou busca incremental:** rejeitado por complexidade desnecessária frente ao volume esperado de resultados. |
| Datas e timezone da previsão | Usar diretamente as datas/timezone retornados pela API, sem biblioteca de datas. | **`date-fns`/`dayjs`:** rejeitado enquanto a formatação puder ser feita com `Intl`/manipulação simples de string, evitando dependência extra. |
| Acessibilidade e responsividade | HTML semântico, labels, foco visível, mensagens anunciáveis; validado com E2E em 320/768/1280 px. | **Validar só via testes unitários de componente:** rejeitado porque não cobre overflow, sobreposição e alvo de toque reais, que só aparecem no navegador. |
| Escopo da v1 | Sem persistência, geolocalização, histórico ou forecast horário. | **Adicionar geolocalização/histórico já na v1:** rejeitado por não constar na spec e aumentar superfície de testes sem valor comprovado nesta fase. |
