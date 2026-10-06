import type { Currency, OperationType, PropertyFacetDto } from '@altiora/shared-types';

export interface FacetSourceRow {
  price: number;
  currency: Currency;
  operationType: OperationType;
  city: { slug: string; name: string };
  propertyType: { slug: string; name: string };
}

/**
 * Groups public properties into one facet per city, property type, operation and currency.
 * Currency is part of the key on purpose: a min/max across COP and USD would be meaningless, so a
 * combination listed in both currencies produces two facets. The output order is deterministic
 * (city, type, operation, currency) so the endpoint and the sitemap built from it are stable.
 */
export function toPropertyFacets(rows: readonly FacetSourceRow[]): PropertyFacetDto[] {
  const facets = new Map<string, PropertyFacetDto>();

  for (const row of rows) {
    const key = [row.city.slug, row.propertyType.slug, row.operationType, row.currency].join('|');
    const existing = facets.get(key);
    if (existing) {
      existing.count += 1;
      existing.minPrice = Math.min(existing.minPrice, row.price);
      existing.maxPrice = Math.max(existing.maxPrice, row.price);
      continue;
    }
    facets.set(key, {
      citySlug: row.city.slug,
      cityName: row.city.name,
      propertyTypeSlug: row.propertyType.slug,
      propertyTypeName: row.propertyType.name,
      operationType: row.operationType,
      currency: row.currency,
      count: 1,
      minPrice: row.price,
      maxPrice: row.price,
    });
  }

  return [...facets.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([, facet]) => facet);
}
