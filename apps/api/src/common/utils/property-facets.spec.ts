import { toPropertyFacets, type FacetSourceRow } from './property-facets';

function row(overrides: Partial<FacetSourceRow> = {}): FacetSourceRow {
  return {
    price: 400_000_000,
    currency: 'COP',
    operationType: 'SALE',
    city: { slug: 'cartago-valle-del-cauca', name: 'Cartago' },
    propertyType: { slug: 'casa', name: 'Casa' },
    ...overrides,
  };
}

describe('toPropertyFacets', () => {
  it('returns an empty list when there are no public properties', () => {
    expect(toPropertyFacets([])).toEqual([]);
  });

  it('groups rows of the same city, type, operation and currency with count and price range', () => {
    const facets = toPropertyFacets([
      row({ price: 500_000_000 }),
      row({ price: 300_000_000 }),
      row({ price: 400_000_000 }),
    ]);
    expect(facets).toEqual([
      {
        citySlug: 'cartago-valle-del-cauca',
        cityName: 'Cartago',
        propertyTypeSlug: 'casa',
        propertyTypeName: 'Casa',
        operationType: 'SALE',
        currency: 'COP',
        count: 3,
        minPrice: 300_000_000,
        maxPrice: 500_000_000,
      },
    ]);
  });

  it('keeps sale and rent of the same type as separate facets', () => {
    const facets = toPropertyFacets([
      row({ operationType: 'SALE' }),
      row({ operationType: 'RENT', price: 2_000_000 }),
    ]);
    expect(facets.map((f) => [f.operationType, f.count])).toEqual([
      ['RENT', 1],
      ['SALE', 1],
    ]);
  });

  it('never mixes currencies in one price range', () => {
    const facets = toPropertyFacets([
      row({ price: 400_000_000, currency: 'COP' }),
      row({ price: 90_000, currency: 'USD' }),
    ]);
    expect(facets).toHaveLength(2);
    const usd = facets.find((f) => f.currency === 'USD');
    expect(usd).toMatchObject({ count: 1, minPrice: 90_000, maxPrice: 90_000 });
    const cop = facets.find((f) => f.currency === 'COP');
    expect(cop).toMatchObject({ count: 1, minPrice: 400_000_000, maxPrice: 400_000_000 });
  });

  it('separates cities and property types', () => {
    const facets = toPropertyFacets([
      row(),
      row({ city: { slug: 'zarzal', name: 'Zarzal' } }),
      row({ propertyType: { slug: 'lote', name: 'Lote' } }),
    ]);
    expect(facets).toHaveLength(3);
  });

  it('orders facets deterministically by city, type, operation and currency', () => {
    const facets = toPropertyFacets([
      row({ city: { slug: 'zarzal', name: 'Zarzal' } }),
      row({ propertyType: { slug: 'lote', name: 'Lote' } }),
      row(),
    ]);
    expect(facets.map((f) => `${f.citySlug}/${f.propertyTypeSlug}`)).toEqual([
      'cartago-valle-del-cauca/casa',
      'cartago-valle-del-cauca/lote',
      'zarzal/casa',
    ]);
  });
});
