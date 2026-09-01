import { NextResponse } from 'next/server';
import type { AuthTokensDto } from '@altiora/shared-types';
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin-session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
// Mismo origen que ya usa apps/api para CORS (main.ts) — un solo valor de verdad.
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

/**
 * Proxy de login: guarda el JWT de NestJS en cookies httpOnly — no se usa NextAuth (v1 corrección 12).
 * Al ser un Route Handler (no un Server Action), Next no aplica su chequeo same-origin automático —
 * lo hacemos explícito acá para evitar login CSRF.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const origin = request.headers.get('origin') ?? request.headers.get('referer');
  if (!origin || !origin.startsWith(WEB_ORIGIN)) {
    return NextResponse.json({ message: 'Origen no permitido' }, { status: 403 });
  }

  const { email, password } = (await request.json()) as { email: string; password: string };

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
  }

  const tokens = (await response.json()) as AuthTokensDto;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  });
  res.cookies.set(ADMIN_REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_ACCESS_COOKIE);
  res.cookies.delete(ADMIN_REFRESH_COOKIE);
  return res;
}
