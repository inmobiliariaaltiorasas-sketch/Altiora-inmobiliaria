import type {
  OperationType,
  PropertyDetailDto,
  PropertyFacetDto,
  PropertySearchResultDto,
  PropertySitemapEntryDto,
  SupportedLocale,
} from '@altiora/shared-types';
import { ApiError, apiClient } from '@/lib/api-client';

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
  } catch (error) {
    // Only a definitive 404 means "gone"; any other failure must surface as a 5xx.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function listSitemapEntries(): Promise<PropertySitemapEntryDto[]> {
  return apiClient('/properties/sitemap-entries', { next: { revalidate: 3600 } });
}

/**
 * Public inventory per city, type and operation. Categories are an enhancement, so any failure
 * (a 404 from an API deployed before this endpoint, a 5xx, a network error) degrades to "no
 * categories" instead of breaking the page or the sitemap that asked for them.
 */
export async function listPropertyFacets(): Promise<PropertyFacetDto[]> {
  try {
    const facets = await apiClient<unknown>('/properties/facets', { next: { revalidate: 60 } });
    return Array.isArray(facets) ? (facets as PropertyFacetDto[]) : [];
  } catch {
    return [];
  }
}
