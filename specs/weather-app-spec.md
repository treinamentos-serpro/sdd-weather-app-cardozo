# Especificação do Produto: Weather App

## 1. Objetivo e escopo

Aplicação web responsiva para consultar, em português do Brasil, as condições atuais e a previsão diária de uma cidade. A consulta começa pelo nome da cidade, permite a seleção quando houver mais de um resultado e exibe cinco dias de previsão: hoje e os quatro dias seguintes.

O produto não exige autenticação, não salva favoritos e não mantém dados em servidor. A fonte de dados da primeira versão é a Open-Meteo, usando os serviços de geocoding e forecast.

### 1.1 Fora de escopo

- Geolocalização automática, mapas e seleção por coordenadas no mapa.
- Contas, autenticação, favoritos, histórico persistente ou sincronização.
- Previsão horária, alertas, notificações, compartilhamento e dados históricos.
- Suporte a idiomas além de pt-BR.

## 2. Público e histórias de usuário

- Como usuário, quero buscar uma cidade pelo nome para consultar rapidamente o clima.
- Como usuário, quero distinguir cidades homônimas antes de consultar a previsão.
- Como usuário, quero ver o clima atual e cinco dias de previsão em uma leitura rápida.
- Como usuário, quero alternar entre Celsius e Fahrenheit sem refazer a busca.
- Como usuário em uma conexão instável, quero receber estados claros de carregamento e erro e poder tentar novamente.
- Como usuário mobile, quero realizar todo o fluxo sem perder conteúdo ou funcionalidade.

## 3. Requisitos funcionais

### RF-01 — Buscar uma cidade

O sistema deve oferecer um formulário com um campo de texto e uma ação de busca.

Regras:

- O valor submetido deve ser normalizado removendo espaços no início e no fim.
- O valor normalizado deve conter pelo menos um caractere.
- Para valor vazio, o sistema não deve chamar a API e deve exibir uma mensagem de validação associada ao campo.
- A submissão deve funcionar pelo botão e pela tecla Enter.
- O texto pesquisado deve permanecer disponível enquanto a busca estiver em andamento e após erro.

### RF-02 — Resolver a cidade

Para um termo válido, o sistema deve consultar o endpoint de geocoding e apresentar as localidades retornadas antes de consultar o clima quando houver mais de uma opção.

Cada opção deve exibir, quando disponível, nome da cidade, estado/região, país e código do país. Latitude e longitude podem ser usadas como contexto adicional, mas não substituem o nome e o país.

Regras:

- Zero resultados: exibir estado vazio e manter o formulário utilizável.
- Um resultado: selecionar a localidade automaticamente e iniciar a consulta meteorológica.
- Dois ou mais resultados: exibir opções selecionáveis e não consultar o clima antes da seleção.
- A seleção deve usar o identificador lógico da localidade (nome, país, latitude e longitude), não apenas o texto digitado.
- Uma nova busca deve substituir as opções e resultados anteriores quando começar.

### RF-03 — Consultar e exibir o clima atual

Após a seleção da localidade, o sistema deve consultar o forecast usando latitude e longitude e exibir:

- nome da localidade selecionada e país;
- temperatura atual;
- condição meteorológica legível em pt-BR, derivada do código WMO;
- unidade da temperatura aplicada à tela.

Se os dados atuais não estiverem disponíveis, a tela deve exibir uma mensagem explícita para esse dado, sem inventar um valor ou renderizar `undefined`, `null` ou `NaN`.

### RF-04 — Exibir a previsão diária

O sistema deve exibir exatamente cinco entradas diárias, correspondentes à data atual e às quatro datas seguintes no fuso horário retornado pela API.

Cada entrada deve exibir:

- data formatada em pt-BR;
- condição meteorológica legível em pt-BR;
- temperatura mínima;
- temperatura máxima;
- unidade aplicada.

As entradas devem estar em ordem cronológica. Dados ausentes em uma entrada devem ser representados por um placeholder ou mensagem de indisponibilidade, sem remover ou reordenar a entrada.

### RF-05 — Alternar unidade de temperatura

O sistema deve oferecer um controle acessível para Celsius e Fahrenheit, com Celsius selecionado inicialmente.

Regras:

- A alteração deve atualizar o clima atual e todas as entradas diárias sem nova requisição.
- A fórmula deve ser `F = (C × 9 / 5) + 32` e `C = (F − 32) × 5 / 9`.
- A camada de apresentação deve arredondar os valores exibidos para o inteiro mais próximo e mostrar o símbolo correspondente (`°C` ou `°F`).
- Os dados-base devem permanecer em Celsius ou sem conversão acumulada; alternâncias repetidas devem produzir o mesmo resultado.
- O controle deve indicar visualmente e semanticamente a unidade ativa.

