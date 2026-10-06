import { describe, expect, it } from 'vitest';
import type { PropertyFacetDto } from '@altiora/shared-types';
import {
  MIN_CATEGORY_INVENTORY,
  buildCategorySlug,
  categoryLabel,
  categoryNoun,
  findCityCategory,
  parseCategorySlug,
  selectAllCategories,
  selectCityCategories,
} from './categories';

function facet(overrides: Partial<PropertyFacetDto> = {}): PropertyFacetDto {
  return {
    citySlug: 'cartago-valle-del-cauca',
    cityName: 'Cartago',
    propertyTypeSlug: 'casa',
    propertyTypeName: 'Casa',
    operationType: 'SALE',
    currency: 'COP',
    count: 2,
    minPrice: 300_000_000,
    maxPrice: 500_000_000,
    ...overrides,
  };
}

describe('buildCategorySlug', () => {
  it.each([
    ['casa', 'SALE', 'casas-en-venta'],
    ['apartamento', 'RENT', 'apartamentos-en-arriendo'],
    ['local-comercial', 'SALE', 'locales-comerciales-en-venta'],
    ['lote', 'SALE', 'lotes-en-venta'],
    ['finca', 'RENT', 'fincas-en-arriendo'],
  ] as const)('builds %s + %s as %s', (type, operation, expected) => {
    expect(buildCategorySlug(type, operation)).toBe(expected);
  });

  it('returns null for a property type without a plural', () => {
    expect(buildCategorySlug('bodega', 'SALE')).toBeNull();
  });
});

describe('parseCategorySlug', () => {
  it.each([
    ['casas-en-venta', 'casa', 'SALE'],
    ['apartamentos-en-arriendo', 'apartamento', 'RENT'],
    ['locales-comerciales-en-venta', 'local-comercial', 'SALE'],
    ['lotes-en-arriendo', 'lote', 'RENT'],
    ['fincas-en-venta', 'finca', 'SALE'],
  ] as const)('parses %s', (slug, typeSlug, operation) => {
    expect(parseCategorySlug(slug)).toEqual({ typeSlug, operation });
  });

  it.each([
    'casa-en-venta',
    'casas-en-alquiler',
    'bodegas-en-venta',
    'casas',
    'en-venta',
    '',
    'Casas-en-venta',
    'casas-en-venta/',
    'casas-en-venta-en-arriendo',
  ])('returns null for %j', (slug) => {
    expect(parseCategorySlug(slug)).toBeNull();
  });

  it('round-trips every buildable slug', () => {
    for (const type of ['casa', 'apartamento', 'lote', 'finca', 'local-comercial']) {
      for (const operation of ['SALE', 'RENT'] as const) {
        const slug = buildCategorySlug(type, operation) as string;
        expect(parseCategorySlug(slug)).toEqual({ typeSlug: type, operation });
      }
    }
  });
});

describe('categoryLabel', () => {
  it('names the category in each locale', () => {
    expect(categoryLabel('casa', 'SALE', 'es-CO')).toBe('Casas en venta');
    expect(categoryLabel('local-comercial', 'RENT', 'es-CO')).toBe(
      'Locales comerciales en arriendo',
    );
    expect(categoryLabel('casa', 'SALE', 'en-US')).toBe('Houses for sale');
    expect(categoryLabel('apartamento', 'RENT', 'en-US')).toBe('Apartments for rent');
  });
});

describe('categoryNoun', () => {
  it('uses the singular for exactly one property and the plural otherwise', () => {
    expect(categoryNoun('casa', 1, 'es-CO')).toBe('casa');
    expect(categoryNoun('casa', 3, 'es-CO')).toBe('casas');
    expect(categoryNoun('local-comercial', 1, 'es-CO')).toBe('local comercial');
    expect(categoryNoun('local-comercial', 2, 'es-CO')).toBe('locales comerciales');
    expect(categoryNoun('apartamento', 1, 'en-US')).toBe('apartment');
    expect(categoryNoun('lote', 4, 'en-US')).toBe('lots');
    expect(categoryNoun('local-comercial', 1, 'en-US')).toBe('commercial space');
  });

  it('falls back to the type slug for an unknown type', () => {
    expect(categoryNoun('bodega', 2, 'es-CO')).toBe('bodega');
  });
});

