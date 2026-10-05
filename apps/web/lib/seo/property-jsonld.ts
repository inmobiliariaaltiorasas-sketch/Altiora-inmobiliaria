import type { PropertyDetailDto, PropertyTranslationDto } from '@altiora/shared-types';
import { resolveMediaUrl } from '@/lib/api-client';
import { isAccommodationType, propertyTypeToSchemaType } from './property-schema-type';

const isPositive = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * Listing node for the property page's JSON-LD graph. Values come only from the property data and
 * are omitted when absent or not positive; accommodation-only fields are never added to land.
 */
export function buildPropertyJsonLd(input: {
  property: PropertyDetailDto;
  translation: PropertyTranslationDto | undefined;
  /** Canonical URL of the rendered locale. */
  url: string;
}): Record<string, unknown> {
  const { property, translation, url } = input;
  const type = propertyTypeToSchemaType(property.propertyType.slug);
  const accommodation = isAccommodationType(type);
  const images = property.media.map((item) => resolveMediaUrl(item.url));

  return {
    '@type': type,
    name: translation?.title,
    description: translation?.shortDescription,
    url,
    ...(images.length > 0 ? { image: images } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(property.location.addressLine ? { streetAddress: property.location.addressLine } : {}),
      addressLocality: property.location.city.name,
      addressRegion: property.location.city.department,
      addressCountry: 'CO',
    },
    ...(accommodation && isPositive(property.bedrooms)
      ? { numberOfBedrooms: property.bedrooms }
      : {}),
    ...(accommodation && isPositive(property.bathrooms)
      ? { numberOfBathroomsTotal: property.bathrooms }
      : {}),
    ...(accommodation && isPositive(property.builtAreaM2)
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: property.builtAreaM2,
            unitCode: 'MTK',
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: property.currency,
      availability:
        property.status === 'PUBLISHED'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url,
    },
  };
}
