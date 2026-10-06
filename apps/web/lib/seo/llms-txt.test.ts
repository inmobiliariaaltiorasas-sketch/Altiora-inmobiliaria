import { describe, expect, it } from 'vitest';
import type { CategoryEntry } from './categories';
import { buildLlmsTxt } from './llms-txt';
import { ORGANIZATION_INFO } from './organization';

const BASE = 'https://example.com';
const cartago = { slug: 'cartago-valle-del-cauca', name: 'Cartago', department: 'Valle del Cauca' };

const categories: CategoryEntry[] = [
  {
    city: cartago,
    category: {
      slug: 'casas-en-venta',
      typeSlug: 'casa',
      typeName: 'Casa',
      operationType: 'SALE',
      count: 3,
      priceRanges: [],
    },
  },
  {
    city: cartago,
    category: {
      slug: 'lotes-en-arriendo',
      typeSlug: 'lote',
      typeName: 'Lote',
      operationType: 'RENT',
      count: 1,
      priceRanges: [],
    },
  },
];

describe('buildLlmsTxt', () => {
  const text = buildLlmsTxt({ baseUrl: BASE, cities: [cartago], categories });

  it('starts with the brand as H1 followed by a blockquote summary', () => {
    const lines = text.split('\n');
    expect(lines[0]).toBe('# ALTiora Inmobiliaria');
    expect(lines[1]).toBe('');
    expect(lines[2]).toBe(`> ${ORGANIZATION_INFO.description}`);
  });

  it('states the business details that exist in the organisation data', () => {
    expect(text).toContain(ORGANIZATION_INFO.legalName);
    expect(text).toContain(ORGANIZATION_INFO.streetAddress);
    expect(text).toContain(ORGANIZATION_INFO.addressLocality);
    expect(text).toContain(ORGANIZATION_INFO.telephone);
    expect(text).toContain(ORGANIZATION_INFO.email);
  });

  it('links the main public pages in the Spanish locale', () => {
    expect(text).toContain('## Páginas principales');
    for (const path of ['', '/propiedades', '/ciudades', '/blog', '/nosotros', '/contacto']) {
      expect(text).toContain(`](${BASE}/es-CO${path})`);
    }
  });

  it('links each city', () => {
    expect(text).toContain(
      '- [Cartago, Valle del Cauca](https://example.com/es-CO/ciudades/cartago-valle-del-cauca)',
    );
  });

  it('links each existing category with its count, singular and plural', () => {
    expect(text).toContain(
      '- [Casas en venta en Cartago, Valle del Cauca](https://example.com/es-CO/ciudades/cartago-valle-del-cauca/casas-en-venta): 3 propiedades',
    );
    expect(text).toContain(
      '- [Lotes en arriendo en Cartago, Valle del Cauca](https://example.com/es-CO/ciudades/cartago-valle-del-cauca/lotes-en-arriendo): 1 propiedad',
    );
  });

  it('omits the categories section when there are none', () => {
    const without = buildLlmsTxt({ baseUrl: BASE, cities: [cartago], categories: [] });
    expect(without).not.toContain('## Categorías');
    expect(without).toContain('## Ciudades');
  });

  it('uses only the given base URL and never a localhost origin', () => {
    expect(text).not.toContain('localhost');
  });

  it('ends with a single trailing newline', () => {
    expect(text.endsWith('\n')).toBe(true);
    expect(text.endsWith('\n\n')).toBe(false);
  });
});
