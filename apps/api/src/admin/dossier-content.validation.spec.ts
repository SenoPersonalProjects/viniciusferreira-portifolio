import { BadRequestException } from '@nestjs/common';

import { normalizeDossierContentInput } from './dossier-content.validation';

const validBody = {
  classification: ' CLASSIFIED ',
  fileId: ' VF-026 ',
  location: ' BRAZIL ',
  mainPhotoUrl: ' /profile/detective/individual-1.jpeg ',
  note: ' Note with accents: ação. ',
  polaroidPhotoUrl: ' https://example.com/polaroid.jpg ',
  project: ' MANAGEABLE PORTFOLIO ',
  redactions: [{ h: 4, w: 3, x: 1, y: 2 }],
  role: ' FULL STACK DEVELOPER ',
  stack: [' Next.js ', '', 'NestJS', 'Next.js'],
  stamp: ' CLASSIFIED ',
  status: ' ACTIVE ',
  subject: ' VINICIUS FERREIRA ',
};

describe('normalizeDossierContentInput', () => {
  it('accepts pt and en locales', () => {
    expect(normalizeDossierContentInput('pt', validBody).locale).toBe('pt');
    expect(normalizeDossierContentInput('en', validBody).locale).toBe('en');
  });

  it('rejects an invalid locale', () => {
    expect(() => normalizeDossierContentInput('pt-BR', validBody)).toThrow(
      BadRequestException,
    );
  });

  it('normalizes text, stack and preserves note/redactions', () => {
    const result = normalizeDossierContentInput('en', validBody);

    expect(result.classification).toBe('CLASSIFIED');
    expect(result.note).toBe('Note with accents: ação.');
    expect(result.stack).toEqual(['Next.js', 'NestJS']);
    expect(result.redactions).toEqual([{ h: 4, w: 3, x: 1, y: 2 }]);
  });

  it('accepts internal paths and https image URLs', () => {
    const result = normalizeDossierContentInput('pt', validBody);

    expect(result.mainPhotoUrl).toBe('/profile/detective/individual-1.jpeg');
    expect(result.polaroidPhotoUrl).toBe('https://example.com/polaroid.jpg');
  });

  it('rejects invalid image paths', () => {
    expect(() =>
      normalizeDossierContentInput('pt', {
        ...validBody,
        mainPhotoUrl: 'profile/detective/individual-1.jpeg',
      }),
    ).toThrow(BadRequestException);
  });

  it('rejects non-json redactions', () => {
    expect(() =>
      normalizeDossierContentInput('pt', {
        ...validBody,
        redactions: { invalid: BigInt(1) },
      }),
    ).toThrow(BadRequestException);
  });
});
