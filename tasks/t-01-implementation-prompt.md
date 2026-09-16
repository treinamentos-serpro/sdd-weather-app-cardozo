# Prompt de Implementação: T-01

Você é o **Coding Agent** do Weather App. Implemente somente a tarefa **T-01 - Configurar a base técnica**.

## Contexto

Este repositório é uma SPA React com Vite, TypeScript strict, Tailwind CSS, Biome, Vitest e Playwright. A fonte de verdade funcional é `specs/weather-app-spec.md`; o plano técnico está em `plans/weather-app-plan.md` e o backlog em `tasks/weather-app-tasks.md`.

T-01 é a primeira tarefa da fundação técnica e não implementa o produto. T-02, que depende desta tarefa, criará o esqueleto React (`src/main.tsx`, `src/App.tsx` e diretórios previstos). Não antecipe T-02 para fazer a aplicação parecer pronta.

## Estado atual conhecido

- `package.json` já declara os scripts `dev`, `build`, `lint` e `test` e as dependências principais.
- `vite.config.ts` já configura o plugin React e o Vitest com ambiente `jsdom`, `tests/setup.ts` e testes em `tests/unit`.
- `tsconfig.app.json` já usa `strict: true`, `noUnusedLocals` e `noUnusedParameters`.
- Existem apenas `src/lib/format.ts` e `src/types/weather.ts`; ainda não existem `src/main.tsx`, `src/App.tsx` ou arquivos de teste.

Use esta fotografia apenas como ponto de partida: inspecione os arquivos antes de editar, pois o working tree pode ter mudanças posteriores.

O objetivo é garantir uma base executável e verificável antes de criar componentes, serviços ou regras de domínio. Não implemente funcionalidades do Weather App nesta tarefa.

## Escopo

1. Inspecione a configuração existente e complete apenas o necessário para Vite, TypeScript strict, Tailwind CSS, Biome e Vitest funcionarem.
2. Garanta que os scripts `dev`, `build`, `lint` e `test` estejam definidos em `package.json` e não falhem por erro de configuração.
3. Preserve `strict: true` nos projetos TypeScript aplicáveis.
4. Faça a configuração tolerar a ausência temporária do esqueleto de T-02 somente quando isso for uma exigência técnica do comando. Um fixture de teste ou ajuste de configuração mínimo é aceitável; não crie `App`, `main`, componentes, serviços, hooks, tipos de domínio ou regras de negócio.
5. Mantenha dependências e convenções existentes quando elas já atenderem ao objetivo. Não faça refatorações ou mudanças de produto não relacionadas.

## Critérios de aceite

- [ ] `pnpm dev`, `pnpm build`, `pnpm lint` e `pnpm test` estão definidos e iniciam sem erro de configuração.
- [ ] `tsconfig` mantém `strict: true` e `pnpm build` conclui com código de saída zero.
- [ ] O lint e a suíte de testes não falham por ausência de configuração, diretórios esperados ou integração ausente.
- [ ] Nenhum componente, serviço, hook ou regra de negócio do produto é criado como parte desta tarefa.
- [ ] A configuração de Tailwind processa os arquivos `index.html` e `src/**/*.{ts,tsx}` sem erro.
- [ ] O Vitest usa um ambiente compatível com testes React e não depende de um arquivo inexistente sem justificativa explícita.

## Arquivos no escopo provável

- `package.json`
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `tailwind.config.js`
- `postcss.config.js`
- `biome.json`
- `vitest.config.*`, somente se indispensável e caso a configuração não esteja em `vite.config.ts`
- `tests/setup.ts` ou um fixture mínimo de teste, somente se indispensável para o Vitest iniciar; isso não autoriza implementar testes de produto

Não altere `specs/`, `plans/` ou o backlog. Não adicione dependências sem necessidade técnica comprovada pela configuração atual.

## Convenções obrigatórias

- Use TypeScript strict e evite `any`.
- Não introduza chamadas de rede, dados persistentes ou variáveis de ambiente.
- Mantenha comentários e mensagens em pt-BR; identificadores permanecem em en-US.
- Preserve mudanças existentes no repositório que não sejam desta tarefa.

## Validação obrigatória

Execute, nesta ordem, e corrija somente problemas diretamente relacionados à T-01:

```bash
pnpm lint
pnpm build
pnpm test
```

Também confirme que `pnpm dev` inicia a configuração do Vite sem erro imediato; encerre o processo depois dessa verificação. Se o build ainda depender legitimamente dos arquivos de T-02, não os crie: registre o bloqueio, o comando afetado e por que ele pertence à tarefa seguinte.

## Formato da entrega

Ao finalizar, responda com:

1. resumo das alterações;
2. arquivos alterados;
3. resultado de `pnpm lint`, `pnpm build`, `pnpm test` e da verificação de `pnpm dev`;
4. qualquer limitação residual, com distinção clara entre problema de T-01 e dependência de T-02.