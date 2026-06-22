export type Language = "pt-BR" | "en";

export const DEFAULT_LANGUAGE: Language = "pt-BR";
export const LANGUAGE_STORAGE_KEY = "portfolio-language";

export const translations = {
  "pt-BR": {
    languageName: "Portugues",
    languageShort: "PT",
    nextLanguageName: "English",
    languageToggleLabel:
      "Idioma atual: Portugues. Clique para mudar para English.",
    header: {
      nav: {
        home: "Inicio",
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
      toggleLabel: "Alternar experiencia visual",
      labels: {
        modern: "Modern",
        vintage: "Vintage",
      },
    },
    profile: {
      role: "Desenvolvedor Full Stack",
      headline:
        "Desenvolvo interfaces e APIs para produtos web que precisam ser claros, rapidos e faceis de evoluir.",
      summary:
        "Sou desenvolvedor full stack com foco em Next.js, React, NestJS, Node.js e TypeScript. Trabalho conectando experiencia de uso, arquitetura de frontend e APIs bem organizadas para transformar ideias em produtos web gerenciaveis.",
    },
    hero: {
      intro: "Eu sou",
      projectsCta: "Ver projetos",
      contactCta: "Contato seguro",
      production: "Arquivo #026",
      posterRole: "Desenvolvedor",
      posterExperience: "Portfolio gerenciavel",
    },
    detectiveFile: {
      openLabel: "Abrir dossie confidencial",
      closeLabel: "Fechar dossie confidencial",
      hint: "Clique para abrir o dossie",
      classified: "CONFIDENCIAL",
      caseFile: "DOSSIE",
      fileNumber: "VF-026",
      subject: "ALVO",
      subjectName: "VINICIUS FERREIRA",
      roleLabel: "FUNCAO",
      role: "DESENVOLVEDOR FULL STACK",
      status: "STATUS",
      statusActive: "ATIVO",
      caseLabel: "CASO",
      evidence: "EVIDENCIA",
      photoAlt: "Retrato noir de Vinicius Ferreira",
      secondaryPhotoAlt: "Foto secundaria do dossie de Vinicius Ferreira",
      groupPhotoAlt: "Foto de grupo do dossie de Vinicius Ferreira",
    },
    about: {
      eyebrow: "Dossie",
      titleStart: "Codigo com",
      titleHighlight: "contexto",
      classified: "Informacao reservada",
      focus:
        "Meu foco e construir bases que continuem legiveis depois da primeira entrega: componentes claros, contratos de API previsiveis e uma experiencia que nao sacrifica manutencao por efeito visual.",
      end: "Fim do arquivo",
    },
    roadmap: {
      eyebrow: "Roadmap",
      title: "Formacao e carreira",
      copy:
        "Uma linha do tempo enxuta do que venho construindo: estudos, pratica full stack e projetos que transformam stack em produto.",
      selected: "Dossie selecionado",
      types: {
        formacao: "Formacao",
        carreira: "Carreira",
        projeto: "Projeto",
      },
    },
    stack: {
      eyebrow: "Stack",
      titleStart: "Ferramentas de",
      titleHighlight: "producao",
      categories: ["Frontend", "Backend", "Banco de dados", "Ferramentas"],
    },
    projectsSection: {
      eyebrow: "Projetos",
      title: "Projetos em destaque",
    },
    filmReel: {
      description:
        "Cada frame reune um projeto ou estudo em formato de pelicula. Passe o mouse para ver o preview e abra os links quando houver repositorio ou demo publica.",
      previous: "Anterior",
      next: "Proximo",
    },
    filmFrame: {
      previewAltPrefix: "Preview do projeto",
      previewLabel: "Projetando...",
      frameLabel: "Frame",
      code: "Codigo",
      live: "Exibir",
      unavailable: "Classificado",
    },
    projects: {
      "portfolio-gerenciavel": {
        title: "Portfolio Gerenciavel",
        description:
          "Portfolio pessoal com Next.js, NestJS, Three.js e uma base administrativa para evoluir conteudo sem hardcode.",
      },
      "ecommerce-noir": {
        title: "E-commerce Noir",
        description:
          "Estudo de loja virtual com catalogo, fluxo de compra e area administrativa, pensado para demonstrar arquitetura full stack.",
      },
      "dashboard-cinema": {
        title: "Dashboard Cinema",
        description:
          "Estudo de dashboard analitico para apresentar metricas, usuarios e relatorios em uma interface editorial.",
      },
      "api-archive": {
        title: "API Archive",
        description:
          "Estudo de API com autenticacao, banco de dados, documentacao e organizacao de endpoints para produto web.",
      },
    },
    contact: {
      eyebrow: "Transmissao",
      titleStart: "Vamos abrir uma",
      titleHighlight: "conversa",
      copy:
        "Estou aberto para oportunidades, conversas tecnicas e projetos que precisem de frontend bem cuidado, API consistente e evolucao com criterio.",
      messageCta: "Enviar mensagem",
    },
    footer: {
      rights: "Todos os direitos reservados.",
    },
  },
  en: {
    languageName: "English",
    languageShort: "EN",
    nextLanguageName: "Portugues",
    languageToggleLabel:
      "Current language: English. Click to switch to Portugues.",
    header: {
      nav: {
        home: "Home",
        projects: "Projects",
        about: "About",
        contact: "Contact",
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
        "I build interfaces and APIs for web products that need to be clear, fast, and easy to evolve.",
      summary:
        "I am a full stack developer focused on Next.js, React, NestJS, Node.js, and TypeScript. I connect user experience, frontend architecture, and organized APIs to turn ideas into manageable web products.",
    },
    hero: {
      intro: "I am",
      projectsCta: "View projects",
      contactCta: "Secure contact",
      production: "File #026",
      posterRole: "Developer",
      posterExperience: "Manageable portfolio",
    },
    detectiveFile: {
      openLabel: "Open confidential dossier",
      closeLabel: "Close confidential dossier",
      hint: "Click to open the dossier",
      classified: "CLASSIFIED",
      caseFile: "CASE FILE",
      fileNumber: "VF-026",
      subject: "SUBJECT",
      subjectName: "VINICIUS FERREIRA",
      roleLabel: "ROLE",
      role: "FULL STACK DEVELOPER",
      status: "STATUS",
      statusActive: "ACTIVE",
      caseLabel: "CASE",
      evidence: "EVIDENCE",
      photoAlt: "Noir portrait of Vinicius Ferreira",
      secondaryPhotoAlt: "Secondary dossier photo of Vinicius Ferreira",
      groupPhotoAlt: "Group dossier photo of Vinicius Ferreira",
    },
    about: {
      eyebrow: "Dossier",
      titleStart: "Code with",
      titleHighlight: "context",
      classified: "Reserved information",
      focus:
        "My focus is building foundations that remain readable after the first delivery: clear components, predictable API contracts, and an experience that does not trade maintainability for visual impact.",
      end: "End of file",
    },
    roadmap: {
      eyebrow: "Roadmap",
      title: "Education and career",
      copy:
        "A concise timeline of what I have been building: studies, full stack practice, and projects that turn a stack into a product.",
      selected: "Selected dossier",
      types: {
        formacao: "Education",
        carreira: "Career",
        projeto: "Project",
      },
    },
    stack: {
      eyebrow: "Stack",
      titleStart: "Production",
      titleHighlight: "tools",
      categories: ["Frontend", "Backend", "Database", "Tools"],
    },
    projectsSection: {
      eyebrow: "Projects",
      title: "Featured projects",
    },
    filmReel: {
      description:
        "Each frame gathers a project or study in a film-strip format. Hover to preview it and open links when a repository or public demo is available.",
      previous: "Previous",
      next: "Next",
    },
    filmFrame: {
      previewAltPrefix: "Preview of project",
      previewLabel: "Projecting...",
      frameLabel: "Frame",
      code: "Code",
      live: "View",
      unavailable: "Classified",
    },
    projects: {
      "portfolio-gerenciavel": {
        title: "Manageable Portfolio",
        description:
          "Personal portfolio with Next.js, NestJS, Three.js, and an admin foundation for evolving content without hardcoding.",
      },
      "ecommerce-noir": {
        title: "E-commerce Noir",
        description:
          "Virtual store study with catalog, purchase flow, and admin area, designed to demonstrate full stack architecture.",
      },
      "dashboard-cinema": {
        title: "Dashboard Cinema",
        description:
          "Analytics dashboard study for presenting metrics, users, and reports through an editorial interface.",
      },
      "api-archive": {
        title: "API Archive",
        description:
          "API study with authentication, database, documentation, and endpoint organization for a web product.",
      },
    },
    contact: {
      eyebrow: "Transmission",
      titleStart: "Let's open a",
      titleHighlight: "conversation",
      copy:
        "I am open to opportunities, technical conversations, and projects that need thoughtful frontend, consistent APIs, and careful evolution.",
      messageCta: "Send message",
    },
    footer: {
      rights: "All rights reserved.",
    },
  },
} as const;

export type TranslationDictionary = (typeof translations)[Language];
