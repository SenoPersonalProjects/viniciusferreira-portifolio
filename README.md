# Vinicius Ferreira Portfolio

Portfolio pessoal gerenciavel desenvolvido com Next.js no frontend e NestJS no backend.

## Objetivo

Este projeto apresenta a trajetoria profissional, stack tecnica, projetos e experiencias de Vinicius Ferreira por meio de uma interface interativa, responsiva e gerenciavel.

A direcao visual do portfolio e vintage/noir: preto e branco, cinema antigo, arquivo confidencial, dossie investigativo, rolo de filme, textura de papel, tinta, granulado e composicao editorial.

O site preserva modo de cor:

- `system`
- `light`
- `dark`

Esses modos alteram a leitura claro/escuro da mesma experiencia vintage/noir. Nao existe outra experiencia visual separada no produto atual.

## Stack

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS
- **Backend:** NestJS e TypeScript
- **Gerenciador de pacotes:** pnpm
- **Estrutura:** monorepo com pnpm workspaces
- **Versionamento:** Git e GitHub

## Estrutura do projeto

```txt
apps/
  web/        # Aplicacao frontend em Next.js
  api/        # Aplicacao backend em NestJS

packages/     # Pacotes compartilhados futuros
docs/         # Documentacao tecnica e de produto
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

Instale as dependencias:

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

Por padrao:

```txt
Frontend: http://localhost:3000
API:      http://localhost:3333
```

## Fluxo de branches

```txt
main       # producao
dev        # desenvolvimento/integracao
feature/*  # novas funcionalidades
fix/*      # correcoes
docs/*     # documentacao
chore/*    # configuracoes e manutencao
```

O fluxo principal e:

```txt
feature/* -> dev -> main
```

## Padrao de commits

Este projeto utiliza Conventional Commits com mensagens em portugues.

Exemplos:

```bash
feat(web): adiciona secao inicial do portfolio
feat(api): adiciona modulo de projetos
fix(web): corrige responsividade do cabecalho
docs: adiciona documentacao inicial do projeto
chore(workspace): ajusta scripts do monorepo
```

## Status

Projeto em evolucao, com frontend vintage/noir, ambientacao 3D e base administrativa para conteudo gerenciavel.
