import type { PropertyDetailDto, PropertySearchResultDto } from '@altiora/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function listAdminProperties(token: string): Promise<PropertySearchResultDto> {
  const response = await fetch(`${API_URL}/properties/admin?pageSize=50`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`No se pudo listar propiedades (${response.status})`);
  return response.json();
}

export async function getAdminProperty(
  token: string,
  id: string,
): Promise<PropertyDetailDto | null> {
  const response = await fetch(`${API_URL}/properties/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}
