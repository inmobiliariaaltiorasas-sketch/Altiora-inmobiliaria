import { describe, expect, it } from 'vitest';
import { buildBreadcrumbList } from './breadcrumbs';

describe('buildBreadcrumbList', () => {
  it('builds ordered ListItems with 1-based positions, names and URLs', () => {
    const result = buildBreadcrumbList([
      { name: 'Inicio', url: 'https://example.com/es-CO' },
      { name: 'Propiedades', url: 'https://example.com/es-CO/propiedades' },
      { name: 'Casa 1', url: 'https://example.com/es-CO/propiedades/casa-1' },
    ]);
    expect(result).toEqual({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://example.com/es-CO' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Propiedades',
          item: 'https://example.com/es-CO/propiedades',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Casa 1',
          item: 'https://example.com/es-CO/propiedades/casa-1',
        },
      ],
    });
  });

  it('supports a single-level trail', () => {
    const result = buildBreadcrumbList([{ name: 'Blog', url: 'https://example.com/en-US/blog' }]);
    expect(result.itemListElement).toHaveLength(1);
    expect(result.itemListElement[0]?.position).toBe(1);
  });

  it('returns an empty list for no items', () => {
    expect(buildBreadcrumbList([]).itemListElement).toEqual([]);
  });
});
