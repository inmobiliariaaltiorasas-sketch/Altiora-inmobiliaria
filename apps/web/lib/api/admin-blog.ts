import type { BlogPostDetailDto, BlogPostSummaryDto } from '@altiora/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function listAdminBlogPosts(token: string): Promise<BlogPostSummaryDto[]> {
  const response = await fetch(`${API_URL}/blog/admin`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`No se pudo listar los artículos (${response.status})`);
  return response.json();
}

export async function getAdminBlogPost(
  token: string,
  id: string,
): Promise<BlogPostDetailDto | null> {
  const response = await fetch(`${API_URL}/blog/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return response.json();
}
