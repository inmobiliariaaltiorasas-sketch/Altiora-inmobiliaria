import { describe, expect, it } from 'vitest';
import { SHORT_LOCALE_REDIRECTS } from './locale-redirects';

describe('SHORT_LOCALE_REDIRECTS', () => {
  it('redirects the bare /en and /es to the locale root without path placeholders', () => {
    expect(SHORT_LOCALE_REDIRECTS).toContainEqual({
      source: '/en',
      destination: '/en-US',
      permanent: true,
    });
    expect(SHORT_LOCALE_REDIRECTS).toContainEqual({
      source: '/es',
      destination: '/es-CO',
      permanent: true,
    });
  });

  it('redirects /en/* and /es/* keeping the sub-path', () => {
    expect(SHORT_LOCALE_REDIRECTS).toContainEqual({
      source: '/en/:path+',
      destination: '/en-US/:path+',
      permanent: true,
    });
    expect(SHORT_LOCALE_REDIRECTS).toContainEqual({
      source: '/es/:path+',
      destination: '/es-CO/:path+',
      permanent: true,
    });
  });

  it('never uses an optional path parameter, which is emitted literally when it is empty', () => {
    for (const rule of SHORT_LOCALE_REDIRECTS) {
      expect(rule.source).not.toContain(':path*');
      expect(rule.destination).not.toContain(':path*');
    }
  });

  it('does not touch admin or API routes', () => {
    for (const rule of SHORT_LOCALE_REDIRECTS) {
      expect(rule.source.startsWith('/admin')).toBe(false);
      expect(rule.source.startsWith('/api')).toBe(false);
    }
  });
});
