import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  const prisma = {
    profile: {
      findFirst: jest.fn(),
    },
    contactLink: {
      findMany: jest.fn(),
    },
    technology: {
      findMany: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
    },
    roadmapItem: {
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.profile.findFirst.mockResolvedValue({
      name: 'Vinicius Ferreira',
      rolePt: 'Desenvolvedor Full Stack',
      roleEn: 'Full Stack Developer',
      headlinePt: 'Headline PT',
      headlineEn: 'Headline EN',
      summaryPt: 'Resumo PT',
      summaryEn: 'Summary EN',
      locationPt: 'Brasil',
      locationEn: 'Brazil',
    });
    prisma.contactLink.findMany.mockResolvedValue([
      {
        id: 'github',
        label: 'GitHub',
        type: 'github',
        url: 'https://github.com/SenoPersonalProjects',
        order: 1,
        visible: true,
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        url: 'mailto:vinicius@example.com',
        order: 2,
        visible: true,
      },
    ]);
    prisma.technology.findMany.mockResolvedValue([
      {
        id: 'frontend',
        categoryPt: 'Frontend',
        categoryEn: 'Frontend',
        items: ['Next.js'],
        order: 1,
      },
    ]);
    prisma.project.findMany.mockResolvedValue([
      {
        titlePt: 'Portfolio',
        titleEn: 'Portfolio',
        slug: 'portfolio',
        descriptionPt: 'Descricao',
        descriptionEn: 'Description',
        stack: ['Next.js'],
        repositoryUrl: null,
        liveUrl: null,
        featured: true,
        frameCode: 'VF-001',
        posterImage: '/poster.svg',
        previewImages: ['/preview.svg'],
        published: true,
        order: 1,
      },
    ]);
    prisma.roadmapItem.findMany.mockResolvedValue([
      {
        id: 'roadmap',
        startDate: '2026-01',
        endDate: '2026-06',
        titlePt: 'Titulo',
        titleEn: 'Title',
        type: 'projeto',
        summaryPt: 'Resumo',
        summaryEn: 'Summary',
        detailsPt: 'Detalhes',
        detailsEn: 'Details',
        technologies: ['TypeScript'],
        order: 1,
        published: true,
      },
    ]);
  });

  it('returns localized public content in Portuguese', async () => {
    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicPortfolio('pt-BR')).resolves.toMatchObject({
      profile: {
        role: 'Desenvolvedor Full Stack',
        headline: 'Headline PT',
        socialLinks: {
          email: 'vinicius@example.com',
        },
      },
      projects: [
        {
          description: 'Descricao',
          repositoryUrl: '',
        },
      ],
      roadmap: [
        {
          title: 'Titulo',
          type: 'projeto',
        },
      ],
    });
  });

  it('returns localized public content in English', async () => {
    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicPortfolio('en')).resolves.toMatchObject({
      profile: {
        role: 'Full Stack Developer',
        headline: 'Headline EN',
      },
      projects: [
        {
          description: 'Description',
        },
      ],
      roadmap: [
        {
          title: 'Title',
        },
      ],
    });
  });
});
