import { Injectable } from '@nestjs/common';
import { Prisma, type PropertyPublicationStatus as PrismaPropertyStatus } from '@prisma/client';
import {
  DEFAULT_LOCALE,
  type SupportedLocale,
  type Currency,
  type PropertyDetailDto,
  type PropertyPublicationStatus,
  type PropertySearchResultDto,
  type PropertySitemapEntryDto,
  type PropertySummaryDto,
} from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  excludeDemoPropertiesWhere,
  publicPropertyWhere,
} from '../../../common/utils/property-visibility';
import type {
  CreatePropertyInput,
  PropertiesRepository,
  PropertySearchFilters,
  PropertySnapshot,
  UpdatePropertyInput,
} from '../domain/properties.repository';

const propertyInclude = {
  city: true,
  neighborhood: true,
  propertyType: true,
  media: { orderBy: { order: 'asc' as const } },
  translations: true,
  features: { include: { feature: true } },
};

type PropertyWithRelations = Prisma.PropertyGetPayload<{ include: typeof propertyInclude }>;

@Injectable()
export class PrismaPropertiesRepository implements PropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async search(filters: PropertySearchFilters): Promise<PropertySearchResultDto> {
    const where: Prisma.PropertyWhereInput = {
      ...(filters.includeUnpublished ? {} : publicPropertyWhere()),
      city: filters.citySlug ? { slug: filters.citySlug } : undefined,
      neighborhood: filters.neighborhoodSlug ? { slug: filters.neighborhoodSlug } : undefined,
      propertyType: filters.propertyTypeSlug ? { slug: filters.propertyTypeSlug } : undefined,
      operationType: filters.operationType,
      bedrooms: filters.minBedrooms ? { gte: filters.minBedrooms } : undefined,
      bathrooms: filters.minBathrooms ? { gte: filters.minBathrooms } : undefined,
      builtAreaM2: filters.minBuiltAreaM2 ? { gte: filters.minBuiltAreaM2 } : undefined,
      price:
        filters.minPrice || filters.maxPrice
          ? { gte: filters.minPrice, lte: filters.maxPrice }
          : undefined,
    };

    const [total, properties] = await this.prisma.$transaction([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        include: propertyInclude,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    ]);

