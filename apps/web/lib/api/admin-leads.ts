import type { LeadDetailDto, LeadSummaryDto } from '@altiora/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function listAdminLeads(token: string): Promise<LeadSummaryDto[]> {
  const response = await fetch(`${API_URL}/admin/leads`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`No se pudo listar leads (${response.status})`);
  return response.json();
}

export async function getAdminLead(token: string, id: string): Promise<LeadDetailDto | null> {
  const response = await fetch(`${API_URL}/admin/leads/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}
