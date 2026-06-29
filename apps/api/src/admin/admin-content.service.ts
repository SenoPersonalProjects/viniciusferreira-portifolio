import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { normalizeDossierContentInput } from './dossier-content.validation';

function normalizeSiteCopyValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  return JSON.stringify(value);
}

@Injectable()
export class AdminContentService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    const [
      profile,
      contactLinks,
      technologies,
      projects,
      roadmap,
      siteCopy,
      dossierContent,
    ] = await Promise.all([
      this.prisma.profile.findFirst({ orderBy: { updatedAt: 'desc' } }),
      this.prisma.contactLink.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.technology.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.project.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.roadmapItem.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.siteCopy.findMany({
        orderBy: [{ key: 'asc' }, { locale: 'asc' }],
      }),
      this.prisma.dossierContent.findMany({ orderBy: { locale: 'asc' } }),
    ]);

    return {
      profile,
      contactLinks,
      technologies,
      projects,
      roadmap,
      siteCopy,
      dossierContent,
    };
  }

  async getDossierContent() {
    const items = await this.prisma.dossierContent.findMany({
      orderBy: { locale: 'asc' },
    });

    return { items };
  }

  upsertDossierContent(locale: string, body: Record<string, unknown>) {
    const data = normalizeDossierContentInput(locale, body);

    return this.prisma.dossierContent.upsert({
      where: { locale: data.locale },
      update: data as never,
      create: data as never,
    });
  }

  async updateProfile(body: Record<string, unknown>) {
    const profile = await this.prisma.profile.findFirst();

    if (!profile) {
      return this.prisma.profile.create({
        data: body as never,
      });
    }

    return this.prisma.profile.update({
      where: { id: profile.id },
      data: body as never,
    });
  }

  createContactLink(body: Record<string, unknown>) {
    return this.prisma.contactLink.create({ data: body as never });
  }

  updateContactLink(id: string, body: Record<string, unknown>) {
    return this.prisma.contactLink.update({
      where: { id },
      data: body as never,
    });
  }

  async deleteContactLink(id: string) {
    await this.prisma.contactLink.delete({ where: { id } });
    return { deleted: true };
  }

  createTechnology(body: Record<string, unknown>) {
    return this.prisma.technology.create({ data: body as never });
  }

  updateTechnology(id: string, body: Record<string, unknown>) {
    return this.prisma.technology.update({
      where: { id },
      data: body as never,
    });
  }

  async deleteTechnology(id: string) {
    await this.prisma.technology.delete({ where: { id } });
    return { deleted: true };
  }

  createProject(body: Record<string, unknown>) {
    return this.prisma.project.create({ data: body as never });
  }

  updateProject(id: string, body: Record<string, unknown>) {
    return this.prisma.project.update({ where: { id }, data: body as never });
  }

  async deleteProject(id: string) {
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }

  createRoadmapItem(body: Record<string, unknown>) {
    return this.prisma.roadmapItem.create({ data: body as never });
  }

  updateRoadmapItem(id: string, body: Record<string, unknown>) {
    return this.prisma.roadmapItem.update({
      where: { id },
      data: body as never,
    });
  }

  async deleteRoadmapItem(id: string) {
    await this.prisma.roadmapItem.delete({ where: { id } });
    return { deleted: true };
  }

  async upsertSiteCopy(body: Record<string, unknown>) {
    const key = typeof body.key === 'string' ? body.key : '';
    const locale = typeof body.locale === 'string' ? body.locale : '';

    if (!key || !locale) {
      throw new NotFoundException('Chave e locale sao obrigatorios');
    }

    return this.prisma.siteCopy.upsert({
      where: {
        key_locale: {
          key,
          locale,
        },
      },
      update: {
        value: normalizeSiteCopyValue(body.value),
      },
      create: {
        key,
        locale,
        value: normalizeSiteCopyValue(body.value),
      },
    });
  }

  updateSiteCopy(id: string, body: Record<string, unknown>) {
    return this.prisma.siteCopy.update({
      where: { id },
      data: body as never,
    });
  }

  async deleteSiteCopy(id: string) {
    await this.prisma.siteCopy.delete({ where: { id } });
    return { deleted: true };
  }
}
