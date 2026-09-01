import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AuthenticatedUserDto } from '@altiora/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const ADMIN_ACCESS_COOKIE = 'altiora_admin_at';
export const ADMIN_REFRESH_COOKIE = 'altiora_admin_rt';

export async function getAdminAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
}

/** Server-only: exige sesión admin válida contra NestJS o redirige a /admin/login. */
export async function requireAdminSession(): Promise<{
  token: string;
  user: AuthenticatedUserDto;
}> {
  const token = await getAdminAccessToken();
  if (!token) redirect('/admin/login');

  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) redirect('/admin/login');

  const user = (await response.json()) as AuthenticatedUserDto;
  return { token, user };
}
