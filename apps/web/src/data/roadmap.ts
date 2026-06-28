export type RoadmapItem = {
  id: string;
  startDate: string;
  endDate: string;
  title: string;
  type: "formacao" | "carreira" | "projeto";
  summary: string;
  details: string;
  technologies: string[];
  order: number;
  published: boolean;
};

export const roadmap: RoadmapItem[] = [
  {
    id: "roadmap-portfolio-gerenciavel",
    startDate: "2026-01",
    endDate: "2026-06",
    title: "Portfólio gerenciável",
    type: "projeto",
    summary:
      "Construção deste portfólio como produto próprio, com frontend em Next.js, backend em NestJS e ambientação 3D vintage.",
    details:
      "O projeto concentra UI editorial, Three.js imperativo, painel administrativo, API e uma base de conteúdo preparada para evoluir sem depender de alterações manuais no código.",
    technologies: ["Next.js", "NestJS", "TypeScript", "Three.js", "Prisma"],
    order: 1,
    published: true,
  },
  {
    id: "roadmap-fullstack",
    startDate: "2025-01",
    endDate: "2026-01",
    title: "Consolidação full stack",
    type: "carreira",
    summary:
      "Aprofundamento em aplicações web completas, conectando frontend, backend, banco de dados e deploy.",
    details:
      "Foco em React, TypeScript, Node.js, APIs REST, modelagem de dados e organização de projetos em monorepo.",
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    order: 2,
    published: true,
  },
  {
    id: "roadmap-base-web",
    startDate: "2024-01",
    endDate: "2025-01",
    title: "Base em desenvolvimento web",
    type: "formacao",
    summary:
      "Estudo e prática dos fundamentos de interfaces, lógica de aplicação, versionamento e consumo de APIs.",
    details:
      "Período dedicado a transformar fundamentos em projetos aplicáveis, com atenção a responsividade, estrutura de componentes e manutenção do código.",
    technologies: ["HTML", "CSS", "JavaScript", "Git"],
    order: 3,
    published: true,
  },
];
