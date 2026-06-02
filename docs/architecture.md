# Arquitetura

## Visão geral

O projeto é um portfólio pessoal gerenciável construído em formato de monorepo.

A aplicação é dividida em duas partes principais:

- `apps/web`: frontend público desenvolvido com Next.js.
- `apps/api`: backend desenvolvido com NestJS.

## Objetivos arquiteturais

- Separar claramente frontend e backend.
- Manter o projeto organizado em um único repositório.
- Permitir compartilhamento futuro de tipos e configurações.
- Facilitar evolução para um painel administrativo.
- Permitir troca de experiências visuais sem duplicar conteúdo.

## Estrutura

```txt
apps/
  web/
    src/
      app/
      components/
      config/
      data/
      styles/
      types/

  api/
    src/
      app.module.ts
      main.ts

packages/
  types/
  config/
  ui/

docs/
  architecture.md
  design-system.md
  roadmap.md
```

## Frontend

O frontend será responsável por:

- Apresentar o portfólio público.
- Renderizar as duas experiências visuais.
- Consumir dados mockados inicialmente.
- Consumir a API posteriormente.
- Futuramente, disponibilizar uma área administrativa.

## Backend

O backend será responsável por:

- Expor dados do portfólio.
- Gerenciar projetos.
- Gerenciar stack técnica.
- Gerenciar informações de perfil.
- Proteger rotas administrativas.
- Integrar com banco de dados.

## Estratégia inicial de dados

Na primeira fase, o frontend utilizará dados mockados em arquivos locais.

Exemplo:

```txt
apps/web/src/data/projects.ts
apps/web/src/data/stack.ts
apps/web/src/data/profile.ts
```

Posteriormente, esses dados serão migrados para a API.

## Experiências visuais

O conteúdo principal do portfólio será compartilhado entre as duas experiências visuais.

A diferença estará na camada de apresentação:

- Cores
- Tipografia
- Animações
- Texturas
- Composição visual
- Microinterações

## Decisão sobre monorepo

O projeto utiliza monorepo para manter frontend, backend, documentação e possíveis pacotes compartilhados dentro do mesmo repositório.

Isso facilita:

- Versionamento conjunto.
- Organização do produto.
- Evolução da API e do frontend em paralelo.
- Compartilhamento futuro de tipos entre Next.js e NestJS.
