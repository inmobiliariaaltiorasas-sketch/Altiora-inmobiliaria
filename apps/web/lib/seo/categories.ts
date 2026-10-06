import type { Currency, OperationType, PropertyFacetDto } from '@altiora/shared-types';
import type { SupportedLocale } from '@/lib/locales';

/** A category page exists only when it lists at least this many public properties. */
export const MIN_CATEGORY_INVENTORY = 1;

interface TypeNames {
  /** Plural used in the URL slug. */
  slug: string;
  label: Record<SupportedLocale, string>;
}

/**
 * Property types that get a category page, keyed by the property-type slug. The insertion order
 * is the display order. A type that is not listed here has no category page.
 */
const CATEGORY_TYPES: Record<string, TypeNames> = {
  casa: { slug: 'casas', label: { 'es-CO': 'Casas', 'en-US': 'Houses' } },
  apartamento: { slug: 'apartamentos', label: { 'es-CO': 'Apartamentos', 'en-US': 'Apartments' } },
  lote: { slug: 'lotes', label: { 'es-CO': 'Lotes', 'en-US': 'Lots' } },
  finca: { slug: 'fincas', label: { 'es-CO': 'Fincas', 'en-US': 'Farms' } },
  'local-comercial': {
    slug: 'locales-comerciales',
    label: { 'es-CO': 'Locales comerciales', 'en-US': 'Commercial spaces' },
  },
};

const OPERATION_SLUGS: Record<OperationType, string> = { SALE: 'venta', RENT: 'arriendo' };
const OPERATION_LABELS: Record<SupportedLocale, Record<OperationType, string>> = {
  'es-CO': { SALE: 'en venta', RENT: 'en arriendo' },
  'en-US': { SALE: 'for sale', RENT: 'for rent' },
};
const OPERATIONS: readonly OperationType[] = ['SALE', 'RENT'];

export interface CategoryRef {
  typeSlug: string;
  operation: OperationType;
}

export interface CategoryPriceRange {
  currency: Currency;
  minPrice: number;
  maxPrice: number;
}

export interface CityCategory {
  slug: string;
  typeSlug: string;
  typeName: string;
  operationType: OperationType;
  count: number;
  /** One range per currency: prices in different currencies are never mixed. */
  priceRanges: CategoryPriceRange[];
}

/** `casa` + `SALE` gives `casas-en-venta`; `null` when the type has no category page. */
export function buildCategorySlug(typeSlug: string, operation: OperationType): string | null {
  const type = Object.hasOwn(CATEGORY_TYPES, typeSlug) ? CATEGORY_TYPES[typeSlug] : undefined;
  return type ? `${type.slug}-en-${OPERATION_SLUGS[operation]}` : null;
}

/** Inverse of `buildCategorySlug`; `null` for anything that is not an exact known category. */
export function parseCategorySlug(slug: string): CategoryRef | null {
  for (const [typeSlug, type] of Object.entries(CATEGORY_TYPES)) {
    for (const operation of OPERATIONS) {
      if (slug === `${type.slug}-en-${OPERATION_SLUGS[operation]}`) {
        return { typeSlug, operation };
      }
    }
  }
  return null;
}

/** Human title of a category, for example "Casas en venta" or "Houses for sale". */
export function categoryLabel(
  typeSlug: string,
  operation: OperationType,
  locale: SupportedLocale,
): string {
  const type = Object.hasOwn(CATEGORY_TYPES, typeSlug) ? CATEGORY_TYPES[typeSlug] : undefined;
  const typeLabel = type?.label[locale] ?? typeSlug;
  return `${typeLabel} ${OPERATION_LABELS[locale][operation]}`;
}

/**
 * The categories that exist for a city: type-plus-operation combinations that have at least
 * `MIN_CATEGORY_INVENTORY` public properties. Facets of the same combination in different
 * currencies collapse into one category with one price range per currency.
 */
export function selectCityCategories(
  facets: readonly PropertyFacetDto[],
  citySlug: string,
): CityCategory[] {
  const byKey = new Map<string, CityCategory>();

  for (const facet of facets) {
    if (facet.citySlug !== citySlug || facet.count < 1) continue;
    const slug = buildCategorySlug(facet.propertyTypeSlug, facet.operationType);
    if (!slug) continue;

    const range = {
      currency: facet.currency,
      minPrice: facet.minPrice,
      maxPrice: facet.maxPrice,
    };
    const existing = byKey.get(slug);
    if (existing) {
      existing.count += facet.count;
      existing.priceRanges.push(range);
    } else {
      byKey.set(slug, {
        slug,
        typeSlug: facet.propertyTypeSlug,
        typeName: facet.propertyTypeName,
        operationType: facet.operationType,
        count: facet.count,
        priceRanges: [range],
      });
    }
  }

  const typeOrder = Object.keys(CATEGORY_TYPES);
  return [...byKey.values()]
    .filter((category) => category.count >= MIN_CATEGORY_INVENTORY)
    .sort(
      (a, b) =>
        typeOrder.indexOf(a.typeSlug) - typeOrder.indexOf(b.typeSlug) ||
        OPERATIONS.indexOf(a.operationType) - OPERATIONS.indexOf(b.operationType),
    );
}
