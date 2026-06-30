import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import type { Locale, PortfolioContent } from './portfolio.types';

type PublicDossierLocale = 'pt' | 'en';
type PublicSiteCopyLocale = Locale;

type PublicDossierRedaction = {
  h: number;
  w: number;
  x: number;
  y: number;
};

type PublicDossierContent = {
  classification: string;
  fileId: string;
  location: string;
  mainPhotoUrl: string;
  note: string;
  polaroidPhotoUrl: string;
  project: string;
  redactions?: PublicDossierRedaction[];
  role: string;
  stack: string[];
  stamp: string;
  status: string;
  subject: string;
};

type PublicDossierResponse =
  | {
      content: PublicDossierContent;
      source: 'database';
    }
  | {
      content: null;
      source: 'empty';
    };

type PublicSiteCopyResponse = {
  items: Array<{
    key: string;
    locale: PublicSiteCopyLocale;
    value: string;
  }>;
  source: 'database' | 'empty';
};

function resolveLocale(locale?: string): Locale {
  return locale === 'en' ? 'en' : 'pt-BR';
}

function resolveDossierLocale(locale?: string): PublicDossierLocale {
  if (!locale) {
    return 'pt';
  }

  const normalized = locale.trim();

  if (normalized === 'pt' || normalized === 'en') {
    return normalized;
  }

  throw new BadRequestException('Locale do dossie invalido');
}

function resolveSiteCopyLocale(locale?: string): PublicSiteCopyLocale {
  if (!locale) {
    return 'pt-BR';
  }

  const normalized = locale.trim();

  if (normalized === 'pt-BR' || normalized === 'en') {
    return normalized;
  }

  throw new BadRequestException('Locale de textos invalido');
}

function isEmailUrl(url: string) {
  return url.startsWith('mailto:') ? url.replace('mailto:', '') : '';
}

function isPublicDossierRedaction(
  value: unknown,
): value is PublicDossierRedaction {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const redaction = value as Record<string, unknown>;

  return ['h', 'w', 'x', 'y'].every(
    (key) =>
      typeof redaction[key] === 'number' && Number.isFinite(redaction[key]),
  );
}

function getPublicRedactions(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  if (!value.every(isPublicDossierRedaction)) {
    return undefined;
  }

  return value.map((redaction) => ({
    h: redaction.h,
    w: redaction.w,
    x: redaction.x,
    y: redaction.y,
  }));
}

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicDossier(localeQuery?: string): Promise<PublicDossierResponse> {
    const locale = resolveDossierLocale(localeQuery);
    const dossier = await this.prisma.dossierContent.findUnique({
      where: { locale },
    });

    if (!dossier) {
      return {
        content: null,
        source: 'empty',
      };
    }

    const redactions = getPublicRedactions(dossier.redactions);

    return {
      content: {
        classification: dossier.classification,
        fileId: dossier.fileId,
        location: dossier.location,
        mainPhotoUrl: dossier.mainPhotoUrl,
        note: dossier.note,
        polaroidPhotoUrl: dossier.polaroidPhotoUrl,
        project: dossier.project,
        ...(redactions ? { redactions } : {}),
        role: dossier.role,
        stack: dossier.stack,
        stamp: dossier.stamp,
        status: dossier.status,
        subject: dossier.subject,
      },
      source: 'database',
    };
  }

  async getPublicSiteCopy(
    localeQuery?: string,
  ): Promise<PublicSiteCopyResponse> {
    const locale = resolveSiteCopyLocale(localeQuery);
    const items = await this.prisma.siteCopy.findMany({
      orderBy: { key: 'asc' },
      select: {
        key: true,
        locale: true,
        value: true,
      },
      where: { locale },
    });

    return {
      items: items.map((item) => ({
        key: item.key,
        locale: item.locale as PublicSiteCopyLocale,
        value: item.value,
      })),
      source: items.length > 0 ? 'database' : 'empty',
    };
  }

  async getPublicPortfolio(localeQuery?: string): Promise<PortfolioContent> {
    const locale = resolveLocale(localeQuery);
    const [profile, contactLinks, technologies, projects, roadmap] =
      await Promise.all([
        this.prisma.profile.findFirst({ orderBy: { updatedAt: 'desc' } }),
        this.prisma.contactLink.findMany({ orderBy: { order: 'asc' } }),
        this.prisma.technology.findMany({
          where: { visible: true },
          orderBy: { order: 'asc' },
        }),
        this.prisma.project.findMany({ orderBy: { order: 'asc' } }),
        this.prisma.roadmapItem.findMany({ orderBy: { order: 'asc' } }),
      ]);

    const github =
      contactLinks.find((link) => link.type === 'github')?.url ?? '';
    const linkedin =
      contactLinks.find((link) => link.type === 'linkedin')?.url ?? '';
    const email = isEmailUrl(
      contactLinks.find((link) => link.type === 'email')?.url ?? '',
    );

    return {
      profile: {
        name: profile?.name ?? 'Vinicius Ferreira',
        role:
          locale === 'en' ? (profile?.roleEn ?? '') : (profile?.rolePt ?? ''),
        headline:
          locale === 'en'
            ? (profile?.headlineEn ?? '')
            : (profile?.headlinePt ?? ''),
        location:
          locale === 'en'
            ? (profile?.locationEn ?? 'Brazil')
            : (profile?.locationPt ?? 'Brasil'),
        summary:
          locale === 'en'
            ? (profile?.summaryEn ?? '')
            : (profile?.summaryPt ?? ''),
        socialLinks: {
          github,
          linkedin,
          email,
        },
      },
      contactLinks: contactLinks.map((link) => ({
        id: link.id,
        label: link.label,
        type: link.type as PortfolioContent['contactLinks'][number]['type'],
        url: link.url,
        order: link.order,
        visible: link.visible,
      })),
      technologies: technologies.map((technology) => ({
        id: technology.id,
        category:
          locale === 'en' ? technology.categoryEn : technology.categoryPt,
        items: technology.items,
        order: technology.order,
      })),
      projects: projects.map((project) => ({
        title: locale === 'en' ? project.titleEn : project.titlePt,
        slug: project.slug,
        description:
          locale === 'en' ? project.descriptionEn : project.descriptionPt,
        stack: project.stack,
        repositoryUrl: project.repositoryUrl ?? '',
        liveUrl: project.liveUrl ?? '',
        featured: project.featured,
        frameCode: project.frameCode ?? '',
        posterImage: project.posterImage,
        previewImages: project.previewImages,
        published: project.published,
        order: project.order,
      })),
      roadmap: roadmap.map((item) => ({
        id: item.id,
        startDate: item.startDate,
        endDate: item.endDate,
        title: locale === 'en' ? item.titleEn : item.titlePt,
        type: item.type as PortfolioContent['roadmap'][number]['type'],
        summary: locale === 'en' ? item.summaryEn : item.summaryPt,
        details: locale === 'en' ? item.detailsEn : item.detailsPt,
        technologies: item.technologies,
        order: item.order,
        published: item.published,
      })),
    };
  }
}
