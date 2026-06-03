export const projects = [
  {
    title: "Portfólio Gerenciável",
    slug: "portfolio-gerenciavel",
    description:
      "Portfólio pessoal com frontend em Next.js, backend em NestJS e experiências visuais Modern e Vintage.",
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
      "Projeto mockado de loja virtual com catálogo, página de produto, checkout e área administrativa.",
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
      "Projeto mockado de dashboard analítico com métricas, gráficos, usuários e relatórios.",
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
      "Projeto mockado de API com autenticação, banco de dados, documentação e deploy.",
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