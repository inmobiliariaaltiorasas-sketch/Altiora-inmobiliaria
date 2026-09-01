import type { LocationsTreeEntryDto } from '@altiora/shared-types';
import { apiClient } from '@/lib/api-client';

export function getLocationsTree(): Promise<LocationsTreeEntryDto[]> {
  return apiClient('/locations/tree', { next: { revalidate: 3600 } });
}
