import type { AdminAnalyticsSummaryDto, AnalyticsCampaignsSummaryDto } from '@altiora/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function getCampaignsSummary(token: string): Promise<AnalyticsCampaignsSummaryDto> {
  const response = await fetch(`${API_URL}/analytics/campaigns`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`No se pudo cargar campañas (${response.status})`);
  return response.json();
}

export async function getAdminAnalyticsSummary(token: string): Promise<AdminAnalyticsSummaryDto> {
  const response = await fetch(`${API_URL}/analytics/admin-summary`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`No se pudo cargar analítica (${response.status})`);
  return response.json();
}
