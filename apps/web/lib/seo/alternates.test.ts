import { describe, expect, it } from 'vitest';
import { buildAlternatesFor, resolveDetailAlternates } from './alternates';

const BASE = 'https://example.com';

describe('buildAlternatesFor', () => {
  it('uses a self-referencing canonical for es-CO', () => {
    const result = buildAlternatesFor(BASE, 'es-CO', '/nosotros');
    expect(result.canonical).toBe('https://example.com/es-CO/nosotros');
  });

  it('uses a self-referencing canonical for en-US', () => {
    const result = buildAlternatesFor(BASE, 'en-US', '/nosotros');
    expect(result.canonical).toBe('https://example.com/en-US/nosotros');
  });

  it('lists both locales and x-default pointing to es-CO', () => {
    const result = buildAlternatesFor(BASE, 'en-US', '/nosotros');
    expect(result.languages).toEqual({
      'es-CO': 'https://example.com/es-CO/nosotros',
      'en-US': 'https://example.com/en-US/nosotros',
      'x-default': 'https://example.com/es-CO/nosotros',
    });
  });

  it('handles the home page (empty path) and paths without a leading slash', () => {
    expect(buildAlternatesFor(BASE, 'en-US', '').canonical).toBe('https://example.com/en-US');
    expect(buildAlternatesFor(BASE, 'es-CO', 'blog').canonical).toBe(
      'https://example.com/es-CO/blog',
    );
  });
});

describe('resolveDetailAlternates', () => {
  const path = '/propiedades/casa-1';

  it('is self-canonical and lists both locales when both translations exist', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'en-US',
      path,
      availableLocales: ['es-CO', 'en-US'],
    });
    expect(result.canonical).toBe('https://example.com/en-US/propiedades/casa-1');
    expect(result.languages).toEqual({
      'es-CO': 'https://example.com/es-CO/propiedades/casa-1',
      'en-US': 'https://example.com/en-US/propiedades/casa-1',
      'x-default': 'https://example.com/es-CO/propiedades/casa-1',
    });
  });

  it('canonicalises to es-CO and lists only es-CO when the requested locale has no translation', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'en-US',
      path,
      availableLocales: ['es-CO'],
    });
    expect(result.canonical).toBe('https://example.com/es-CO/propiedades/casa-1');
    expect(result.languages).toEqual({
      'es-CO': 'https://example.com/es-CO/propiedades/casa-1',
      'x-default': 'https://example.com/es-CO/propiedades/casa-1',
    });
  });

  it('stays self-canonical for es-CO when only es-CO exists', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'es-CO',
      path,
      availableLocales: ['es-CO'],
    });
    expect(result.canonical).toBe('https://example.com/es-CO/propiedades/casa-1');
    expect(Object.keys(result.languages)).toEqual(['es-CO', 'x-default']);
  });

  it('keeps an en-US-only post self-canonical on en-US and points x-default at the only existing locale', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'en-US',
      path,
      availableLocales: ['en-US'],
    });
    expect(result.canonical).toBe('https://example.com/en-US/propiedades/casa-1');
    expect(result.languages).toEqual({
      'en-US': 'https://example.com/en-US/propiedades/casa-1',
      'x-default': 'https://example.com/en-US/propiedades/casa-1',
    });
  });

  it('falls back to the es-CO URL when no translation exists at all', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'en-US',
      path,
      availableLocales: [],
    });
    expect(result.canonical).toBe('https://example.com/es-CO/propiedades/casa-1');
    expect(result.languages).toEqual({
      'x-default': 'https://example.com/es-CO/propiedades/casa-1',
    });
  });

  it('lets an explicit canonical override win over the computed canonical', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'en-US',
      path,
      availableLocales: ['es-CO', 'en-US'],
      canonicalOverride: 'https://other.example.com/listing',
    });
    expect(result.canonical).toBe('https://other.example.com/listing');
    expect(result.languages['en-US']).toBe('https://example.com/en-US/propiedades/casa-1');
  });

  it('ignores a blank canonical override', () => {
    const result = resolveDetailAlternates({
      baseUrl: BASE,
      locale: 'en-US',
      path,
      availableLocales: ['es-CO', 'en-US'],
      canonicalOverride: '   ',
    });
    expect(result.canonical).toBe('https://example.com/en-US/propiedades/casa-1');
  });
});
