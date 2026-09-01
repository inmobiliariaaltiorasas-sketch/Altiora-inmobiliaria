import type {
  Currency,
  OperationType,
  PropertyDetailDto,
  PropertyPublicationStatus,
  PropertySearchResultDto,
  PropertySitemapEntryDto,
  SupportedLocale,
} from '@altiora/shared-types';

export const PROPERTIES_REPOSITORY = Symbol('PROPERTIES_REPOSITORY');

export interface PropertySearchFilters {
  citySlug?: string;
  neighborhoodSlug?: string;
  propertyTypeSlug?: string;
  operationType?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minBuiltAreaM2?: number;
  page: number;
  pageSize: number;
  locale: SupportedLocale;
  /** Solo el admin puede ver DRAFT/PAUSED/SOLD/ARCHIVED en el listado. */
  includeUnpublished?: boolean;
}

export interface PropertyTranslationInput {
  locale: SupportedLocale;
  title: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonicalOverride?: string;
}

export interface CreatePropertyInput {
  slug: string;
  operationType: OperationType;
  price: number;
  currency: Currency;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
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
  featureIds: string[];
  translations: PropertyTranslationInput[];
}

export type UpdatePropertyInput = Partial<
  Omit<CreatePropertyInput, 'slug' | 'translations' | 'featureIds'>
> & {
  translations?: PropertyTranslationInput[];
  featureIds?: string[];
};

export interface PropertySnapshot {
  price: number;
  currency: Currency;
  status: PropertyPublicationStatus;
}

export interface PropertiesRepository {
  search(filters: PropertySearchFilters): Promise<PropertySearchResultDto>;
  findPublicBySlug(slug: string, locale: SupportedLocale): Promise<PropertyDetailDto | null>;
  findAdminById(id: string, locale: SupportedLocale): Promise<PropertyDetailDto | null>;
  existsBySlug(slug: string): Promise<boolean>;
  create(input: CreatePropertyInput): Promise<{ id: string; slug: string }>;
  update(id: string, input: UpdatePropertyInput): Promise<void>;
  remove(id: string): Promise<void>;
  setFeatured(id: string, isFeatured: boolean): Promise<void>;
  updateStatus(id: string, status: PropertyPublicationStatus): Promise<void>;
  updatePrice(id: string, price: number, currency?: Currency): Promise<void>;
  getSnapshot(id: string): Promise<PropertySnapshot | null>;
  listSitemapEntries(): Promise<PropertySitemapEntryDto[]>;
}
