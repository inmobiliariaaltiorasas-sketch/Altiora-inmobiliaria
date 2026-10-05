import { SUPPORTED_LOCALES, type SupportedLocale } from '@altiora/shared-types';

interface SitemapSource {
  slug: string;
  updatedAt: Date;
  translations: { locale: string }[];
}

/**
 * Shared mapper for the public `sitemap-entries` endpoints. `locales` lists only the locales that
 * have a real translation row, so the web sitemap never advertises fallback-language URLs.
 */
export function toSitemapEntry(source: SitemapSource): {
  slug: string;
  updatedAt: string;
  locales: SupportedLocale[];
} {
  const present = new Set(source.translations.map((t) => t.locale));
  return {
    slug: source.slug,
    updatedAt: source.updatedAt.toISOString(),
    locales: SUPPORTED_LOCALES.filter((locale) => present.has(locale)),
  };
}
