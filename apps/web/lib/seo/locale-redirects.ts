/**
 * Permanent redirects from the short language codes to the real locale prefixes. Without them
 * next-intl treats `/en` as a path under the default locale and answers `/es-CO/en` (a 404).
 * They live in `next.config.ts` (not in the middleware) because Next applies config redirects
 * before the middleware runs, and they never match `/admin` or `/api`.
 */
export const SHORT_LOCALE_REDIRECTS = [
  { source: '/en/:path*', destination: '/en-US/:path*', permanent: true },
  { source: '/es/:path*', destination: '/es-CO/:path*', permanent: true },
] as const;
