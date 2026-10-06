import type { PropertySummaryDto, SupportedLocale } from '@altiora/shared-types';
import { formatPrice } from '@/lib/format';
import { BRAND_NAME } from './brand';
import {
  categoryLabel,
  categoryNoun,
  operationPhrase,
  type CategoryPriceRange,
  type CityCategory,
} from './categories';

export interface CategoryFaq {
  question: string;
  answer: string;
}

/** True when the inventory has exactly one range and its lowest and highest price are equal. */
function isSinglePrice(ranges: readonly CategoryPriceRange[]): ranges is [CategoryPriceRange] {
  const [only] = ranges;
  return ranges.length === 1 && only !== undefined && only.minPrice === only.maxPrice;
}

/** "desde A hasta B" for every currency present; ranges of different currencies are never merged. */
function priceRangesText(ranges: readonly CategoryPriceRange[], locale: SupportedLocale): string {
  const from = locale === 'es-CO' ? 'desde' : 'from';
  const to = locale === 'es-CO' ? 'hasta' : 'to';
  const joiner = locale === 'es-CO' ? ' y ' : ' and ';
  return ranges
    .map(
      (range) =>
        `${from} ${formatPrice(range.minPrice, range.currency, locale)} ${to} ${formatPrice(range.maxPrice, range.currency, locale)}`,
    )
    .join(joiner);
}

/** "Casas en venta en Cartago, Valle del Cauca": the H1 and the title. */
export function buildCategoryHeading(input: {
  category: CityCategory;
  cityName: string;
  department: string;
  locale: SupportedLocale;
}): string {
  const { category, cityName, department, locale } = input;
  const label = categoryLabel(category.typeSlug, category.operationType, locale);
  return `${label} ${locale === 'es-CO' ? 'en' : 'in'} ${cityName}, ${department}`;
}

/** One factual sentence: how many properties exist and their price range, from the inventory. */
export function buildCategorySummary(input: {
  category: CityCategory;
  cityName: string;
  locale: SupportedLocale;
}): string {
  const { category, cityName, locale } = input;
  const { count, priceRanges } = category;
  const noun = categoryNoun(category.typeSlug, count, locale);
  const operation = operationPhrase(category.operationType, locale);
  const es = locale === 'es-CO';

  const subject = es
    ? `Hay ${count} ${noun} ${operation} en ${cityName}`
    : `${count === 1 ? 'There is' : 'There are'} ${count} ${noun} ${operation} in ${cityName}`;

  if (priceRanges.length === 0) return `${subject}.`;
  if (isSinglePrice(priceRanges)) {
    const price = formatPrice(priceRanges[0].minPrice, priceRanges[0].currency, locale);
    return es ? `${subject}, con un precio de ${price}.` : `${subject}, priced at ${price}.`;
  }
  const prices = priceRangesText(priceRanges, locale);
  return es ? `${subject}, con precios ${prices}.` : `${subject}, with prices ${prices}.`;
}

/** Title and meta description of a category page, both built from the same facts. */
export function buildCategoryMetadataText(input: {
  category: CityCategory;
  cityName: string;
  department: string;
  locale: SupportedLocale;
}): { title: string; description: string } {
  const { locale } = input;
  const closing =
    locale === 'es-CO'
      ? `Consulta fotos y precios, y agenda tu visita con ${BRAND_NAME}.`
      : `See photos and prices, and book a visit with ${BRAND_NAME}.`;
  return {
    title: buildCategoryHeading(input),
    description: `${buildCategorySummary(input)} ${closing}`,
  };
}

/**
 * FAQ computed only from the inventory (count, price range) plus how to request a visit through
 * channels that exist. WhatsApp is mentioned only when the number is configured.
 */
export function buildCategoryFaqs(input: {
  category: CityCategory;
  cityName: string;
  locale: SupportedLocale;
  whatsappAvailable: boolean;
}): CategoryFaq[] {
  const { category, cityName, locale, whatsappAvailable } = input;
  const { count, priceRanges } = category;
  const plural = categoryNoun(category.typeSlug, 2, locale);
  const noun = categoryNoun(category.typeSlug, count, locale);
  const operation = operationPhrase(category.operationType, locale);
  const es = locale === 'es-CO';

  const availability: CategoryFaq = es
    ? {
        question: `¿Qué cantidad de ${plural} ${operation} hay disponibles en ${cityName}?`,
        answer: `Actualmente hay ${count} ${noun} ${operation} en ${cityName}.`,
      }
    : {
        question: `How many ${plural} ${operation} are available in ${cityName}?`,
        answer: `There ${count === 1 ? 'is' : 'are'} currently ${count} ${noun} ${operation} in ${cityName}.`,
      };

  const faqs: CategoryFaq[] = [availability];

  if (priceRanges.length > 0) {
    const single = isSinglePrice(priceRanges)
      ? formatPrice(priceRanges[0].minPrice, priceRanges[0].currency, locale)
      : null;
    const prices = priceRangesText(priceRanges, locale);
    faqs.push(
      es
        ? {
            question: `¿Cuál es el rango de precios de ${plural} ${operation} en ${cityName}?`,
            answer: single ? `El precio es ${single}.` : `Los precios van ${prices}.`,
          }
        : {
            question: `What is the price range of ${plural} ${operation} in ${cityName}?`,
            answer: single ? `The price is ${single}.` : `Prices run ${prices}.`,
          },
    );
  }

  faqs.push(
    es
      ? {
          question: '¿Cómo puedo solicitar una visita?',
          answer: `Puedes solicitar una visita desde la página de contacto${whatsappAvailable ? ' o por WhatsApp' : ''}, indicando la propiedad que te interesa. Un asesor de ${BRAND_NAME} te ayudará a coordinarla.`,
        }
      : {
          question: 'How can I request a visit?',
          answer: `You can request a visit from the contact page${whatsappAvailable ? ' or on WhatsApp' : ''}, naming the property you are interested in. An advisor from ${BRAND_NAME} will help you arrange it.`,
        },
  );

  return faqs;
}

/** schema.org `FAQPage` with exactly the text that is rendered on the page. */
export function buildFaqPageJsonLd(faqs: readonly CategoryFaq[]) {
  return {
    '@type': 'FAQPage' as const,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer' as const, text: faq.answer },
    })),
  };
}

/** schema.org `ItemList` of the properties shown on the page, in the order they are rendered. */
export function buildPropertyItemList(input: {
  properties: readonly PropertySummaryDto[];
  locale: SupportedLocale;
  baseUrl: string;
}) {
  const { properties, locale, baseUrl } = input;
  return {
    '@type': 'ItemList' as const,
    numberOfItems: properties.length,
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: property.translation.title,
      url: `${baseUrl}/${locale}/propiedades/${property.slug}`,
    })),
  };
}
