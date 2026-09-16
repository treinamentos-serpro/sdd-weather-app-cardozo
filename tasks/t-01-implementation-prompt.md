# Prompt de Implementação: T-01

Você é o **Code Agent** do Weather App. Implemente somente a tarefa **T-01 - Configurar a base técnica**.

## Contexto

Este repositório é uma SPA React com Vite, TypeScript strict, Tailwind CSS, Biome, Vitest e Playwright. A fonte de verdade funcional é `specs/weather-app-spec.md`; o plano técnico está em `plans/weather-app-plan.md` e o backlog em `tasks/weather-app-tasks.md`.

O objetivo é garantir uma base executável e verificável antes de criar componentes, serviços ou regras de domínio. Não implemente funcionalidades do Weather App nesta tarefa.

## Escopo

1. Inspecione a configuração existente e complete apenas o necessário para Vite, TypeScript strict, Tailwind CSS, Biome e Vitest funcionarem.
2. Garanta que os scripts `dev`, `build`, `lint` e `test` estejam definidos em `package.json` e não falhem por erro de configuração.
3. Preserve `strict: true` nos projetos TypeScript aplicáveis.
4. Mantenha dependências e convenções existentes quando elas já atenderem ao objetivo. Não faça refatorações ou mudanças de produto não relacionadas.

## Critérios de aceite

- [ ] `pnpm dev`, `pnpm build`, `pnpm lint` e `pnpm test` estão definidos e iniciam sem erro de configuração.
- [ ] `tsconfig` mantém `strict: true` e `pnpm build` conclui com código de saída zero.
- [ ] O lint e a suíte de testes não falham por ausência de configuração, diretórios esperados ou integração ausente.
- [ ] Nenhum componente, serviço, hook ou regra de negócio do produto é criado como parte desta tarefa.

## Arquivos no escopo provável

- `package.json`
- `vite.config.ts`
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- `tailwind.config.js`
- `postcss.config.js`
- `biome.json`
- Arquivos mínimos de configuração de Vitest, somente se indispensáveis para os critérios de aceite

Não altere `specs/`, `plans/` ou o backlog. Não adicione dependências sem necessidade técnica comprovada pela configuração atual.

## Convenções obrigatórias

- Use TypeScript strict e evite `any`.
- Não introduza chamadas de rede, dados persistentes ou variáveis de ambiente.
- Mantenha comentários e mensagens em pt-BR; identificadores permanecem em en-US.
- Preserve mudanças existentes no repositório que não sejam desta tarefa.

## Validação obrigatória

Execute, nesta ordem, e corrija problemas diretamente relacionados à T-01:

```bash
pnpm lint
pnpm build
pnpm test
```

Também confirme que `pnpm dev` inicia a configuração do Vite sem erro imediato. Ao finalizar, informe os arquivos alterados e o resultado de cada comando.