### RF-06 — Estados da interface

O sistema deve comunicar os estados abaixo:

- **Inicial:** formulário disponível e nenhuma previsão exibida.
- **Validando:** erro do campo, sem requisição externa.
- **Carregando localização:** busca de cidades em andamento.
- **Selecionando localização:** opções de localidades disponíveis.
- **Carregando clima:** forecast em andamento após seleção.
- **Sucesso:** localidade, clima atual e cinco entradas diárias disponíveis.
- **Vazio:** nenhuma localidade encontrada ou nenhum dado meteorológico utilizável.
- **Erro:** falha de rede, timeout ou resposta inválida, com mensagem compreensível e ação de tentar novamente.

Durante uma requisição, o controle que iniciou a ação deve indicar carregamento e impedir submissões duplicadas equivalentes. O formulário deve continuar acessível para iniciar uma nova busca quando isso não causar ambiguidade.

### RF-07 — Repetir e substituir consultas

- A ação de tentar novamente deve repetir a última operação válida sem exigir que o usuário redigite o nome.
- Uma nova busca após sucesso ou erro deve funcionar sem recarregar a página.
- Se duas buscas forem iniciadas em sequência, somente a resposta da busca mais recente pode alterar a tela.
- Uma resposta antiga não pode sobrescrever o resultado, erro ou seleção da busca atual.

## 4. Contrato de integração

### 4.1 Geocoding

Consultar `https://geocoding-api.open-meteo.com/v1/search` com:

- `name`: termo normalizado;
- `count`: quantidade limitada de resultados definida pela implementação;
- `language=pt`;
- `format=json`.

O cliente deve aceitar a ausência de `results` como lista vazia e considerar inválida uma opção sem nome ou coordenadas numéricas.

### 4.2 Forecast

Consultar `https://api.open-meteo.com/v1/forecast` com latitude, longitude e:

- `current=temperature_2m,weather_code`;
- `daily=weather_code,temperature_2m_max,temperature_2m_min`;
- `forecast_days=5`;
- `timezone=auto`;
- `temperature_unit=celsius`.

O cliente deve validar a presença de cinco datas diárias e alinhar cada temperatura pelo índice da data correspondente. Respostas HTTP não bem-sucedidas, JSON inválido, ausência de coordenadas ou contrato incompatível devem resultar em erro tratável.

### 4.3 Condições meteorológicas

Os códigos WMO recebidos devem ser mapeados para rótulos em pt-BR. O mapeamento deve cobrir, no mínimo, céu limpo, parcialmente nublado, nublado, neblina, chuva, neve, tempestade e códigos desconhecidos. Um código desconhecido deve produzir o rótulo neutro “Condição indisponível”, sem quebrar a tela.

## 5. Critérios de aceitação

### CA-01 — Busca válida

**Dado** que o formulário está disponível, **quando** o usuário envia ` São Paulo `, **então** o sistema consulta o geocoding com o valor `São Paulo`, exibe carregamento e mantém a interface utilizável.

### CA-02 — Busca vazia

**Dado** que o campo contém apenas espaços, **quando** o usuário envia o formulário, **então** nenhuma API é chamada, o campo recebe uma mensagem de validação e o foco pode retornar ao campo.

### CA-03 — Cidade única

**Dado** que o geocoding retorna uma localidade válida, **quando** a resposta é processada, **então** o sistema consulta o forecast pelas coordenadas retornadas e exibe o clima atual e cinco dias.

### CA-04 — Cidades homônimas

**Dado** que o geocoding retorna pelo menos duas localidades, **quando** a resposta é renderizada, **então** o sistema exibe opções com contexto geográfico, não consulta o forecast e só faz a consulta após uma seleção.

### CA-05 — Nenhum resultado

**Dado** que o geocoding retorna zero localidades, **quando** a resposta é processada, **então** o sistema exibe uma mensagem de nenhum resultado, não consulta o forecast e mantém o formulário disponível.

### CA-06 — Resultado completo

**Dado** que o forecast retorna dados válidos, **quando** a tela é renderizada, **então** ela exibe cidade, país, temperatura atual, condição e exatamente cinco dias em ordem cronológica.

### CA-07 — Troca de unidade

**Dado** que um resultado está em Celsius, **quando** o usuário seleciona Fahrenheit, **então** clima atual, máximas e mínimas exibem valores convertidos, `°F`, e nenhuma nova chamada de rede é feita.

### CA-08 — Falha e retry

**Dado** que uma requisição falha ou excede o timeout, **quando** o erro é recebido, **então** o sistema exibe uma mensagem compreensível e uma ação de retry; ao acioná-la, repete a última operação.

### CA-09 — Concorrência

**Dado** que uma busca anterior ainda está pendente, **quando** uma nova busca é iniciada e termina primeiro, **então** a resposta anterior não pode substituir o resultado da busca mais recente.

