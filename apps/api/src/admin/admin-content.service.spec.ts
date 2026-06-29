import { AdminContentService } from './admin-content.service';

const dossierRecord = {
  classification: 'CLASSIFIED',
  fileId: 'VF-026',
  id: 'dossier-en',
  locale: 'en',
  location: 'BRAZIL',
  mainPhotoUrl: '/profile/detective/individual-1.jpeg',
  note: 'Full stack developer focused on manageable web applications.',
  polaroidPhotoUrl: '/profile/detective/individual-2.jpeg',
  project: 'MANAGEABLE PORTFOLIO',
  redactions: null,
  role: 'FULL STACK DEVELOPER',
  stack: ['NEXT.JS', 'NESTJS', 'TYPESCRIPT'],
  stamp: 'CLASSIFIED',
  status: 'ACTIVE',
  subject: 'VINICIUS FERREIRA',
};

type DossierUpsertArgs = {
  create: Record<string, unknown>;
  update: Record<string, unknown>;
  where: { locale: string };
};

describe('AdminContentService dossier', () => {
  it('returns persisted dossier items ordered by locale', async () => {
    const findMany = jest.fn().mockResolvedValue([dossierRecord]);
    const service = new AdminContentService({
      dossierContent: { findMany },
    } as never);

    await expect(service.getDossierContent()).resolves.toEqual({
      items: [dossierRecord],
    });
    expect(findMany).toHaveBeenCalledWith({ orderBy: { locale: 'asc' } });
  });

  it('upserts a normalized dossier record by locale', async () => {
    const upsert = jest
      .fn<Promise<typeof dossierRecord>, [DossierUpsertArgs]>()
      .mockResolvedValue(dossierRecord);
    const service = new AdminContentService({
      dossierContent: { upsert },
    } as never);

    await expect(
      service.upsertDossierContent('en', {
        ...dossierRecord,
        classification: ' CLASSIFIED ',
        stack: ['NEXT.JS', '', 'NESTJS'],
      }),
    ).resolves.toEqual(dossierRecord);

    const upsertArgs = upsert.mock.calls[0]?.[0];

    expect(upsertArgs).toBeDefined();

    expect(upsertArgs?.where).toEqual({ locale: 'en' });
    expect(upsertArgs?.create).toMatchObject({
      classification: 'CLASSIFIED',
      locale: 'en',
      stack: ['NEXT.JS', 'NESTJS'],
    });
    expect(upsertArgs?.update).toMatchObject({
      classification: 'CLASSIFIED',
      locale: 'en',
      stack: ['NEXT.JS', 'NESTJS'],
    });
  });
});
