'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdminAccessToken } from '@/lib/admin-session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function updateFxRateAction(formData: FormData): Promise<void> {
  const token = await getAdminAccessToken();
  if (!token) redirect('/admin/login');

  const response = await fetch(`${API_URL}/admin/settings/fx-rate-usd-cop`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ rate: Number(formData.get('rate')) }),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar la tasa (${response.status})`);

  revalidatePath('/admin/configuracion');
  revalidatePath('/[locale]/propiedades/[slug]', 'page');
}
