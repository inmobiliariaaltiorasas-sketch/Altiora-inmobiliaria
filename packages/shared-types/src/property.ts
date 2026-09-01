import type { SupportedLocale } from './locale';

export const PROPERTY_PUBLICATION_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'PAUSED',
  'SOLD',
  'ARCHIVED',
] as const;
export type PropertyPublicationStatus = (typeof PROPERTY_PUBLICATION_STATUSES)[number];

export const OPERATION_TYPES = ['SALE', 'RENT'] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const CURRENCIES = ['COP', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PROPERTY_MEDIA_TYPES = ['PHOTO', 'VIDEO', 'TOUR', 'FLOORPLAN'] as const;
export type PropertyMediaType = (typeof PROPERTY_MEDIA_TYPES)[number];

export const PROPERTY_DOCUMENT_TYPES = ['LEGAL', 'CERTIFICATE', 'ADMINISTRATIVE', 'OTHER'] as const;
export type PropertyDocumentType = (typeof PROPERTY_DOCUMENT_TYPES)[number];

export interface PropertyTranslationDto {
  locale: SupportedLocale;
  title: string;
  subtitle: string | null;
  shortDescription: string;
  fullDescription: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonicalOverride: string | null;
}

/** Solo visible en el admin — nunca se incluye en PropertyDetailDto público (v1 corrección 13). */
export interface PropertyDocumentDto {
  id: string;
  type: PropertyDocumentType;
  fileName: string;
  createdAt: string;
}

export interface PropertyMediaDto {
  id: string;
  type: PropertyMediaType;
  url: string;
  order: number;
}

export interface PropertyLocationDto {
  city: { id: string; name: string; slug: string; department: string };
  neighborhood: { id: string; name: string; slug: string } | null;
  addressLine: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** Tarjeta de listado/buscador — no incluye documentos privados ni todas las traducciones. */
export interface PropertySummaryDto {
  id: string;
  slug: string;
  operationType: OperationType;
  price: number;
  currency: Currency;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  builtAreaM2: number;
  status: PropertyPublicationStatus;
  isFeatured: boolean;
  coverImageUrl: string | null;
  location: PropertyLocationDto;
  propertyType: { id: string; name: string; slug: string };
  translation: Pick<PropertyTranslationDto, 'locale' | 'title' | 'subtitle'>;
}

/** Ficha completa — todo lo que la página pública de propiedad necesita mostrar. */
export interface PropertyDetailDto extends Omit<PropertySummaryDto, 'coverImageUrl'> {
  landAreaM2: number | null;
  yearBuilt: number | null;
  publishedAt: string | null;
  /** Fase 4 GEO — fecha real visible en la ficha, no solo en metadata (v1 sección 9). */
  updatedAt: string;
  media: PropertyMediaDto[];
  features: Array<{ id: string; name: string; slug: string }>;
  translations: PropertyTranslationDto[];
  relatedProperties: PropertySummaryDto[];
}

export interface PropertyFiltersDto {
  citySlug?: string;
  neighborhoodSlug?: string;
  propertyTypeSlug?: string;
  operationType?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minBuiltAreaM2?: number;
  page?: number;
  pageSize?: number;
}

export interface PropertySearchResultDto {
  items: PropertySummaryDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PropertySitemapEntryDto {
  slug: string;
  updatedAt: string;
}

export interface UpsertPropertyTranslationDto {
  locale: SupportedLocale;
  title: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonicalOverride?: string;
}

export interface CreatePropertyDto {
  operationType: OperationType;
  price: number;
  currency?: Currency;
  bedrooms: number;
  bathrooms: number;
  parkingSpots?: number;
  builtAreaM2: number;
  landAreaM2?: number;
  yearBuilt?: number;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
  cityId: string;
  neighborhoodId?: string;
  propertyTypeId: string;
  agentId?: string;
  featureIds?: string[];
  translations: UpsertPropertyTranslationDto[];
}

export type UpdatePropertyDto = Partial<Omit<CreatePropertyDto, 'translations'>> & {
  translations?: UpsertPropertyTranslationDto[];
};

export interface UpdatePropertyPriceDto {
  price: number;
  currency?: Currency;
}
