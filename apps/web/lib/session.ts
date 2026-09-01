const COOKIE_NAME = 'altiora_sid';
const COOKIE_MAX_AGE_DAYS = 180;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeDays * 86400}; samesite=lax`;
}

/** Identificador de sesión de primera parte — sostiene analítica y atribución de marketing (cliente). */
export function getOrCreateSessionId(): string {
  const existing = readCookie(COOKIE_NAME);
  if (existing) return existing;

  const id = crypto.randomUUID();
  writeCookie(COOKIE_NAME, id, COOKIE_MAX_AGE_DAYS);
  return id;
}
