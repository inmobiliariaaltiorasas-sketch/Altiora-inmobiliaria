import { describe, expect, it } from 'vitest';
import { buildSitemapEntries } from './sitemap-entries';

const BASE = 'https://example.com';

const baseInput = {
  baseUrl: BASE,
  staticPaths: ['', '/blog'],
  cities: [{ slug: 'cartago' }],
  properties: [] as { slug: string; updatedAt: string; locales: string[] }[],
  posts: [] as { slug: string; updatedAt: string; locales: string[] }[],
};

function find(entries: ReturnType<typeof buildSitemapEntries>, url: string) {
  return entries.find((entry) => entry.url === url);
}

describe('buildSitemapEntries', () => {
  it('emits both locales with alternates for static paths and cities', () => {
    const entries = buildSitemapEntries(baseInput);
    const blogEs = find(entries, 'https://example.com/es-CO/blog');
    const blogEn = find(entries, 'https://example.com/en-US/blog');
    expect(blogEs).toBeDefined();
    expect(blogEn).toBeDefined();
    const expected = {
      'es-CO': 'https://example.com/es-CO/blog',
      'en-US': 'https://example.com/en-US/blog',
      'x-default': 'https://example.com/es-CO/blog',
    };
    expect(blogEs?.alternates?.languages).toEqual(expected);
    expect(blogEn?.alternates?.languages).toEqual(expected);
    expect(find(entries, 'https://example.com/en-US/ciudades/cartago')).toBeDefined();
    expect(find(entries, 'https://example.com/es-CO')).toBeDefined();
  });

  it('lists a property only in the locales that have a translation', () => {
    const entries = buildSitemapEntries({
      ...baseInput,
      properties: [{ slug: 'casa-1', updatedAt: '2026-01-01T00:00:00.000Z', locales: ['es-CO'] }],
    });
    expect(find(entries, 'https://example.com/es-CO/propiedades/casa-1')).toBeDefined();
    expect(find(entries, 'https://example.com/en-US/propiedades/casa-1')).toBeUndefined();
  });

  it('falls back to the default locale when the API does not send locales yet', () => {
    const legacyEntry = { slug: 'casa-legacy', updatedAt: '2026-01-01T00:00:00.000Z' };
    const entries = buildSitemapEntries({
      ...baseInput,
      properties: [legacyEntry as (typeof baseInput.properties)[number]],
    });
    expect(find(entries, 'https://example.com/es-CO/propiedades/casa-legacy')).toBeDefined();
    expect(find(entries, 'https://example.com/en-US/propiedades/casa-legacy')).toBeUndefined();
  });

  it('emits alternates for a property translated into both locales and keeps lastModified', () => {
    const entries = buildSitemapEntries({
      ...baseInput,
      properties: [
        { slug: 'casa-2', updatedAt: '2026-02-03T00:00:00.000Z', locales: ['es-CO', 'en-US'] },
      ],
    });
    const en = find(entries, 'https://example.com/en-US/propiedades/casa-2');
    expect(en?.lastModified).toBe('2026-02-03T00:00:00.000Z');
    expect(en?.changeFrequency).toBe('daily');
    expect(en?.alternates?.languages).toEqual({
      'es-CO': 'https://example.com/es-CO/propiedades/casa-2',
      'en-US': 'https://example.com/en-US/propiedades/casa-2',
      'x-default': 'https://example.com/es-CO/propiedades/casa-2',
    });
  });

  it('lists only the translated locale in alternates for a partially translated post', () => {
    const entries = buildSitemapEntries({
      ...baseInput,
      posts: [{ slug: 'guia', updatedAt: '2026-03-01T00:00:00.000Z', locales: ['en-US'] }],
    });
    expect(find(entries, 'https://example.com/es-CO/blog/guia')).toBeUndefined();
    const en = find(entries, 'https://example.com/en-US/blog/guia');
    expect(en?.changeFrequency).toBe('monthly');
    expect(en?.alternates?.languages).toEqual({
      'en-US': 'https://example.com/en-US/blog/guia',
      'x-default': 'https://example.com/en-US/blog/guia',
    });
  });

  it('skips entries with no known locale and ignores unknown locale codes', () => {
    const entries = buildSitemapEntries({
      ...baseInput,
      properties: [
        { slug: 'sin-idioma', updatedAt: '2026-01-01T00:00:00.000Z', locales: [] },
        { slug: 'raro', updatedAt: '2026-01-01T00:00:00.000Z', locales: ['fr-FR', 'es-CO'] },
      ],
    });
    expect(entries.some((entry) => entry.url.includes('sin-idioma'))).toBe(false);
    expect(entries.some((entry) => entry.url.includes('fr-FR'))).toBe(false);
    expect(find(entries, 'https://example.com/es-CO/propiedades/raro')).toBeDefined();
  });

  it('never emits a localhost URL when given a production base URL', () => {
    const entries = buildSitemapEntries({
      ...baseInput,
      properties: [{ slug: 'a', updatedAt: '2026-01-01T00:00:00.000Z', locales: ['es-CO'] }],
    });
    expect(entries.every((entry) => !entry.url.includes('localhost'))).toBe(true);
  });
});
