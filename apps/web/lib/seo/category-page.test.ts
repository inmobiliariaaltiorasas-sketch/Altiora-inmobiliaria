import { describe, expect, it } from 'vitest';
import type { PropertySummaryDto } from '@altiora/shared-types';
import { formatPrice } from '@/lib/format';
import type { CityCategory } from './categories';
import {
  buildCategoryFaqs,
  buildCategoryHeading,
  buildCategoryMetadataText,
  buildCategorySummary,
  buildFaqPageJsonLd,
  buildPropertyItemList,
} from './category-page';

const cop = (n: number) => formatPrice(n, 'COP', 'es-CO');
const copEn = (n: number) => formatPrice(n, 'COP', 'en-US');

function category(overrides: Partial<CityCategory> = {}): CityCategory {
  return {
    slug: 'casas-en-venta',
    typeSlug: 'casa',
    typeName: 'Casa',
    operationType: 'SALE',
    count: 3,
    priceRanges: [{ currency: 'COP', minPrice: 300_000_000, maxPrice: 500_000_000 }],
    ...overrides,
  };
}

const single = category({
  count: 1,
  priceRanges: [{ currency: 'COP', minPrice: 350_000_000, maxPrice: 350_000_000 }],
});

describe('buildCategoryHeading', () => {
  it('states type, operation and city in each locale', () => {
    const base = { category: category(), cityName: 'Cartago', department: 'Valle del Cauca' };
    expect(buildCategoryHeading({ ...base, locale: 'es-CO' })).toBe(
      'Casas en venta en Cartago, Valle del Cauca',
    );
    expect(buildCategoryHeading({ ...base, locale: 'en-US' })).toBe(
      'Houses for sale in Cartago, Valle del Cauca',
    );
  });
});

describe('buildCategorySummary', () => {
  it('states the plural count and the price range from lowest to highest', () => {
    expect(
      buildCategorySummary({ category: category(), cityName: 'Cartago', locale: 'es-CO' }),
    ).toBe(
      `Hay 3 casas en venta en Cartago, con precios desde ${cop(300_000_000)} hasta ${cop(500_000_000)}.`,
    );
    expect(
      buildCategorySummary({ category: category(), cityName: 'Cartago', locale: 'en-US' }),
    ).toBe(
      `There are 3 houses for sale in Cartago, with prices from ${copEn(300_000_000)} to ${copEn(500_000_000)}.`,
    );
  });

  it('uses the singular and a single price for exactly one property', () => {
    expect(buildCategorySummary({ category: single, cityName: 'Cartago', locale: 'es-CO' })).toBe(
      `Hay 1 casa en venta en Cartago, con un precio de ${cop(350_000_000)}.`,
    );
    expect(buildCategorySummary({ category: single, cityName: 'Cartago', locale: 'en-US' })).toBe(
      `There is 1 house for sale in Cartago, priced at ${copEn(350_000_000)}.`,
    );
  });

  it('keeps one range per currency instead of mixing them', () => {
    const mixed = category({
      count: 2,
      priceRanges: [
        { currency: 'COP', minPrice: 300_000_000, maxPrice: 300_000_000 },
        { currency: 'USD', minPrice: 90_000, maxPrice: 120_000 },
      ],
    });
    const text = buildCategorySummary({ category: mixed, cityName: 'Cartago', locale: 'es-CO' });
    expect(text).toContain(`desde ${cop(300_000_000)} hasta ${cop(300_000_000)}`);
    expect(text).toContain(`desde ${formatPrice(90_000, 'USD', 'es-CO')} hasta`);
  });

  it('omits the price clause when there is no price range', () => {
    expect(
      buildCategorySummary({
        category: category({ priceRanges: [] }),
        cityName: 'Cartago',
        locale: 'es-CO',
      }),
    ).toBe('Hay 3 casas en venta en Cartago.');
  });
});

describe('buildCategoryFaqs', () => {
  const input = { category: category(), cityName: 'Cartago', whatsappAvailable: true };

  it('answers availability, price range and how to request a visit from the inventory', () => {
    const faqs = buildCategoryFaqs({ ...input, locale: 'es-CO' });
    expect(faqs).toHaveLength(3);
    expect(faqs[0]).toEqual({
      question: '¿Qué cantidad de casas en venta hay disponibles en Cartago?',
      answer: 'Actualmente hay 3 casas en venta en Cartago.',
    });
    expect(faqs[1]?.question).toBe('¿Cuál es el rango de precios de casas en venta en Cartago?');
    expect(faqs[1]?.answer).toBe(
      `Los precios van desde ${cop(300_000_000)} hasta ${cop(500_000_000)}.`,
    );
    expect(faqs[2]?.answer).toContain('página de contacto');
    expect(faqs[2]?.answer).toContain('WhatsApp');
  });

  it('answers a single-property category with the exact price', () => {
    const faqs = buildCategoryFaqs({ ...input, category: single, locale: 'es-CO' });
    expect(faqs[0]?.answer).toBe('Actualmente hay 1 casa en venta en Cartago.');
    expect(faqs[1]?.answer).toBe(`El precio es ${cop(350_000_000)}.`);
  });

  it('does not mention WhatsApp when the number is not configured', () => {
    const faqs = buildCategoryFaqs({ ...input, whatsappAvailable: false, locale: 'es-CO' });
    expect(faqs[2]?.answer).not.toContain('WhatsApp');
    expect(faqs[2]?.answer).toContain('página de contacto');
  });

  it('is available in English', () => {
    const faqs = buildCategoryFaqs({ ...input, locale: 'en-US' });
    expect(faqs[0]?.question).toBe('How many houses for sale are available in Cartago?');
    expect(faqs[0]?.answer).toBe('There are currently 3 houses for sale in Cartago.');
    expect(faqs[2]?.answer).toContain('contact page');
  });
});

describe('buildCategoryMetadataText', () => {
  it('uses the heading as title and the summary in the description', () => {
    const meta = buildCategoryMetadataText({
      category: category(),
      cityName: 'Cartago',
      department: 'Valle del Cauca',
      locale: 'es-CO',
    });
    expect(meta.title).toBe('Casas en venta en Cartago, Valle del Cauca');
    expect(meta.description).toContain('Hay 3 casas en venta en Cartago');
    expect(meta.description).toContain('ALTiora Inmobiliaria');
  });
});

describe('buildFaqPageJsonLd', () => {
  it('maps the same question and answer text to schema.org', () => {
    const faqs = [{ question: 'Q?', answer: 'A.' }];
    expect(buildFaqPageJsonLd(faqs)).toEqual({
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } },
      ],
    });
  });
});

describe('buildPropertyItemList', () => {
  const item = (slug: string, title: string) =>
    ({ slug, translation: { title } }) as unknown as PropertySummaryDto;

  it('lists each property with position, name and locale URL', () => {
    const list = buildPropertyItemList({
      properties: [item('casa-a', 'Casa A'), item('casa-b', 'Casa B')],
      locale: 'es-CO',
      baseUrl: 'https://example.com',
    });
    expect(list).toEqual({
      '@type': 'ItemList',
      numberOfItems: 2,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Casa A',
          url: 'https://example.com/es-CO/propiedades/casa-a',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Casa B',
          url: 'https://example.com/es-CO/propiedades/casa-b',
        },
      ],
    });
  });

  it('returns an empty list for no properties', () => {
    expect(
      buildPropertyItemList({ properties: [], locale: 'en-US', baseUrl: 'https://example.com' })
        .itemListElement,
    ).toEqual([]);
  });
});