### CA-10 — Acessibilidade e responsividade

**Dado** que o usuário navega por teclado em viewport mobile, **quando** percorre o fluxo de busca e seleção, **então** todos os controles são alcançáveis, têm nome acessível, não exigem gesto de apontador e não causam rolagem horizontal.

## 6. Requisitos não funcionais

- **RNF-01 Responsividade:** suportar larguras de 320 px, 768 px e 1280 px sem perda de conteúdo, sobreposição ou rolagem horizontal.
- **RNF-02 Acessibilidade:** usar HTML semântico, labels associados, foco visível, mensagens anunciáveis por tecnologia assistiva e contraste compatível com WCAG 2.1 AA para texto e controles.
- **RNF-03 Performance:** exibir feedback de carregamento no mesmo ciclo da submissão; em condições normais, a aplicação deve renderizar o resultado até 2 s após a última resposta da API.
- **RNF-04 Timeout:** encerrar cada requisição externa após 10 s e convertê-la em estado de erro recuperável.
- **RNF-05 Confiabilidade:** respostas fora de ordem, campos ausentes, códigos WMO desconhecidos e erros HTTP não devem quebrar a aplicação.
- **RNF-06 Privacidade:** não enviar dados além do termo de busca e coordenadas necessárias às APIs; não usar cookies, autenticação ou armazenamento persistente para dados pessoais.
- **RNF-07 Compatibilidade:** funcionar nos navegadores modernos suportados pelo Vite e pelo Playwright configurado no projeto.
- **RNF-08 Localização:** textos da interface em pt-BR; datas formatadas com locale `pt-BR`; números e unidades consistentes em toda a tela.

## 7. Matriz de rastreabilidade

| User Story | Critérios de aceitação relacionados | Requisitos não funcionais relevantes |
| --- | --- | --- |
| US-01 Buscar uma cidade pelo nome | CA-01, CA-02, CA-05, CA-09 | RNF-02, RNF-03, RNF-04, RNF-05, RNF-08 |
| US-02 Distinguir cidades homônimas | CA-04, CA-05, CA-09, CA-10 | RNF-01, RNF-02, RNF-05, RNF-07, RNF-08 |
| US-03 Ver o clima atual e cinco dias de previsão | CA-03, CA-06 | RNF-03, RNF-05, RNF-07, RNF-08 |
| US-04 Alternar entre Celsius e Fahrenheit sem refazer a busca | CA-07 | RNF-05, RNF-08 |
| US-05 Receber estados claros e tentar novamente em caso de erro | CA-01, CA-08, CA-09 | RNF-03, RNF-04, RNF-05, RNF-07 |
| US-06 Usar todo o fluxo em dispositivo mobile | CA-02, CA-04, CA-06, CA-07, CA-10 | RNF-01, RNF-02, RNF-03, RNF-07, RNF-08 |

Cada User Story deve ter, no mínimo, um teste derivado dos critérios de aceitação listados. Os RNFs relacionados devem ser verificados nos testes e nas revisões técnicas aplicáveis à história.

## 8. Estratégia de validação

- Testes unitários para normalização, conversão, arredondamento, mapeamento WMO e transformação das respostas da API.
- Testes de serviço para sucesso, zero resultados, HTTP não-2xx, timeout, JSON inválido e campos ausentes.
- Testes de componentes para estados inicial, validação, carregamento, seleção, sucesso, vazio, erro, retry e troca de unidade.
- Teste de integração ou E2E para busca completa, cidade homônima, nova busca e proteção contra resposta fora de ordem.
- Teste E2E de teclado e viewports de 320 px, 768 px e 1280 px.

## 9. Premissas e decisões

- A aplicação é client-side e usa Open-Meteo sem chave de API.
- A previsão é sempre hoje mais quatro dias.
- Celsius é a unidade inicial; a API é consultada em Celsius e a conversão ocorre na apresentação.
- A interface inicial e todas as mensagens são em pt-BR.
- Não há persistência de consultas, contas ou dados pessoais.

## 10. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Indisponibilidade, limite ou mudança de contrato da API | Timeout, tratamento de HTTP/JSON, estado de erro, retry e testes com respostas simuladas. |
| Ambiguidade de nomes | Exibir contexto geográfico e exigir seleção quando houver múltiplos resultados. |
| Respostas fora de ordem | Identificar cada busca e aceitar somente a resposta da operação atual. |
| Dados incompletos | Validar o contrato e exibir placeholders por campo ou dia. |
| Conversão inconsistente | Manter valores-base em Celsius e cobrir conversão com testes unitários. |
| Uso em tela pequena | Validar breakpoints, foco por teclado e ausência de rolagem horizontal em E2E. |
