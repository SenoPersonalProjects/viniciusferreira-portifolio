import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import type { Locale, PortfolioContent } from './portfolio.types';

function resolveLocale(locale?: string): Locale {
  return locale === 'en' ? 'en' : 'pt-BR';
}

function isEmailUrl(url: string) {
  return url.startsWith('mailto:') ? url.replace('mailto:', '') : '';
}

@Injectable()
export class PortfolioService {
  constructor(private readonly prisma: PrismaService) {}

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