    return {
      items: properties.map((property) => this.toSummary(property, filters.locale)),
      total,
      page: filters.page,
      pageSize: filters.pageSize,
    };
  }

  async findPublicBySlug(slug: string, locale: SupportedLocale): Promise<PropertyDetailDto | null> {
    const property = await this.prisma.property.findFirst({
      where: { slug, ...publicPropertyWhere() },
      include: propertyInclude,
    });
    return property
      ? this.toDetail(property, locale, await this.findRelated(property, true))
      : null;
  }

  async findAdminById(id: string, locale: SupportedLocale): Promise<PropertyDetailDto | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: propertyInclude,
    });
    return property
      ? this.toDetail(property, locale, await this.findRelated(property, false))
      : null;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const found = await this.prisma.property.findUnique({ where: { slug }, select: { id: true } });
    return found !== null;
  }

  async create(input: CreatePropertyInput): Promise<{ id: string; slug: string }> {
    const property = await this.prisma.property.create({
      data: {
        slug: input.slug,
        operationType: input.operationType,
        price: input.price,
        currency: input.currency,
        bedrooms: input.bedrooms,
        bathrooms: input.bathrooms,
        parkingSpots: input.parkingSpots,
        builtAreaM2: input.builtAreaM2,
        landAreaM2: input.landAreaM2,
        yearBuilt: input.yearBuilt,
        addressLine: input.addressLine,
        latitude: input.latitude,
        longitude: input.longitude,
        cityId: input.cityId,
        neighborhoodId: input.neighborhoodId,
        propertyTypeId: input.propertyTypeId,
        agentId: input.agentId,
        features: { create: input.featureIds.map((featureId) => ({ featureId })) },
        translations: { create: input.translations },
      },
      select: { id: true, slug: true },
    });
    return property;
  }

  async update(id: string, input: UpdatePropertyInput): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id },
        data: {
          operationType: input.operationType,
          price: input.price,
          currency: input.currency,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          parkingSpots: input.parkingSpots,
          builtAreaM2: input.builtAreaM2,
          landAreaM2: input.landAreaM2,
          yearBuilt: input.yearBuilt,
          addressLine: input.addressLine,
          latitude: input.latitude,
          longitude: input.longitude,
          cityId: input.cityId,
          neighborhoodId: input.neighborhoodId,
          propertyTypeId: input.propertyTypeId,
          agentId: input.agentId,
        },
      });

      if (input.featureIds) {
        await tx.propertyFeatureOnProperty.deleteMany({ where: { propertyId: id } });
        await tx.propertyFeatureOnProperty.createMany({
          data: input.featureIds.map((featureId) => ({ propertyId: id, featureId })),
        });
      }

      for (const translation of input.translations ?? []) {
        await tx.propertyTranslation.upsert({
          where: { propertyId_locale: { propertyId: id, locale: translation.locale } },
          create: { propertyId: id, ...translation },
          update: translation,
        });
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.property.delete({ where: { id } });
  }

  async setFeatured(id: string, isFeatured: boolean): Promise<void> {
    await this.prisma.property.update({ where: { id }, data: { isFeatured } });
  }

  async updateStatus(id: string, status: PropertyPublicationStatus): Promise<void> {
    await this.prisma.property.update({
      where: { id },
      data: {
        status: status as PrismaPropertyStatus,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
      },
    });
  }

  async updatePrice(id: string, price: number, currency?: Currency): Promise<void> {
    await this.prisma.property.update({ where: { id }, data: { price, currency } });
  }

  async getSnapshot(id: string): Promise<PropertySnapshot | null> {
    const property = await this.prisma.property.findUnique({
      where: { id },
      select: { price: true, currency: true, status: true },
    });
    if (!property) return null;
    return { price: Number(property.price), currency: property.currency, status: property.status };
  }

  async listSitemapEntries(): Promise<PropertySitemapEntryDto[]> {
    const properties = await this.prisma.property.findMany({
      where: publicPropertyWhere(),
      select: { slug: true, updatedAt: true },
    });
    return properties.map((p) => ({ slug: p.slug, updatedAt: p.updatedAt.toISOString() }));
  }

  private async findRelated(
    property: PropertyWithRelations,
    excludeDemo: boolean,
  ): Promise<PropertyWithRelations[]> {
    return this.prisma.property.findMany({
      where: {
        id: { not: property.id },
        status: 'PUBLISHED',
        cityId: property.cityId,
        propertyTypeId: property.propertyTypeId,
        NOT: excludeDemo ? excludeDemoPropertiesWhere : undefined,
      },
      include: propertyInclude,
      take: 4,
    });
  }

  private resolveTranslation(
    translations: PropertyWithRelations['translations'],
    locale: SupportedLocale,
  ) {
    return (
      translations.find((t) => t.locale === locale) ??
      translations.find((t) => t.locale === DEFAULT_LOCALE) ??
      translations[0]
    );
  }

  private toSummary(property: PropertyWithRelations, locale: SupportedLocale): PropertySummaryDto {
    const translation = this.resolveTranslation(property.translations, locale);
    const cover = property.media.find((m) => m.type === 'PHOTO');

    return {
      id: property.id,
      slug: property.slug,
      operationType: property.operationType,
      price: Number(property.price),
      currency: property.currency,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parkingSpots: property.parkingSpots,
      builtAreaM2: Number(property.builtAreaM2),
      status: property.status,
      isFeatured: property.isFeatured,
      coverImageUrl: cover?.url ?? null,
      location: {
        city: {
          id: property.city.id,
          name: property.city.name,
          slug: property.city.slug,
          department: property.city.department,
        },
        neighborhood: property.neighborhood
          ? {
              id: property.neighborhood.id,
              name: property.neighborhood.name,
              slug: property.neighborhood.slug,
            }
          : null,
        addressLine: property.addressLine,
        latitude: property.latitude ? Number(property.latitude) : null,
        longitude: property.longitude ? Number(property.longitude) : null,
      },
      propertyType: {
        id: property.propertyType.id,
        name: property.propertyType.name,
        slug: property.propertyType.slug,
      },
      translation: translation
        ? {
            locale: translation.locale as SupportedLocale,
            title: translation.title,
            subtitle: translation.subtitle,
          }
        : { locale, title: '(sin traducción)', subtitle: null },
    };
  }

  private toDetail(
    property: PropertyWithRelations,
    locale: SupportedLocale,
    related: PropertyWithRelations[],
  ): PropertyDetailDto {
    const summary = this.toSummary(property, locale);
    const { coverImageUrl: _coverImageUrl, ...summaryWithoutCover } = summary;

    return {
      ...summaryWithoutCover,
      landAreaM2: property.landAreaM2 ? Number(property.landAreaM2) : null,
      yearBuilt: property.yearBuilt,
      publishedAt: property.publishedAt ? property.publishedAt.toISOString() : null,
      updatedAt: property.updatedAt.toISOString(),
      media: property.media.map((m) => ({ id: m.id, type: m.type, url: m.url, order: m.order })),
      features: property.features.map((f) => ({
        id: f.feature.id,
        name: f.feature.name,
        slug: f.feature.slug,
      })),
      translations: property.translations.map((t) => ({
        locale: t.locale as SupportedLocale,
        title: t.title,
        subtitle: t.subtitle,
        shortDescription: t.shortDescription,
        fullDescription: t.fullDescription,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        seoCanonicalOverride: t.seoCanonicalOverride,
      })),
      relatedProperties: related.map((r) => this.toSummary(r, locale)),
    };
  }
}
