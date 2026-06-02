# Vinicius Ferreira Portifólio

Portfólio pessoal gerenciável desenvolvido com Next.js no frontend e NestJS no backend.

## Objetivo

Este projeto tem como objetivo apresentar minha trajetória profissional, stack técnica, projetos e experiências por meio de uma interface interativa, responsiva e gerenciável.

A proposta principal do portfólio é oferecer duas experiências visuais distintas:

- **Experiência moderna:** visual tecnológico, escuro, com detalhes em neon e atmosfera high-tech.
- **Experiência vintage:** visual preto e branco inspirado nas décadas de 1930 a 1950, com estética clássica e editorial.

## Stack

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS
- **Backend:** NestJS e TypeScript
- **Gerenciador de pacotes:** pnpm
- **Estrutura:** monorepo com pnpm workspaces
- **Versionamento:** Git e GitHub

## Estrutura do projeto

```txt
apps/
  web/        # Aplicação frontend em Next.js
  api/        # Aplicação backend em NestJS

packages/     # Pacotes compartilhados futuros
docs/         # Documentação técnica e de produto
```

## Scripts principais

```bash
pnpm dev
pnpm dev:web
pnpm dev:api
pnpm build
pnpm lint
pnpm format
```

## Rodando localmente

Instale as dependências:

```bash
pnpm install
```

Rode o frontend:

```bash
pnpm dev:web
```

Rode a API:

```bash
pnpm dev:api
```

Por padrão:

```txt
Frontend: http://localhost:3000
API:      http://localhost:3333
```

## Fluxo de branches

```txt
main       # produção
dev        # desenvolvimento/integração
feature/*  # novas funcionalidades
fix/*      # correções
docs/*     # documentação
chore/*    # configurações e manutenção
```

O fluxo principal é:

```txt
feature/* -> dev -> main
```

## Padrão de commits

Este projeto utiliza Conventional Commits com mensagens em português.

Exemplos:

```bash
feat(web): adiciona seção inicial do portfólio
feat(api): adiciona módulo de projetos
fix(web): corrige responsividade do cabeçalho
docs: adiciona documentação inicial do projeto
chore(workspace): ajusta scripts do monorepo
```

## Status

Projeto em fase inicial de estruturação.
