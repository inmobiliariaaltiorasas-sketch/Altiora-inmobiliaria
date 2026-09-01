import type {
  OperationType,
  PropertyDetailDto,
  PropertySearchResultDto,
  PropertySitemapEntryDto,
  SupportedLocale,
} from '@altiora/shared-types';
import { apiClient } from '@/lib/api-client';

export interface PropertySearchParams {
  city?: string;
  neighborhood?: string;
  type?: string;
  operation?: OperationType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minBuiltAreaM2?: number;
  page?: number;
  pageSize?: number;
  locale: SupportedLocale;
}

function toQueryString(params: PropertySearchParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return query.toString();
}

export function searchProperties(params: PropertySearchParams): Promise<PropertySearchResultDto> {
  return apiClient(`/properties?${toQueryString(params)}`, { next: { revalidate: 60 } });
}

export async function getPropertyBySlug(
  slug: string,
  locale: SupportedLocale,
): Promise<PropertyDetailDto | null> {
  try {
    return await apiClient(`/properties/${slug}?locale=${locale}`, {
      next: { revalidate: 60, tags: [`property:${slug}`] },
    });
  } catch {
    return null;
  }
}

export function listSitemapEntries(): Promise<PropertySitemapEntryDto[]> {
  return apiClient('/properties/sitemap-entries', { next: { revalidate: 3600 } });
}
