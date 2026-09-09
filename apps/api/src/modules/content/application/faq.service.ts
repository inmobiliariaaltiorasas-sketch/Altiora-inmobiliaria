import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { DEFAULT_LOCALE, type FaqDto, type SupportedLocale } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { publicPropertyWhere } from '../../../common/utils/property-visibility';
import { CitiesService } from '../../cities/application/cities.service';

const faqInclude = { translations: true } satisfies Prisma.FaqInclude;
type FaqRow = Prisma.FaqGetPayload<{ include: typeof faqInclude }>;

/**
 * Las preguntas dinámicas (`isDynamic`) nunca guardan respuesta en la base — se calculan acá,
 * en el momento, contra el catálogo real (v1 sección 10 de correcciones: nada hardcodeado).
 */
@Injectable()
export class FaqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly citiesService: CitiesService,
  ) {}

  /** FAQs generales + las propias de una ciudad, con la respuesta ya resuelta para el locale pedido. */
  async getFaqsForCity(citySlug: string, locale: SupportedLocale): Promise<FaqDto[]> {
    const city = await this.citiesService.findBySlugOrThrow(citySlug);

    const faqs = await this.prisma.faq.findMany({
      where: { OR: [{ relatedEntity: 'GENERAL' }, { relatedEntity: 'CITY', cityId: city.id }] },
      include: faqInclude,
      orderBy: { order: 'asc' },
    });

    return Promise.all(faqs.map((faq) => this.resolve(faq, locale, city.id, city.name)));
  }

  private async resolve(
    faq: FaqRow,
    locale: SupportedLocale,
    cityId: string,
    cityName: string,
  ): Promise<FaqDto> {
    const translation =
      faq.translations.find((t) => t.locale === locale) ??
      faq.translations.find((t) => t.locale === DEFAULT_LOCALE) ??
      faq.translations[0];

    const answer = faq.isDynamic
      ? await this.resolveDynamicAnswer(faq.dynamicKey, locale, cityId, cityName)
      : (translation?.answer ?? '');

    return {
      id: faq.id,
      question: translation?.question ?? '',
      answer,
      isDynamic: faq.isDynamic,
      order: faq.order,
    };
  }

  private async resolveDynamicAnswer(
    dynamicKey: string | null,
    locale: SupportedLocale,
    cityId: string,
    cityName: string,
  ): Promise<string> {
    switch (dynamicKey) {
      case 'city_price_range':
        return this.priceRangeAnswer(locale, cityId, cityName);
      case 'city_neighborhoods_with_listings':
        return this.neighborhoodsAnswer(locale, cityId, cityName);
      default:
        return locale === 'en-US'
          ? 'No answer available yet.'
          : 'Todavía no hay una respuesta disponible.';
    }
  }

  private async priceRangeAnswer(
    locale: SupportedLocale,
    cityId: string,
    cityName: string,
  ): Promise<string> {
    const groups = await this.prisma.property.groupBy({
      by: ['currency'],
      where: { cityId, ...publicPropertyWhere() },
      _min: { price: true },
      _max: { price: true },
    });

    if (groups.length === 0) {
      return locale === 'en-US'
        ? `We don't have published properties in ${cityName} yet to show a price range.`
        : `Todavía no tenemos propiedades publicadas en ${cityName} para mostrar un rango de precios.`;
    }

    const formatter = (currency: string) =>
      new Intl.NumberFormat(locale === 'en-US' ? 'en-US' : 'es-CO', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      });

    const ranges = groups.map((group) => {
      const nf = formatter(group.currency);
      const min = nf.format(Number(group._min.price));
      const max = nf.format(Number(group._max.price));
      return min === max ? min : `${min} – ${max}`;
    });

    return locale === 'en-US'
      ? `Prices for our published properties in ${cityName} range from ${ranges.join(' / ')}.`
      : `Los precios de nuestras propiedades publicadas en ${cityName} van desde ${ranges.join(' / ')}.`;
  }

  private async neighborhoodsAnswer(
    locale: SupportedLocale,
    cityId: string,
    cityName: string,
  ): Promise<string> {
    const properties = await this.prisma.property.findMany({
      where: { cityId, neighborhoodId: { not: null }, ...publicPropertyWhere() },
      select: { neighborhood: { select: { name: true } } },
      distinct: ['neighborhoodId'],
    });
    const names = properties
      .map((p) => p.neighborhood?.name)
      .filter((n): n is string => Boolean(n));

    if (names.length === 0) {
      return locale === 'en-US'
        ? `We don't have neighborhoods registered with published listings in ${cityName} yet.`
        : `Todavía no tenemos barrios registrados con propiedades publicadas en ${cityName}.`;
    }

    return locale === 'en-US'
      ? `We currently have published listings in: ${names.join(', ')}.`
      : `Actualmente tenemos propiedades publicadas en: ${names.join(', ')}.`;
  }
}
