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
    title: "Portfolio gerenciavel",
    type: "projeto",
    summary:
      "Construcao deste portfolio como produto proprio, com frontend em Next.js, backend em NestJS e ambientacao 3D vintage.",
    details:
      "O projeto concentra UI editorial, Three.js imperativo, painel administrativo, API e uma base de conteudo preparada para evoluir sem depender de alteracoes manuais no codigo.",
    technologies: ["Next.js", "NestJS", "TypeScript", "Three.js", "Prisma"],
    order: 1,
    published: true,
  },
  {
    id: "roadmap-fullstack",
    startDate: "2025-01",
    endDate: "2026-01",
    title: "Consolidacao full stack",
    type: "carreira",
    summary:
      "Aprofundamento em aplicacoes web completas, conectando frontend, backend, banco de dados e deploy.",
    details:
      "Foco em React, TypeScript, Node.js, APIs REST, modelagem de dados e organizacao de projetos em monorepo.",
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
      "Estudo e pratica dos fundamentos de interfaces, logica de aplicacao, versionamento e consumo de APIs.",
    details:
      "Periodo dedicado a transformar fundamentos em projetos aplicaveis, com atencao a responsividade, estrutura de componentes e manutencao do codigo.",
    technologies: ["HTML", "CSS", "JavaScript", "Git"],
    order: 3,
    published: true,
  },
];
