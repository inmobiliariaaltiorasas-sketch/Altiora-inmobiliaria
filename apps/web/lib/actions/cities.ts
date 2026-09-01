'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminAccessToken } from '@/lib/admin-session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function authedFetch(path: string, init: RequestInit): Promise<Response> {
  const token = await getAdminAccessToken();
  if (!token) redirect('/admin/login');

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });
}

export async function createCityAction(formData: FormData): Promise<void> {
  const response = await authedFetch('/cities', {
    method: 'POST',
    body: JSON.stringify({
      name: formData.get('name'),
      slug: formData.get('slug'),
      department: formData.get('department'),
      country: formData.get('country') || undefined,
    }),
  });
  if (!response.ok) throw new Error(`No se pudo crear la ciudad (${response.status})`);
  revalidatePath('/admin/ciudades');
  revalidatePath('/[locale]/ciudades', 'page');
}
