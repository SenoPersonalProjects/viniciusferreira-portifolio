# Web

Aplicacao frontend do portfolio pessoal gerenciavel de Vinicius Ferreira.

## Proposito

O frontend apresenta perfil profissional, stack tecnica, projetos, contatos e uma experiencia visual vintage/noir baseada em dossie 3D, arquivo confidencial e rolo de filme.

Nao ha experiencia visual alternativa no produto atual. O usuario pode alternar apenas o modo de cor entre `system`, `light` e `dark`.

## Arquivos principais

- `src/app/page.tsx`: composicao da pagina publica.
- `src/app/globals.css`: estilos globais, classes semanticas e efeitos vintage/noir.
- `src/styles/themes.css`: tokens de cor e tipografia para claro/escuro.
- `src/components/providers/AppearanceProvider.tsx`: modo de cor e atributos globais.
- `src/components/three/dossier/`: runtime e texturas do dossie 3D.
- `src/components/projects/`: carrossel de projetos em rolo de filme.
- `src/data/`: conteudo estatico usado como fallback.

## Scripts

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web test:unit
pnpm --filter web test:e2e
```
