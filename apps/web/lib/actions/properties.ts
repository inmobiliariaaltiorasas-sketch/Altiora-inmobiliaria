'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
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

export async function createPropertyAction(formData: FormData): Promise<void> {
  const payload = {
    operationType: formData.get('operationType'),
    price: Number(formData.get('price')),
    currency: formData.get('currency') || undefined,
    bedrooms: Number(formData.get('bedrooms')),
    bathrooms: Number(formData.get('bathrooms')),
    parkingSpots: Number(formData.get('parkingSpots') || 0),
    builtAreaM2: Number(formData.get('builtAreaM2')),
    landAreaM2: formData.get('landAreaM2') ? Number(formData.get('landAreaM2')) : undefined,
    cityId: formData.get('cityId'),
    propertyTypeId: formData.get('propertyTypeId'),
    translations: [
      {
        locale: 'es-CO',
        title: formData.get('title_es'),
        shortDescription: formData.get('shortDescription_es'),
        fullDescription: formData.get('fullDescription_es'),
      },
    ],
  };

  const response = await authedFetch('/properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`No se pudo crear la propiedad (${response.status})`);
  }

  const created = (await response.json()) as { id: string };
  revalidatePath('/admin/propiedades');
  redirect(`/admin/propiedades/${created.id}`);
}

export async function updatePropertyPriceAction(
  propertyId: string,
  formData: FormData,
): Promise<void> {
  const response = await authedFetch(`/properties/${propertyId}/price`, {
    method: 'PATCH',
    body: JSON.stringify({ price: Number(formData.get('price')) }),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar el precio (${response.status})`);
  revalidatePath(`/admin/propiedades/${propertyId}`);
}

async function changeStatusAction(
  propertyId: string,
  action: 'publish' | 'pause' | 'mark-sold' | 'archive' | 'feature' | 'unfeature',
): Promise<void> {
  const response = await authedFetch(`/properties/${propertyId}/${action}`, { method: 'POST' });
  if (!response.ok) throw new Error(`No se pudo cambiar el estado (${response.status})`);
  revalidatePath(`/admin/propiedades/${propertyId}`);
  revalidatePath('/admin/propiedades');
}

export async function publishPropertyAction(propertyId: string): Promise<void> {
  await changeStatusAction(propertyId, 'publish');
}

export async function pausePropertyAction(propertyId: string): Promise<void> {
  await changeStatusAction(propertyId, 'pause');
}

export async function markSoldPropertyAction(propertyId: string): Promise<void> {
  await changeStatusAction(propertyId, 'mark-sold');
}

export async function archivePropertyAction(propertyId: string): Promise<void> {
  await changeStatusAction(propertyId, 'archive');
}

export async function featurePropertyAction(propertyId: string): Promise<void> {
  await changeStatusAction(propertyId, 'feature');
}

export async function unfeaturePropertyAction(propertyId: string): Promise<void> {
  await changeStatusAction(propertyId, 'unfeature');
}

export async function deletePropertyAction(propertyId: string): Promise<void> {
  const response = await authedFetch(`/properties/${propertyId}`, { method: 'DELETE' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `No se pudo eliminar la propiedad (${response.status})`);
  }
  revalidatePath('/admin/propiedades');
  redirect('/admin/propiedades');
}

export async function addPropertyMediaAction(
  propertyId: string,
  formData: FormData,
): Promise<void> {
  const token = await getAdminAccessToken();
  if (!token) redirect('/admin/login');

  const type = formData.get('type');
  const files = formData.getAll('file').filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    const singleUpload = new FormData();
    singleUpload.set('type', type ?? 'PHOTO');
    singleUpload.set('file', file);

    const response = await fetch(`${API_URL}/properties/${propertyId}/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: singleUpload,
    });
    if (!response.ok) throw new Error(`No se pudo subir "${file.name}" (${response.status})`);
  }

  revalidatePath(`/admin/propiedades/${propertyId}`);
}

export async function setCoverMediaAction(propertyId: string, mediaId: string): Promise<void> {
  const response = await authedFetch(`/properties/${propertyId}/media/${mediaId}/cover`, {
    method: 'PATCH',
    body: '{}',
  });
  if (!response.ok) throw new Error(`No se pudo marcar como portada (${response.status})`);
  revalidatePath(`/admin/propiedades/${propertyId}`);
}

export async function removePropertyMediaAction(propertyId: string, mediaId: string): Promise<void> {
  const token = await getAdminAccessToken();
  if (!token) redirect('/admin/login');

  const response = await fetch(`${API_URL}/properties/${propertyId}/media/${mediaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`No se pudo eliminar la foto (${response.status})`);
  revalidatePath(`/admin/propiedades/${propertyId}`);
}

export async function updatePropertyStructuralAction(
  propertyId: string,
  formData: FormData,
): Promise<void> {
  const payload = {
    cityId: formData.get('cityId'),
    propertyTypeId: formData.get('propertyTypeId'),
    bedrooms: Number(formData.get('bedrooms')),
    bathrooms: Number(formData.get('bathrooms')),
    parkingSpots: Number(formData.get('parkingSpots') || 0),
    builtAreaM2: Number(formData.get('builtAreaM2')),
    landAreaM2: formData.get('landAreaM2') ? Number(formData.get('landAreaM2')) : undefined,
  };

  const response = await authedFetch(`/properties/${propertyId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar los datos estructurales (${response.status})`);
  revalidatePath(`/admin/propiedades/${propertyId}`);
}

export async function updatePropertyInfoAction(
  propertyId: string,
  formData: FormData,
): Promise<void> {
  const payload = {
    translations: [
      {
        locale: 'es-CO',
        title: formData.get('title_es'),
        shortDescription: formData.get('shortDescription_es'),
        fullDescription: formData.get('fullDescription_es'),
      },
    ],
  };

  const response = await authedFetch(`/properties/${propertyId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar la información (${response.status})`);
  revalidatePath(`/admin/propiedades/${propertyId}`);
}
