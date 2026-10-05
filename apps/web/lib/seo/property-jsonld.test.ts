import { describe, expect, it } from 'vitest';
import type { PropertyDetailDto, PropertyTranslationDto } from '@altiora/shared-types';
import { buildPropertyJsonLd } from './property-jsonld';

const URL_ES = 'https://example.com/es-CO/propiedades/casa-1';

const translation: PropertyTranslationDto = {
  locale: 'es-CO',
  title: 'Casa campestre',
  subtitle: null,
  shortDescription: 'Casa amplia',
  fullDescription: 'Descripción completa',
  seoTitle: null,
  seoDescription: null,
  seoCanonicalOverride: null,
};

function makeProperty(overrides: Partial<PropertyDetailDto> = {}): PropertyDetailDto {
  return {
    id: 'p1',
    slug: 'casa-1',
    operationType: 'SALE',
    price: 450000000,
    currency: 'COP',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpots: 1,
    builtAreaM2: 120,
    status: 'PUBLISHED',
    isFeatured: false,
    location: {
      city: { id: 'c1', name: 'Cartago', slug: 'cartago', department: 'Valle del Cauca' },
      neighborhood: null,
      addressLine: 'Calle 1 # 2-3',
      latitude: null,
      longitude: null,
    },
    propertyType: { id: 't1', name: 'Casa', slug: 'casa' },
    translation: { locale: 'es-CO', title: 'Casa campestre', subtitle: null },
    landAreaM2: 300,
    yearBuilt: 2010,
    publishedAt: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
    media: [
      { id: 'm1', type: 'IMAGE', url: '/property-media/file/a.jpg', order: 0 },
      { id: 'm2', type: 'IMAGE', url: 'https://cdn.example.com/b.jpg', order: 1 },
    ],
    features: [],
    translations: [translation],
    relatedProperties: [],
    ...overrides,
  } as PropertyDetailDto;
}

describe('buildPropertyJsonLd', () => {
  it('describes a house with every available value', () => {
    const node = buildPropertyJsonLd({ property: makeProperty(), translation, url: URL_ES });
    expect(node).toMatchObject({
      '@type': 'House',
      name: 'Casa campestre',
      description: 'Casa amplia',
      url: URL_ES,
      numberOfBedrooms: 3,
      numberOfBathroomsTotal: 2,
      floorSize: { '@type': 'QuantitativeValue', value: 120, unitCode: 'MTK' },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Calle 1 # 2-3',
        addressLocality: 'Cartago',
        addressRegion: 'Valle del Cauca',
        addressCountry: 'CO',
      },
      offers: {
        '@type': 'Offer',
        price: 450000000,
        priceCurrency: 'COP',
        availability: 'https://schema.org/InStock',
        url: URL_ES,
      },
    });
  });

  it('emits absolute image URLs, resolving relative media paths against the API', () => {
    const node = buildPropertyJsonLd({ property: makeProperty(), translation, url: URL_ES });
    const images = node.image as string[];
    expect(images).toHaveLength(2);
    expect(images[0]).toMatch(/^https?:\/\/.+\/property-media\/file\/a\.jpg$/);
    expect(images[1]).toBe('https://cdn.example.com/b.jpg');
  });

  it('omits images when the property has none', () => {
    const node = buildPropertyJsonLd({
      property: makeProperty({ media: [] }),
      translation,
      url: URL_ES,
    });
    expect(node).not.toHaveProperty('image');
  });

  it('maps an apartment type to Apartment with its own values', () => {
    const node = buildPropertyJsonLd({
      property: makeProperty({
        propertyType: { id: 't2', name: 'Apartamento', slug: 'apartamento' },
      }),
      translation,
      url: URL_ES,
    });
    expect(node['@type']).toBe('Apartment');
    expect(node.numberOfBedrooms).toBe(3);
  });

  it('describes land without bedrooms, bathrooms or floor size', () => {
    const node = buildPropertyJsonLd({
      property: makeProperty({
        propertyType: { id: 't3', name: 'Lote', slug: 'lote' },
        bedrooms: 0,
        bathrooms: 0,
        builtAreaM2: 0,
      }),
      translation,
      url: URL_ES,
    });
    expect(node['@type']).toBe('Place');
    expect(node).not.toHaveProperty('numberOfBedrooms');
    expect(node).not.toHaveProperty('numberOfBathroomsTotal');
    expect(node).not.toHaveProperty('floorSize');
  });

  it('does not add accommodation fields to land even when the data has values', () => {
    const node = buildPropertyJsonLd({
      property: makeProperty({
        propertyType: { id: 't3', name: 'Lote', slug: 'lote' },
        bedrooms: 2,
        bathrooms: 1,
        builtAreaM2: 80,
      }),
      translation,
      url: URL_ES,
    });
    expect(node).not.toHaveProperty('numberOfBedrooms');
    expect(node).not.toHaveProperty('floorSize');
  });

  it('omits optional accommodation values that are zero, negative or missing', () => {
    const node = buildPropertyJsonLd({
      property: makeProperty({
        bedrooms: 0,
        bathrooms: -1,
        builtAreaM2: 0,
        location: {
          city: { id: 'c1', name: 'Cartago', slug: 'cartago', department: 'Valle del Cauca' },
          neighborhood: null,
          addressLine: null,
          latitude: null,
          longitude: null,
        },
      }),
      translation,
      url: URL_ES,
    });
    expect(node).not.toHaveProperty('numberOfBedrooms');
    expect(node).not.toHaveProperty('numberOfBathroomsTotal');
    expect(node).not.toHaveProperty('floorSize');
    expect((node.address as Record<string, unknown>).streetAddress).toBeUndefined();
  });

  it('marks non-published properties as out of stock', () => {
    const node = buildPropertyJsonLd({
      property: makeProperty({ status: 'SOLD' }),
      translation,
      url: URL_ES,
    });
    expect((node.offers as { availability: string }).availability).toBe(
      'https://schema.org/OutOfStock',
    );
  });
});
