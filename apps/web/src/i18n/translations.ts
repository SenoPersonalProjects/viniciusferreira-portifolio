export type Language = "pt-BR" | "en";

export const DEFAULT_LANGUAGE: Language = "pt-BR";
export const LANGUAGE_STORAGE_KEY = "portfolio-language";

export const translations = {
  "pt-BR": {
    languageName: "Português",
    languageShort: "PT",
    nextLanguageName: "English",
    languageToggleLabel:
      "Idioma atual: Português. Clique para mudar para English.",
    header: {
      nav: {
        home: "Início",
        projects: "Projetos",
        about: "Sobre",
        contact: "Contato",
      },
    },
    colorMode: {
      labels: {
        system: "Sistema",
        light: "Claro",
        dark: "Escuro",
      },
      ariaPrefix: "Modo atual",
      ariaSuffix: "Clique para alternar.",
      titlePrefix: "Modo",
    },
    experience: {
      toggleLabel: "Alternar experiência visual",
      labels: {
        modern: "Modern",
        vintage: "Vintage",
      },
    },
    profile: {
      role: "Desenvolvedor Full Stack",
      headline:
        "Crio aplicações web modernas, performáticas e bem estruturadas, conectando frontend, backend e experiência do usuário.",
      summary:
        "Sou desenvolvedor com foco em soluções web utilizando tecnologias como Next.js, NestJS, TypeScript e Node.js. Este portfólio apresenta minha trajetória, stack e projetos através de duas experiências visuais distintas.",
    },
    hero: {
      intro: "Eu sou",
      projectsCta: "Ver projetos",
      contactCta: "Contato seguro",
      production: "Produção #026",
      posterRole: "Diretor",
      posterExperience: "Experiência noir",
    },
    about: {
      eyebrow: "Dossiê",
      titleStart: "Um olhar sobre os",
      titleHighlight: "arquivos",
      classified: "Informação reservada",
      focus:
        "Meu foco é desenvolver produtos digitais com arquitetura robusta, experiências de uso fluidas e código preparado para atravessar o tempo.",
      end: "Fim do arquivo",
    },
    stack: {
      eyebrow: "Arsenal",
      titleStart: "Manifesto",
      titleHighlight: "técnico",
      categories: ["Frontend", "Backend", "Banco de dados", "Ferramentas"],
    },
    projectsSection: {
      eyebrow: "Projetos",
      title: "Projetos em destaque",
    },
    filmReel: {
      description:
        "Cada frame apresenta um projeto em formato de película. Passe o mouse sobre um frame para acionar um preview cinematográfico com estética noir.",
      previous: "Anterior",
      next: "Próximo",
    },
    filmFrame: {
      previewAltPrefix: "Preview do projeto",
      previewLabel: "Projetando...",
      frameLabel: "Frame",
      code: "Código",
      live: "Exibir",
      unavailable: "Classificado",
    },
    projects: {
      "portfolio-gerenciavel": {
        title: "Portfólio Gerenciável",
        description:
          "Portfólio pessoal com frontend em Next.js, backend em NestJS e experiências visuais Modern e Vintage.",
      },
      "ecommerce-noir": {
        title: "E-commerce Noir",
        description:
          "Projeto mockado de loja virtual com catálogo, página de produto, checkout e área administrativa.",
      },
      "dashboard-cinema": {
        title: "Dashboard Cinema",
        description:
          "Projeto mockado de dashboard analítico com métricas, gráficos, usuários e relatórios.",
      },
      "api-archive": {
        title: "API Archive",
        description:
          "Projeto mockado de API com autenticação, banco de dados, documentação e deploy.",
      },
    },
    contact: {
      eyebrow: "Transmissão",
      titleStart: "Estabeleceu uma",
      titleHighlight: "conexão",
      copy:
        "Aberto para conversas técnicas, engenharia de produto ou novas oportunidades. A linha está aberta.",
      messageCta: "Enviar mensagem",
    },
    footer: {
      rights: "Todos os direitos reservados.",
    },
  },
  en: {
    languageName: "English",
    languageShort: "EN",
    nextLanguageName: "Português",
    languageToggleLabel:
      "Current language: English. Click to switch to Português.",
    header: {
      nav: {
        home: "Home",
        projects: "Archive",
        about: "Intel",
        contact: "Terminal",
      },
    },
    colorMode: {
      labels: {
        system: "System",
        light: "Light",
        dark: "Dark",
      },
      ariaPrefix: "Current mode",
      ariaSuffix: "Click to cycle.",
      titlePrefix: "Mode",
    },
    experience: {
      toggleLabel: "Toggle visual experience",
      labels: {
        modern: "Modern",
        vintage: "Vintage",
      },
    },
    profile: {
      role: "Full Stack Developer",
      headline:
        "I build modern, performant, well-structured web applications connecting frontend, backend, and user experience.",
      summary:
        "I am a developer focused on web solutions using technologies like Next.js, NestJS, TypeScript, and Node.js. This portfolio presents my path, stack, and projects through two distinct visual experiences.",
    },
    hero: {
      intro: "I am",
      projectsCta: "Exhibit Projects",
      contactCta: "Secure Contact",
      production: "Production #026",
      posterRole: "Director",
      posterExperience: "Noir Experience",
    },
    about: {
      eyebrow: "Intel",
      titleStart: "A glimpse into the",
      titleHighlight: "files",
      classified: "Classified info",
      focus:
        "My focus is on engineering digital products with robust architecture, seamless user experiences, and code built to withstand the test of time.",
      end: "End of file",
    },
    stack: {
      eyebrow: "Arsenal",
      titleStart: "Technical",
      titleHighlight: "manifest",
      categories: ["Frontend", "Backend", "Database", "Tools"],
    },
    projectsSection: {
      eyebrow: "Projects",
      title: "Featured projects",
    },
    filmReel: {
      description:
        "Each frame showcases a project in a film strip format. Hover over a frame to trigger a cinematic preview with noir aesthetics.",
      previous: "Previous",
      next: "Next",
    },
    filmFrame: {
      previewAltPrefix: "Preview of project",
      previewLabel: "Projecting...",
      frameLabel: "Frame",
      code: "Code",
      live: "Exhibit",
      unavailable: "Classified",
    },
    projects: {
      "portfolio-gerenciavel": {
        title: "Manageable Portfolio",
        description:
          "Personal portfolio with a Next.js frontend, NestJS backend, and Modern and Vintage visual experiences.",
      },
      "ecommerce-noir": {
        title: "E-commerce Noir",
        description:
          "Mock virtual store project with catalog, product page, checkout, and admin area.",
      },
      "dashboard-cinema": {
        title: "Dashboard Cinema",
        description:
          "Mock analytics dashboard project with metrics, charts, users, and reports.",
      },
      "api-archive": {
        title: "API Archive",
        description:
          "Mock API project with authentication, database, documentation, and deployment.",
      },
    },
    contact: {
      eyebrow: "Transmission",
      titleStart: "Established a",
      titleHighlight: "connection",
      copy:
        "Open for tech discussions, product engineering, or new opportunities. The line is open.",
      messageCta: "Send Message",
    },
    footer: {
      rights: "All rights reserved.",
    },
  },
} as const;

export type TranslationDictionary = (typeof translations)[Language];
