import { apiClient } from '@/lib/api-client';

/** Tasa manual, editable por el admin — v1 corrección sección 3: sin API externa de cambio. */
export async function getFxRateUsdCop(): Promise<number> {
  const { rate } = await apiClient<{ rate: number }>('/settings/fx-rate-usd-cop', {
    next: { revalidate: 300 },
  });
  return rate;
}
