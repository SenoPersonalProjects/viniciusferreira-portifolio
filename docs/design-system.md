# Design System

## Direção visual

O portfólio terá duas experiências visuais principais:

- **Modern:** estética tecnológica, escura, com detalhes em neon.
- **Vintage:** estética preto e branco, inspirada entre as décadas de 1930 e 1950.

## Princípios

- O conteúdo deve ser compartilhado entre as experiências.
- A troca visual não deve alterar a estrutura principal dos dados.
- Os temas devem ser controlados por tokens.
- Componentes devem usar variáveis semânticas, não cores fixas.
- A interface deve ser responsiva, acessível e performática.

## Experiência Modern

Características:

- Fundo escuro.
- Detalhes em neon.
- Alto contraste.
- Gradientes sutis.
- Elementos tecnológicos.
- Animações mais presentes.
- Sensação de interface futurista.

Tokens iniciais:

```css
:root[data-experience="modern"] {
  --background: #030712;
  --foreground: #f8fafc;
  --primary: #22d3ee;
  --secondary: #a855f7;
  --muted: #94a3b8;
  --surface: #111827;
  --border: #1f2937;
}
```

## Experiência Vintage

Características:

- Preto e branco.
- Inspiração editorial.
- Alto uso de contraste tipográfico.
- Texturas leves de papel ou filme.
- Bordas clássicas.
- Animações mais discretas.
- Sensação de pôster, jornal ou cinema antigo.

Tokens iniciais:

```css
:root[data-experience="vintage"] {
  --background: #f5f1e8;
  --foreground: #111111;
  --primary: #111111;
  --secondary: #4b4b4b;
  --muted: #777777;
  --surface: #fffaf0;
  --border: #222222;
}
```

## Componentes iniciais

- Header
- Footer
- ExperienceToggle
- HeroSection
- AboutSection
- StackSection
- ProjectsSection
- ContactSection
- ProjectCard
- StackBadge

## Tipografia

Sugestão inicial:

### Modern

- Fonte principal: Sans-serif moderna
- Uso de pesos médios e fortes
- Espaçamento generoso
- Letras com aparência tecnológica

### Vintage

- Fonte principal: Serifada ou display
- Fonte auxiliar: Sans-serif simples
- Composição inspirada em jornal, pôster ou cinema clássico

## Animações

### Modern

- Glow
- Hover com brilho
- Transições suaves
- Efeitos de linha ou scan
- Microinterações em cards

### Vintage

- Fade discreto
- Movimento sutil
- Efeito de granulação
- Transições com aparência cinematográfica
