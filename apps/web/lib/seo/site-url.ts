export const PRODUCTION_URL = 'https://altioraimobiliaria.online';
const DEVELOPMENT_URL = 'http://localhost:3000';

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']);

function parseOrigin(value: string | undefined): URL | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

/**
 * Resolves the public site origin (no trailing slash). Only an explicit `development`
 * NODE_ENV may produce a localhost origin; every other environment (including unset) falls
 * back to the production domain, so a missing or local env var can never reach the sitemap,
 * robots or canonical URLs of a production build.
 */
export function resolveSiteUrl(input: {
  envUrl: string | undefined;
  nodeEnv: string | undefined;
}): string {
  const isDevelopment = input.nodeEnv === 'development';
  const parsed = parseOrigin(input.envUrl);

  if (parsed && (isDevelopment || !LOCAL_HOSTNAMES.has(parsed.hostname))) {
    return (input.envUrl as string).trim().replace(/\/+$/, '');
  }
  return isDevelopment ? DEVELOPMENT_URL : PRODUCTION_URL;
}

/** Single source of truth for the site origin. Keeps the existing `NEXT_PUBLIC_WEB_URL` name. */
export const SITE_URL = resolveSiteUrl({
  envUrl: process.env.NEXT_PUBLIC_WEB_URL,
  nodeEnv: process.env.NODE_ENV,
});
