import type { PropertyFeatureDto, PropertyTypeDto } from '@altiora/shared-types';
import { apiClient } from '@/lib/api-client';

export function getPropertyTypes(): Promise<PropertyTypeDto[]> {
  return apiClient('/property-types', { next: { revalidate: 3600 } });
}

export function getPropertyFeatures(): Promise<PropertyFeatureDto[]> {
  return apiClient('/property-features', { next: { revalidate: 3600 } });
}
