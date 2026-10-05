import { toSitemapEntry } from './sitemap-entry';

describe('toSitemapEntry', () => {
  const updatedAt = new Date('2026-04-05T10:20:30.000Z');

  it('maps slug, ISO updatedAt and the locales that have a translation', () => {
    const entry = toSitemapEntry({
      slug: 'casa-en-cartago',
      updatedAt,
      translations: [{ locale: 'es-CO' }, { locale: 'en-US' }],
    });
    expect(entry).toEqual({
      slug: 'casa-en-cartago',
      updatedAt: '2026-04-05T10:20:30.000Z',
      locales: ['es-CO', 'en-US'],
    });
  });

  it('returns only es-CO when there is no English translation row', () => {
    const entry = toSitemapEntry({
      slug: 'lote',
      updatedAt,
      translations: [{ locale: 'es-CO' }],
    });
    expect(entry.locales).toEqual(['es-CO']);
  });

  it('drops locales the platform does not support and removes duplicates', () => {
    const entry = toSitemapEntry({
      slug: 'raro',
      updatedAt,
      translations: [{ locale: 'fr-FR' }, { locale: 'en-US' }, { locale: 'en-US' }],
    });
    expect(entry.locales).toEqual(['en-US']);
  });

  it('returns an empty locales list when there are no translations', () => {
    const entry = toSitemapEntry({ slug: 'vacio', updatedAt, translations: [] });
    expect(entry.locales).toEqual([]);
  });
});