describe('selectCityCategories', () => {
  it('uses a minimum inventory of one property', () => {
    expect(MIN_CATEGORY_INVENTORY).toBe(1);
  });

  it('returns the categories of the requested city only', () => {
    const categories = selectCityCategories(
      [facet(), facet({ citySlug: 'zarzal', cityName: 'Zarzal' })],
      'cartago-valle-del-cauca',
    );
    expect(categories).toHaveLength(1);
    expect(categories[0]).toMatchObject({
      slug: 'casas-en-venta',
      typeSlug: 'casa',
      operationType: 'SALE',
      count: 2,
      priceRanges: [{ currency: 'COP', minPrice: 300_000_000, maxPrice: 500_000_000 }],
    });
  });

  it('returns nothing for a city without inventory', () => {
    expect(selectCityCategories([facet()], 'zarzal')).toEqual([]);
    expect(selectCityCategories([], 'cartago-valle-del-cauca')).toEqual([]);
  });

  it('skips property types that have no category slug', () => {
    const categories = selectCityCategories(
      [facet({ propertyTypeSlug: 'bodega', propertyTypeName: 'Bodega' })],
      'cartago-valle-del-cauca',
    );
    expect(categories).toEqual([]);
  });

  it('skips facets below the minimum inventory', () => {
    expect(selectCityCategories([facet({ count: 0 })], 'cartago-valle-del-cauca')).toEqual([]);
  });

  it('merges currencies of one category into a single entry with one range per currency', () => {
    const categories = selectCityCategories(
      [
        facet({ count: 2 }),
        facet({ currency: 'USD', count: 1, minPrice: 90_000, maxPrice: 90_000 }),
      ],
      'cartago-valle-del-cauca',
    );
    expect(categories).toHaveLength(1);
    expect(categories[0]?.count).toBe(3);
    expect(categories[0]?.priceRanges).toEqual([
      { currency: 'COP', minPrice: 300_000_000, maxPrice: 500_000_000 },
      { currency: 'USD', minPrice: 90_000, maxPrice: 90_000 },
    ]);
  });

  it('orders by property type, then sale before rent', () => {
    const categories = selectCityCategories(
      [
        facet({ propertyTypeSlug: 'lote', propertyTypeName: 'Lote', operationType: 'SALE' }),
        facet({ operationType: 'RENT' }),
        facet({ operationType: 'SALE' }),
        facet({ propertyTypeSlug: 'apartamento', propertyTypeName: 'Apartamento' }),
      ],
      'cartago-valle-del-cauca',
    );
    expect(categories.map((c) => c.slug)).toEqual([
      'casas-en-venta',
      'casas-en-arriendo',
      'apartamentos-en-venta',
      'lotes-en-venta',
    ]);
  });
});

describe('findCityCategory', () => {
  const facets = [facet(), facet({ operationType: 'RENT', count: 1 })];

  it('finds the category of a type and operation in a city', () => {
    expect(findCityCategory(facets, 'cartago-valle-del-cauca', 'casa', 'RENT')?.slug).toBe(
      'casas-en-arriendo',
    );
  });

  it('returns null when that category does not exist', () => {
    expect(findCityCategory(facets, 'cartago-valle-del-cauca', 'lote', 'SALE')).toBeNull();
    expect(findCityCategory(facets, 'zarzal', 'casa', 'SALE')).toBeNull();
    expect(findCityCategory(facets, 'cartago-valle-del-cauca', 'bodega', 'SALE')).toBeNull();
  });
});

describe('selectAllCategories', () => {
  const cities = [
    { slug: 'cartago-valle-del-cauca', name: 'Cartago', department: 'Valle del Cauca' },
    { slug: 'zarzal', name: 'Zarzal', department: 'Valle del Cauca' },
  ];

  it('lists the categories of every city that has inventory, in city order', () => {
    const entries = selectAllCategories(
      [facet({ citySlug: 'zarzal' }), facet(), facet({ operationType: 'RENT' })],
      cities,
    );
    expect(entries.map((e) => `${e.city.slug}/${e.category.slug}`)).toEqual([
      'cartago-valle-del-cauca/casas-en-venta',
      'cartago-valle-del-cauca/casas-en-arriendo',
      'zarzal/casas-en-venta',
    ]);
    expect(entries[0]?.city.name).toBe('Cartago');
  });

  it('ignores facets of a city that is not in the locations tree', () => {
    expect(selectAllCategories([facet({ citySlug: 'fantasma' })], cities)).toEqual([]);
  });

  it('returns nothing without facets', () => {
    expect(selectAllCategories([], cities)).toEqual([]);
  });
});
