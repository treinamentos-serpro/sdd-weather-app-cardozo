# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa deseja disponibilizar uma aplicação web de previsão do tempo para que usuários consultem rapidamente as condições meteorológicas de cidades de interesse.

A experiência deve priorizar simplicidade, clareza e uso em dispositivos móveis. O usuário deverá buscar uma cidade, consultar o clima atual, visualizar a previsão dos próximos cinco dias e alternar entre as unidades Celsius e Fahrenheit.

## Requisitos Funcionais

- **RF1** — Permitir a busca de cidades por nome.
- **RF2** — Exibir o clima atual da cidade selecionada.
- **RF3** — Exibir a previsão do tempo para cinco dias.
- **RF4** — Permitir alternar entre Celsius e Fahrenheit.
- **RF5** — Atualizar os valores exibidos quando a unidade de temperatura for alterada.
- **RF6** — Apresentar sugestões ou informações adicionais para diferenciar cidades com o mesmo nome.
- **RF7** — Informar o usuário sobre estados de carregamento, erro e ausência de resultados.
- **RF8** — Permitir realizar uma nova busca após uma consulta concluída ou malsucedida.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** a aplicação deve funcionar adequadamente em dispositivos móveis, tablets e desktops.
- **RNF2 — Acessibilidade:** os controles devem ser utilizáveis por teclado e possuir labels e informações semânticas adequadas.
- **RNF3 — Performance:** buscas e atualizações devem apresentar resposta rápida em condições normais de rede.
- **RNF4 — Usabilidade:** as informações meteorológicas devem ser organizadas de forma clara e facilmente escaneável.
- **RNF5 — Resiliência:** falhas de rede ou indisponibilidade do serviço meteorológico devem resultar em mensagens compreensíveis e possibilidade de tentar novamente.
- **RNF6 — Compatibilidade:** a aplicação deve funcionar nos principais navegadores modernos.
- **RNF7 — Internacionalização:** formatos de temperatura, datas e textos devem ser consistentes com o idioma e a região definidos para a aplicação.
- **RNF8 — Privacidade:** a aplicação não deve exigir autenticação ou coletar dados pessoais sem necessidade explícita.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade ou limitação da API meteorológica | Média | Alto | Tratar erros, exibir mensagens claras e permitir nova tentativa. |
| Cidades com nomes iguais ou ambíguos | Alta | Médio | Exibir país, estado ou coordenadas nas sugestões de busca. |
| Falhas ou lentidão na conexão do usuário | Média | Alto | Implementar estados de carregamento, timeout e erro. |
| Layout inadequado em telas pequenas | Média | Médio | Adotar abordagem mobile-first e validar em diferentes tamanhos de tela. |
| Conversão incorreta entre Celsius e Fahrenheit | Baixa | Alto | Centralizar a conversão em uma função testável e validar os resultados. |
| Dados meteorológicos incompletos ou inconsistentes | Média | Médio | Definir valores substitutos e comunicar indisponibilidade de informações específicas. |

## Perguntas em Aberto

1. Qual fonte de dados meteorológicos será utilizada?
   - **Impacto:** define contratos de integração, custos, limites de uso e necessidade de chave de API.

2. Os cinco dias incluem o dia atual?
   - **Impacto:** influencia o cálculo das datas e a quantidade de dias futuros exibidos.

3. Quais informações devem aparecer no clima atual?
   - **Impacto:** define o modelo de dados e o espaço ocupado na interface.

4. Quais informações devem aparecer na previsão diária?
   - **Impacto:** afeta o layout, a densidade de informação e o consumo da API.

5. Qual unidade deve ser usada por padrão?
   - **Impacto:** determina a experiência inicial do usuário.

6. A aplicação deve detectar automaticamente a localização do usuário?
   - **Impacto:** envolve permissões do navegador, privacidade e tratamento de coordenadas.

7. Quais idiomas serão suportados?
   - **Impacto:** influencia textos, formatos de data, unidades e internacionalização.

8. A aplicação deve funcionar offline ou armazenar consultas recentes?
   - **Impacto:** adiciona requisitos de cache, persistência e sincronização.

9. Usuários poderão salvar cidades favoritas?
   - **Impacto:** pode exigir persistência local, autenticação ou uma conta de usuário.

10. Existe uma meta formal de tempo de resposta e disponibilidade?
    - **Impacto:** orienta decisões de arquitetura, cache e monitoramento.

## Decisões

1. **Fonte de dados:** utilizar a API Open-Meteo sem necessidade de chave de API.
   - **Justificativa:** a API é gratuita, pública e atende aos requisitos de geolocalização e previsão sem exigir autenticação ou custo operacional para a primeira versão.
   - **Resolve:** a Pergunta 1, eliminando a incerteza sobre a integração meteorológica e reduzindo o esforço de autenticação e configuração.

2. **Definição de “5 dias”:** considerar hoje + 4 dias, totalizando cinco entradas de previsão.
   - **Justificativa:** essa regra simplifica a conversão da API para a interface e mantém o intervalo de consulta intuitivo para o usuário.
   - **Resolve:** a Pergunta 2, deixando explícito que a previsão inclui o dia atual e os próximos quatro dias.

3. **Unidade padrão:** a aplicação iniciará em Celsius como unidade principal de temperatura.
   - **Justificativa:** Celsius é a convenção mais comum para usuários brasileiros e também a unidade padrão da maioria dos serviços meteorológicos em contextos locais.
   - **Resolve:** a Pergunta 5, definindo a experiência inicial e reduzindo a ambiguidade sobre a temperatura exibida por padrão.

4. **Autenticação e persistência de servidor:** a solução não exigirá autenticação e não armazenará dados no servidor.
   - **Justificativa:** o escopo inicial prioriza consultas rápidas e locais, sem necessidade de conta, favoritos ou sincronização entre dispositivos.
   - **Resolve:** as Perguntas 8 e 9, além de reforçar a premissa de privacidade e simplicidade da aplicação.

5. **Idioma da interface:** a UI será entregue em português do Brasil (pt-BR).
   - **Justificativa:** o público-alvo e a demanda do produto indicam que a experiência deve ser nativa em português do Brasil, com textos e rotulos em pt-BR.
   - **Resolve:** a Pergunta 7, estabelecendo a linguagem principal da aplicação e o padrão para textos, labels e formatação.

## Suposições

- A aplicação será uma aplicação web responsiva.
- O uso principal será para consultas rápidas e ocasionais.
- A primeira versão não exigirá autenticação.
- A fonte de dados fornecerá informações de clima atual e previsão diária.
- O acesso à internet estará disponível durante a maior parte do uso.
- O suporte inicial será destinado a navegadores modernos.
- A unidade padrão será Celsius, salvo decisão diferente do negócio.
- A previsão de cinco dias incluirá o dia atual, salvo definição posterior.
- A interface inicial será disponibilizada em português do Brasil.