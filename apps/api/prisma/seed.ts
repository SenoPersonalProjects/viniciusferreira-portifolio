import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.profile.deleteMany();
  await prisma.contactLink.deleteMany();
  await prisma.technology.deleteMany();
  await prisma.project.deleteMany();
  await prisma.roadmapItem.deleteMany();
  await prisma.siteCopy.deleteMany();

  await prisma.profile.create({
    data: {
      name: 'Vinicius Ferreira',
      rolePt: 'Desenvolvedor Full Stack',
      roleEn: 'Full Stack Developer',
      headlinePt:
        'Desenvolvo interfaces e APIs para produtos web que precisam ser claros, rapidos e faceis de evoluir.',
      headlineEn:
        'I build interfaces and APIs for web products that need to be clear, fast, and easy to evolve.',
      summaryPt:
        'Sou desenvolvedor full stack com foco em Next.js, React, NestJS, Node.js e TypeScript. Trabalho conectando experiencia de uso, arquitetura de frontend e APIs bem organizadas para transformar ideias em produtos web gerenciaveis.',
      summaryEn:
        'I am a full stack developer focused on Next.js, React, NestJS, Node.js, and TypeScript. I connect user experience, frontend architecture, and organized APIs to turn ideas into manageable web products.',
      locationPt: 'Brasil',
      locationEn: 'Brazil',
    },
  });

  await prisma.contactLink.createMany({
    data: [
      {
        id: 'github',
        label: 'GitHub',
        type: 'github',
        url: 'https://github.com/SenoPersonalProjects',
        order: 1,
        visible: true,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        type: 'linkedin',
        url: '',
        order: 2,
        visible: false,
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        url: '',
        order: 3,
        visible: false,
      },
    ],
  });

  await prisma.technology.createMany({
    data: [
      {
        categoryPt: 'Frontend',
        categoryEn: 'Frontend',
        items: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
        order: 1,
      },
      {
        categoryPt: 'Backend',
        categoryEn: 'Backend',
        items: ['NestJS', 'Node.js', 'TypeScript', 'REST APIs'],
        order: 2,
      },
      {
        categoryPt: 'Banco de dados',
        categoryEn: 'Database',
        items: ['PostgreSQL', 'Prisma', 'SQL'],
        order: 3,
      },
      {
        categoryPt: 'Ferramentas',
        categoryEn: 'Tools',
        items: ['Git', 'GitHub', 'pnpm', 'VS Code'],
        order: 4,
      },
    ],
  });

  await prisma.project.createMany({
    data: [
      {
        titlePt: 'Portfolio Gerenciavel',
        titleEn: 'Manageable Portfolio',
        slug: 'portfolio-gerenciavel',
        descriptionPt:
          'Portfolio pessoal com Next.js, NestJS, Three.js e uma base administrativa para evoluir conteudo sem hardcode.',
        descriptionEn:
          'Personal portfolio with Next.js, NestJS, Three.js, and an admin foundation for evolving content without hardcoding.',
        stack: ['Next.js', 'NestJS', 'TypeScript', 'Tailwind CSS'],
        repositoryUrl:
          'https://github.com/SenoPersonalProjects/viniciusferreira-portifolio',
        liveUrl: '',
        featured: true,
        frameCode: 'VF-001',
        posterImage: '/projects/portfolio/poster.svg',
        previewImages: [
          '/projects/portfolio/preview-01.svg',
          '/projects/portfolio/preview-02.svg',
          '/projects/portfolio/preview-03.svg',
          '/projects/portfolio/preview-04.svg',
        ],
        published: true,
        order: 1,
      },
      {
        titlePt: 'E-commerce Noir',
        titleEn: 'E-commerce Noir',
        slug: 'ecommerce-noir',
        descriptionPt:
          'Estudo de loja virtual com catalogo, fluxo de compra e area administrativa, pensado para demonstrar arquitetura full stack.',
        descriptionEn:
          'Virtual store study with catalog, purchase flow, and admin area, designed to demonstrate full stack architecture.',
        stack: ['Next.js', 'NestJS', 'TypeScript', 'PostgreSQL'],
        repositoryUrl: '',
        liveUrl: '',
        featured: true,
        frameCode: 'VF-002',
        posterImage: '/projects/ecommerce-noir/poster.svg',
        previewImages: [
          '/projects/ecommerce-noir/preview-01.svg',
          '/projects/ecommerce-noir/preview-02.svg',
          '/projects/ecommerce-noir/preview-03.svg',
          '/projects/ecommerce-noir/preview-04.svg',
        ],
        published: true,
        order: 2,
      },
      {
        titlePt: 'Dashboard Cinema',
        titleEn: 'Dashboard Cinema',
        slug: 'dashboard-cinema',
        descriptionPt:
          'Estudo de dashboard analitico para apresentar metricas, usuarios e relatorios em uma interface editorial.',
        descriptionEn:
          'Analytics dashboard study for presenting metrics, users, and reports through an editorial interface.',
        stack: ['React', 'TypeScript', 'Tailwind CSS', 'Charts'],
        repositoryUrl: '',
        liveUrl: '',
        featured: true,
        frameCode: 'VF-003',
        posterImage: '/projects/dashboard-cinema/poster.svg',
        previewImages: [
          '/projects/dashboard-cinema/preview-01.svg',
          '/projects/dashboard-cinema/preview-02.svg',
          '/projects/dashboard-cinema/preview-03.svg',
          '/projects/dashboard-cinema/preview-04.svg',
        ],
        published: true,
        order: 3,
      },
      {
        titlePt: 'API Archive',
        titleEn: 'API Archive',
        slug: 'api-archive',
        descriptionPt:
          'Estudo de API com autenticacao, banco de dados, documentacao e organizacao de endpoints para produto web.',
        descriptionEn:
          'API study with authentication, database, documentation, and endpoint organization for a web product.',
        stack: ['NestJS', 'Prisma', 'PostgreSQL', 'JWT'],
        repositoryUrl: '',
        liveUrl: '',
        featured: true,
        frameCode: 'VF-004',
        posterImage: '/projects/api-archive/poster.svg',
        previewImages: [
          '/projects/api-archive/preview-01.svg',
          '/projects/api-archive/preview-02.svg',
          '/projects/api-archive/preview-03.svg',
          '/projects/api-archive/preview-04.svg',
        ],
        published: true,
        order: 4,
      },
    ],
  });

  await prisma.roadmapItem.createMany({
    data: [
      {
        id: 'roadmap-portfolio-gerenciavel',
        startDate: '2026-01',
        endDate: '2026-06',
        titlePt: 'Portfolio gerenciavel',
        titleEn: 'Manageable portfolio',
        type: 'projeto',
        summaryPt:
          'Construcao deste portfolio como produto proprio, com frontend em Next.js, backend em NestJS e ambientacao 3D vintage.',
        summaryEn:
          'Building this portfolio as a product, with a Next.js frontend, NestJS backend, and vintage 3D staging.',
        detailsPt:
          'O projeto concentra UI editorial, Three.js imperativo, painel administrativo, API e uma base de conteudo preparada para evoluir sem depender de alteracoes manuais no codigo.',
        detailsEn:
          'The project combines editorial UI, imperative Three.js, an admin panel, API, and a content base prepared to evolve without manual code edits.',
        technologies: ['Next.js', 'NestJS', 'TypeScript', 'Three.js', 'Prisma'],
        order: 1,
      },
      {
        id: 'roadmap-fullstack',
        startDate: '2025-01',
        endDate: '2026-01',
        titlePt: 'Consolidacao full stack',
        titleEn: 'Full stack consolidation',
        type: 'carreira',
        summaryPt:
          'Aprofundamento em aplicacoes web completas, conectando frontend, backend, banco de dados e deploy.',
        summaryEn:
          'Deepening complete web applications by connecting frontend, backend, database, and deployment concerns.',
        detailsPt:
          'Foco em React, TypeScript, Node.js, APIs REST, modelagem de dados e organizacao de projetos em monorepo.',
        detailsEn:
          'Focus on React, TypeScript, Node.js, REST APIs, data modeling, and monorepo project organization.',
        technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        order: 2,
      },
      {
        id: 'roadmap-base-web',
        startDate: '2024-01',
        endDate: '2025-01',
        titlePt: 'Base em desenvolvimento web',
        titleEn: 'Web development foundation',
        type: 'formacao',
        summaryPt:
          'Estudo e pratica dos fundamentos de interfaces, logica de aplicacao, versionamento e consumo de APIs.',
        summaryEn:
          'Study and practice of interface fundamentals, application logic, version control, and API consumption.',
        detailsPt:
          'Periodo dedicado a transformar fundamentos em projetos aplicaveis, com atencao a responsividade, estrutura de componentes e manutencao do codigo.',
        detailsEn:
          'A period dedicated to turning fundamentals into applicable projects, with attention to responsiveness, component structure, and code maintenance.',
        technologies: ['HTML', 'CSS', 'JavaScript', 'Git'],
        order: 3,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
