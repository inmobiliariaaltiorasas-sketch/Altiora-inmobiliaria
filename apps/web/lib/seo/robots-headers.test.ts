import { describe, expect, it } from 'vitest';
import { NOINDEX_HEADER_RULES } from './robots-headers';

describe('NOINDEX_HEADER_RULES', () => {
  it('sends X-Robots-Tag noindex, nofollow for /admin and /api', () => {
    const sources = NOINDEX_HEADER_RULES.map((rule) => rule.source);
    expect(sources).toEqual(['/admin/:path*', '/api/:path*']);
    for (const rule of NOINDEX_HEADER_RULES) {
      expect(rule.headers).toEqual([{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]);
    }
  });

  it('does not cover public pages', () => {
    for (const rule of NOINDEX_HEADER_RULES) {
      expect(rule.source).not.toMatch(/^\/(es-CO|en-US)/);
      expect(rule.source).not.toBe('/:path*');
    }
  });
});
