import { BadRequestException } from '@nestjs/common';

import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  const prisma = {
    dossierContent: {
      findUnique: jest.fn(),
    },
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
    siteCopy: {
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
    prisma.siteCopy.findMany.mockResolvedValue([]);
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

  it('returns the public dossier from the database without admin fields', async () => {
    prisma.dossierContent.findUnique.mockResolvedValue({
      classification: 'CLASSIFIED',
      createdAt: new Date('2026-06-29T00:00:00.000Z'),
      fileId: 'VF-026',
      id: 'dossier-en',
      locale: 'en',
      location: 'BRAZIL',
      mainPhotoUrl: '/profile/detective/individual-1.jpeg',
      note: 'Public note',
      polaroidPhotoUrl: '/profile/detective/individual-2.jpeg',
      project: 'MANAGEABLE PORTFOLIO',
      redactions: [{ h: 4, w: 3, x: 1, y: 2 }],
      role: 'FULL STACK DEVELOPER',
      stack: ['NEXT.JS', 'NESTJS'],
      stamp: 'CLASSIFIED',
      status: 'ACTIVE',
      subject: 'VINICIUS FERREIRA',
      updatedAt: new Date('2026-06-29T00:00:00.000Z'),
    });

    const service = new PortfolioService(prisma as never);
    const result = await service.getPublicDossier('en');

    expect(prisma.dossierContent.findUnique).toHaveBeenCalledWith({
      where: { locale: 'en' },
    });
    expect(result).toEqual({
      content: {
        classification: 'CLASSIFIED',
        fileId: 'VF-026',
        location: 'BRAZIL',
        mainPhotoUrl: '/profile/detective/individual-1.jpeg',
        note: 'Public note',
        polaroidPhotoUrl: '/profile/detective/individual-2.jpeg',
        project: 'MANAGEABLE PORTFOLIO',
        redactions: [{ h: 4, w: 3, x: 1, y: 2 }],
        role: 'FULL STACK DEVELOPER',
        stack: ['NEXT.JS', 'NESTJS'],
        stamp: 'CLASSIFIED',
        status: 'ACTIVE',
        subject: 'VINICIUS FERREIRA',
      },
      source: 'database',
    });
    expect(JSON.stringify(result)).not.toContain('dossier-en');
    expect(JSON.stringify(result)).not.toContain('createdAt');
  });

  it('uses pt as the default public dossier locale', async () => {
    prisma.dossierContent.findUnique.mockResolvedValue(null);

    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicDossier()).resolves.toEqual({
      content: null,
      source: 'empty',
    });
    expect(prisma.dossierContent.findUnique).toHaveBeenCalledWith({
      where: { locale: 'pt' },
    });
  });

  it('rejects invalid public dossier locales', async () => {
    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicDossier('pt-BR')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('omits incompatible public dossier redactions', async () => {
    prisma.dossierContent.findUnique.mockResolvedValue({
      classification: 'CONFIDENCIAL',
      fileId: 'VF-026',
      location: 'BRASIL',
      mainPhotoUrl: '/profile/detective/individual-1.jpeg',
      note: 'Nota publica',
      polaroidPhotoUrl: '/profile/detective/individual-2.jpeg',
      project: 'PORTFOLIO GERENCIAVEL',
      redactions: { invalid: true },
      role: 'DESENVOLVEDOR FULL STACK',
      stack: ['NEXT.JS'],
      stamp: 'CONFIDENCIAL',
      status: 'ATIVO',
      subject: 'VINICIUS FERREIRA',
    });

    const service = new PortfolioService(prisma as never);
    const result = await service.getPublicDossier('pt');

    expect(result).toMatchObject({
      content: {
        note: 'Nota publica',
      },
      source: 'database',
    });

    if (result.content) {
      expect(result.content.redactions).toBeUndefined();
    }
  });

  it('returns public site copy for the requested locale without admin fields', async () => {
    prisma.siteCopy.findMany.mockResolvedValue([
      {
        createdAt: new Date('2026-06-29T00:00:00.000Z'),
        id: 'site-copy-1',
        key: 'about.titleStart',
        locale: 'pt-BR',
        updatedAt: new Date('2026-06-29T00:00:00.000Z'),
        value: 'Código com acento e <strong>texto</strong>',
      },
    ]);

    const service = new PortfolioService(prisma as never);
    const result = await service.getPublicSiteCopy('pt-BR');

    expect(prisma.siteCopy.findMany).toHaveBeenCalledWith({
      orderBy: { key: 'asc' },
      select: {
        key: true,
        locale: true,
        value: true,
      },
      where: { locale: 'pt-BR' },
    });
    expect(result).toEqual({
      items: [
        {
          key: 'about.titleStart',
          locale: 'pt-BR',
          value: 'Código com acento e <strong>texto</strong>',
        },
      ],
      source: 'database',
    });
    expect(JSON.stringify(result)).not.toContain('site-copy-1');
    expect(JSON.stringify(result)).not.toContain('createdAt');
  });

  it('uses pt-BR as the default public site copy locale', async () => {
    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicSiteCopy()).resolves.toEqual({
      items: [],
      source: 'empty',
    });
    expect(prisma.siteCopy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { locale: 'pt-BR' },
      }),
    );
  });

  it('returns public site copy in English', async () => {
    prisma.siteCopy.findMany.mockResolvedValue([
      {
        key: 'projectsSection.title',
        locale: 'en',
        value: 'Featured projects',
      },
    ]);

    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicSiteCopy('en')).resolves.toEqual({
      items: [
        {
          key: 'projectsSection.title',
          locale: 'en',
          value: 'Featured projects',
        },
      ],
      source: 'database',
    });
  });

  it('rejects invalid public site copy locales', async () => {
    const service = new PortfolioService(prisma as never);

    await expect(service.getPublicSiteCopy('pt')).rejects.toThrow(
      BadRequestException,
    );
  });
});
