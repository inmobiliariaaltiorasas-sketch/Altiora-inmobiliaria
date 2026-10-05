import { describe, expect, it } from 'vitest';
import { SHORT_LOCALE_REDIRECTS } from './locale-redirects';

describe('SHORT_LOCALE_REDIRECTS', () => {
  it('redirects /en and /en/* permanently to /en-US', () => {
    expect(SHORT_LOCALE_REDIRECTS).toContainEqual({
      source: '/en/:path*',
      destination: '/en-US/:path*',
      permanent: true,
    });
  });

  it('redirects /es and /es/* permanently to /es-CO', () => {
    expect(SHORT_LOCALE_REDIRECTS).toContainEqual({
      source: '/es/:path*',
      destination: '/es-CO/:path*',
      permanent: true,
    });
  });

  it('does not touch admin or API routes', () => {
    for (const rule of SHORT_LOCALE_REDIRECTS) {
      expect(rule.source.startsWith('/admin')).toBe(false);
      expect(rule.source.startsWith('/api')).toBe(false);
    }
  });
});
