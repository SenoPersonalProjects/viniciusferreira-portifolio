export const projects = [
  {
    title: "Portfolio Gerenciavel",
    slug: "portfolio-gerenciavel",
    description:
      "Portfolio pessoal com Next.js, NestJS, Three.js e uma base administrativa para evoluir conteudo sem hardcode.",
    stack: ["Next.js", "NestJS", "TypeScript", "Tailwind CSS"],
    repositoryUrl:
      "https://github.com/SenoPersonalProjects/viniciusferreira-portifolio",
    liveUrl: "",
    featured: true,
    frameCode: "VF-001",
    posterImage: "/projects/portfolio/poster.svg",
    previewImages: [
      "/projects/portfolio/preview-01.svg",
      "/projects/portfolio/preview-02.svg",
      "/projects/portfolio/preview-03.svg",
      "/projects/portfolio/preview-04.svg",
    ],
  },
  {
    title: "E-commerce Noir",
    slug: "ecommerce-noir",
    description:
      "Estudo de loja virtual com catalogo, fluxo de compra e area administrativa, pensado para demonstrar arquitetura full stack.",
    stack: ["Next.js", "NestJS", "TypeScript", "PostgreSQL"],
    repositoryUrl: "",
    liveUrl: "",
    featured: true,
    frameCode: "VF-002",
    posterImage: "/projects/ecommerce-noir/poster.svg",
    previewImages: [
      "/projects/ecommerce-noir/preview-01.svg",
      "/projects/ecommerce-noir/preview-02.svg",
      "/projects/ecommerce-noir/preview-03.svg",
      "/projects/ecommerce-noir/preview-04.svg",
    ],
  },
  {
    title: "Dashboard Cinema",
    slug: "dashboard-cinema",
    description:
      "Estudo de dashboard analitico para apresentar metricas, usuarios e relatorios em uma interface editorial.",
    stack: ["React", "TypeScript", "Tailwind CSS", "Charts"],
    repositoryUrl: "",
    liveUrl: "",
    featured: true,
    frameCode: "VF-003",
    posterImage: "/projects/dashboard-cinema/poster.svg",
    previewImages: [
      "/projects/dashboard-cinema/preview-01.svg",
      "/projects/dashboard-cinema/preview-02.svg",
      "/projects/dashboard-cinema/preview-03.svg",
      "/projects/dashboard-cinema/preview-04.svg",
    ],
  },
  {
    title: "API Archive",
    slug: "api-archive",
    description:
      "Estudo de API com autenticacao, banco de dados, documentacao e organizacao de endpoints para produto web.",
    stack: ["NestJS", "Prisma", "PostgreSQL", "JWT"],
    repositoryUrl: "",
    liveUrl: "",
    featured: true,
    frameCode: "VF-004",
    posterImage: "/projects/api-archive/poster.svg",
    previewImages: [
      "/projects/api-archive/preview-01.svg",
      "/projects/api-archive/preview-02.svg",
      "/projects/api-archive/preview-03.svg",
      "/projects/api-archive/preview-04.svg",
    ],
  },
];

export type Project = (typeof projects)[number];
