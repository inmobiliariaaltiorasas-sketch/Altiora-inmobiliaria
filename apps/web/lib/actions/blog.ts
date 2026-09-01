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

export async function createBlogPostAction(formData: FormData): Promise<void> {
  const payload = {
    needsReview: formData.get('needsReview') === 'on',
    translations: [
      {
        locale: 'es-CO',
        title: formData.get('title_es'),
        excerpt: formData.get('excerpt_es'),
        body: formData.get('body_es'),
      },
    ],
  };

  const response = await authedFetch('/blog', { method: 'POST', body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`No se pudo crear el artículo (${response.status})`);

  const created = (await response.json()) as { id: string };
  revalidatePath('/admin/blog');
  redirect(`/admin/blog/${created.id}`);
}

export async function updateBlogPostAction(id: string, formData: FormData): Promise<void> {
  const response = await authedFetch(`/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      translations: [
        {
          locale: 'es-CO',
          title: formData.get('title_es'),
          excerpt: formData.get('excerpt_es'),
          body: formData.get('body_es'),
        },
      ],
    }),
  });
  if (!response.ok) throw new Error(`No se pudo actualizar el artículo (${response.status})`);
  revalidatePath(`/admin/blog/${id}`);
}

export async function publishBlogPostAction(id: string): Promise<void> {
  const response = await authedFetch(`/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'PUBLISHED' }),
  });
  if (!response.ok) throw new Error(`No se pudo publicar el artículo (${response.status})`);
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath('/admin/blog');
}

export async function unpublishBlogPostAction(id: string): Promise<void> {
  const response = await authedFetch(`/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'DRAFT' }),
  });
  if (!response.ok) throw new Error(`No se pudo pasar a borrador (${response.status})`);
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath('/admin/blog');
}
