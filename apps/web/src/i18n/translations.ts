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
      navLabel: "Navegação principal",
      nav: {
        about: "Sobre",
        roadmap: "Trajetória",
        stack: "Stack",
        projects: "Projetos",
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
    reducedMotionIndicator: {
      title: "Movimento reduzido ativo",
      description:
        "Seu sistema está pedindo menos movimento. Animações e interações 3D foram suavizadas neste site.",
    },
    profile: {
      role: "Desenvolvedor Full Stack",
      headline:
        "Desenvolvo interfaces e APIs para produtos web que precisam ser claros, rápidos e fáceis de evoluir.",
      summary:
        "Sou desenvolvedor full stack com foco em Next.js, React, NestJS, Node.js e TypeScript. Conecto experiência de uso, arquitetura de frontend e APIs bem organizadas para transformar ideias em produtos web gerenciáveis.",
    },
    hero: {
      intro: "Eu sou",
      projectsCta: "Ver projetos",
      contactCta: "Contato seguro",
      production: "Arquivo #026",
      posterRole: "Desenvolvedor",
      posterExperience: "Portfólio gerenciável",
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
      eyebrow: "Dossiê técnico",
      titleStart: "Código com",
      titleHighlight: "contexto",
      classified: "Informação reservada",
      focus:
        "Meu foco é construir bases que continuem legíveis depois da primeira entrega: componentes claros, contratos de API previsíveis e uma experiência que não sacrifica manutenção por impacto visual.",
      end: "Fim do arquivo",
    },
    roadmap: {
      eyebrow: "Registro",
      title: "Registro de trajetória",
      copy:
        "Uma linha do tempo da minha evolução técnica: fundamentos, prática full stack e projetos que conectam código, produto e experiência.",
      evidence: "Evidência",
      technologies: "Tecnologias",
      figure: "FIG.",
      selectItem: "Selecionar item da linha do tempo",
      types: {
        formacao: "Formação",
        carreira: "Carreira",
        projeto: "Projeto",
      },
      items: {
        "roadmap-portfolio-gerenciavel": {
          title: "Portfólio gerenciável",
          summary:
            "Construção deste portfólio como produto próprio, com frontend em Next.js, backend em NestJS e ambientação 3D vintage.",
          details:
            "O projeto concentra UI editorial, Three.js imperativo, painel administrativo, API e uma base de conteúdo preparada para evoluir sem depender de alterações manuais no código.",
        },
        "roadmap-fullstack": {
          title: "Consolidação full stack",
          summary:
            "Aprofundamento em aplicações web completas, conectando frontend, backend, banco de dados e deploy.",
          details:
            "Foco em React, TypeScript, Node.js, APIs REST, modelagem de dados e organização de projetos em monorepo.",
        },
        "roadmap-base-web": {
          title: "Base em desenvolvimento web",
          summary:
            "Estudo e prática dos fundamentos de interfaces, lógica de aplicação, versionamento e consumo de APIs.",
          details:
            "Período dedicado a transformar fundamentos em projetos aplicáveis, com atenção a responsividade, estrutura de componentes e manutenção do código.",
        },
      },
    },
    stack: {
      eyebrow: "Stack",
      titleStart: "Ferramentas de",
      titleHighlight: "produção",
      categories: ["Frontend", "Backend", "Banco de dados", "Ferramentas"],
    },
    projectsSection: {
      eyebrow: "Projetos",
      title: "Projetos em destaque",
    },
    filmReel: {
      description:
        "Cada frame reúne um projeto ou estudo em formato de película. Passe o mouse para ver o preview e abra os links quando houver repositório ou demo pública.",
      previous: "Anterior",
      next: "Próximo",
      previousLabel: "Projeto anterior",
      nextLabel: "Próximo projeto",
      carouselLabel: "Projetos em destaque",
      viewportLabel: "Película de projetos",
      roleDescription: "carrossel",
      instructions:
        "Use as setas para navegar pelos projetos. Use Home para ir ao primeiro projeto e End para ir ao último.",
      statusLabel: "Projeto ativo",
      statusOf: "de",
    },
    filmFrame: {
      previewAltPrefix: "Preview do projeto",
      previewLabel: "Projetando...",
      frameLabel: "Frame",
      projectLabel: "Projeto",
      code: "Código",
      codeAriaLabel: "Código do projeto",
      live: "Exibir",
      liveAriaLabel: "Abrir projeto",
      unavailable: "Indisponível",
      unavailableAriaLabel: "Demonstração indisponível",
    },
    projects: {
      "portfolio-gerenciavel": {
        title: "Portfólio Gerenciável",
        description:
          "Portfólio pessoal com Next.js, NestJS, Three.js e uma base administrativa para evoluir conteúdo sem hardcode.",
      },
      "ecommerce-noir": {
        title: "E-commerce Noir",
        description:
          "Estudo de loja virtual com catálogo, fluxo de compra e área administrativa, pensado para demonstrar arquitetura full stack.",
      },
      "dashboard-cinema": {
        title: "Dashboard Cinema",
        description:
          "Estudo de dashboard analítico para apresentar métricas, usuários e relatórios em uma interface editorial.",
      },
      "api-archive": {
        title: "API Archive",
        description:
          "Estudo de API com autenticação, banco de dados, documentação e organização de endpoints para produto web.",
      },
    },
    contact: {
      eyebrow: "Contato",
      titleStart: "Canal de",
      titleHighlight: "comunicação",
      copy:
        "Disponível para oportunidades técnicas, conversas sobre produto e projetos que precisem de frontend bem cuidado, APIs consistentes e evolução com critério.",
      messageCta: "Enviar mensagem",
    },
    footer: {
      rights: "Todos os direitos reservados.",
      tagline: "Portfólio gerenciável construído com Next.js, NestJS e TypeScript.",
    },
  },
  en: {
    languageName: "English",
    languageShort: "EN",
    nextLanguageName: "Português",
    languageToggleLabel:
      "Current language: English. Click to switch to Português.",
    header: {
      navLabel: "Primary navigation",
      nav: {
        about: "About",
        roadmap: "Trajectory",
        stack: "Stack",
        projects: "Projects",
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
    reducedMotionIndicator: {
      title: "Reduced motion active",
      description:
        "Your system is requesting less motion. Animations and 3D interactions are softened on this site.",
    },
    profile: {
      role: "Full Stack Developer",
      headline:
        "I build interfaces and APIs for web products that need to be clear, fast, and easy to evolve.",
      summary:
        "I am a full stack developer focused on Next.js, React, NestJS, Node.js, and TypeScript. I connect user experience, frontend architecture, and well-structured APIs to turn ideas into manageable web products.",
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
      eyebrow: "Technical dossier",
      titleStart: "Code with",
      titleHighlight: "context",
      classified: "Reserved information",
      focus:
        "My focus is building foundations that remain readable after the first delivery: clear components, predictable API contracts, and an experience that does not trade maintainability for visual impact.",
      end: "End of file",
    },
    roadmap: {
      eyebrow: "Record",
      title: "Career trajectory",
      copy:
        "A timeline of my technical evolution: fundamentals, full stack practice, and projects that connect code, product, and experience.",
      evidence: "Evidence",
      technologies: "Technologies",
      figure: "FIG.",
      selectItem: "Select timeline item",
      types: {
        formacao: "Education",
        carreira: "Career",
        projeto: "Project",
      },
      items: {
        "roadmap-portfolio-gerenciavel": {
          title: "Manageable portfolio",
          summary:
            "Building this portfolio as a product of its own, with a Next.js frontend, NestJS backend, and vintage 3D atmosphere.",
          details:
            "The project brings together editorial UI, imperative Three.js, an admin panel, API, and a content foundation prepared to evolve without manual code changes.",
        },
        "roadmap-fullstack": {
          title: "Full stack consolidation",
          summary:
            "Deeper practice in complete web applications, connecting frontend, backend, database, and deployment.",
          details:
            "Focused on React, TypeScript, Node.js, REST APIs, data modeling, and project organization in a monorepo.",
        },
        "roadmap-base-web": {
          title: "Web development foundation",
          summary:
            "Study and practice of interface fundamentals, application logic, version control, and API consumption.",
          details:
            "A period dedicated to turning fundamentals into applicable projects, with attention to responsiveness, component structure, and code maintenance.",
        },
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
      previousLabel: "Previous project",
      nextLabel: "Next project",
      carouselLabel: "Featured projects",
      viewportLabel: "Project film reel",
      roleDescription: "carousel",
      instructions:
        "Use the arrow keys to navigate projects. Use Home to go to the first project and End to go to the last.",
      statusLabel: "Active project",
      statusOf: "of",
    },
    filmFrame: {
      previewAltPrefix: "Preview of project",
      previewLabel: "Projecting...",
      frameLabel: "Frame",
      projectLabel: "Project",
      code: "Code",
      codeAriaLabel: "Project code",
      live: "View",
      liveAriaLabel: "Open project",
      unavailable: "Classified",
      unavailableAriaLabel: "Demo unavailable",
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
      eyebrow: "Contact",
      titleStart: "Communication",
      titleHighlight: "channel",
      copy:
        "Available for technical opportunities, product conversations, and projects that need thoughtful frontend, consistent APIs, and careful evolution.",
      messageCta: "Send message",
    },
    footer: {
      rights: "All rights reserved.",
      tagline: "Manageable portfolio built with Next.js, NestJS, and TypeScript.",
    },
  },
} as const;

export type TranslationDictionary = (typeof translations)[Language];
