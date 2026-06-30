# Design System

## Direcao visual

O portfolio usa uma unica experiencia visual: vintage/noir.

A estetica combina cinema antigo, dossie confidencial, arquivo investigativo, rolo de filme, papel, tinta, granulado, halftone e composicao editorial. O modo claro deve parecer papel/tinta. O modo escuro deve se aproximar de filme antigo/noir.

## Principios

- A direcao visual e sempre vintage/noir.
- O conteudo deve vir do README, dados, schemas, seeds e componentes reais.
- Os modos `system`, `light` e `dark` alteram somente a leitura de cor da experiencia vintage/noir.
- Componentes devem usar variaveis semanticas, nao cores fixas, quando a cor fizer parte do tema.
- A interface deve ser responsiva, acessivel e performatica.

## Tokens

Os tokens principais ficam em `apps/web/src/styles/themes.css`.

```css
:root {
  --color-background: #0d0d0d;
  --color-foreground: #e8e4db;
  --color-primary: #e8e4db;
  --color-muted: #8c8882;
  --color-surface: #121212;
  --color-border: rgba(232, 228, 219, 0.85);
}

:root[data-color-mode="light"] {
  --color-background: #f4f1ea;
  --color-foreground: #111111;
  --color-primary: #111111;
  --color-muted: #4a4a4a;
  --color-surface: #fffaf0;
  --color-border: #111111;
}
```

## Componentes principais

- Header
- Footer
- ColorModeToggle
- HeroSection com dossie 3D
- AboutSection
- StackSection
- FilmReelProjects
- ContactSection com telefone vintage

## Tipografia

- Fonte display vintage para titulos editoriais.
- Fonte industrial para labels, navegacao, marcadores e botoes.
- Fonte typewriter para textos de arquivo e dossie.
- Fonte sans-serif limpa para leitura longa.

## Animacoes

- Flicker discreto.
- Movimento sutil de dossie e props 3D.
- Granulado, ruido e textura de filme.
- Preview de projetos com efeito de pelicula apenas em hover/focus.
- Sempre respeitar `prefers-reduced-motion`.
