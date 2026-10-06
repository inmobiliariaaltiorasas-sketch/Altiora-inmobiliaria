import type { MetadataRoute } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/locales';

interface LocalizedEntry {
  slug: string;
  updatedAt: string;
  locales: string[];
}

export interface SitemapInput {
  baseUrl: string;
  staticPaths: readonly string[];
  cities: readonly { slug: string }[];
  /** Category landing pages that exist (at least one public property), per city. */
  categories: readonly { citySlug: string; slug: string }[];
  properties: readonly LocalizedEntry[];
  posts: readonly LocalizedEntry[];
}

type SitemapEntry = MetadataRoute.Sitemap[number];

function urlFor(baseUrl: string, locale: SupportedLocale, path: string): string {
  return `${baseUrl}/${locale}${path}`;
}

/** One sitemap entry per existing locale, each carrying the same hreflang alternates. */
function localizedEntries(
  baseUrl: string,
  path: string,
  locales: readonly SupportedLocale[],
  extra: Pick<SitemapEntry, 'lastModified' | 'changeFrequency'>,
): SitemapEntry[] {
  if (locales.length === 0) return [];

  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = urlFor(baseUrl, locale, path);
  const xDefaultLocale = locales.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : (locales[0] ?? DEFAULT_LOCALE);
  languages['x-default'] = urlFor(baseUrl, xDefaultLocale, path);

  return locales.map((locale) => ({
    url: urlFor(baseUrl, locale, path),
    ...extra,
    alternates: { languages },
  }));
}

/**
 * An API deployed before `locales` existed sends none: list the default locale only, so the web
 * app can be deployed ahead of the API without breaking the sitemap.
 */
function knownLocales(locales: readonly string[] | undefined): SupportedLocale[] {
  if (!locales) return [DEFAULT_LOCALE];
  return SUPPORTED_LOCALES.filter((locale) => locales.includes(locale));
}

/**
 * Pure sitemap builder. Static pages, cities and categories exist in every locale; properties and posts are
 * listed only in the locales that have a real translation, so untranslated fallback URLs never
 * reach the sitemap.
 */
export function buildSitemapEntries(input: SitemapInput): MetadataRoute.Sitemap {
  const { baseUrl } = input;
  const entries: MetadataRoute.Sitemap = [];

  for (const path of input.staticPaths) {
    entries.push(
      ...localizedEntries(baseUrl, path, SUPPORTED_LOCALES, { changeFrequency: 'weekly' }),
    );
  }
  for (const city of input.cities) {
    entries.push(
      ...localizedEntries(baseUrl, `/ciudades/${city.slug}`, SUPPORTED_LOCALES, {
        changeFrequency: 'weekly',
      }),
    );
  }
  for (const category of input.categories) {
    entries.push(
      ...localizedEntries(
        baseUrl,
        `/ciudades/${category.citySlug}/${category.slug}`,
        SUPPORTED_LOCALES,
        { changeFrequency: 'weekly' },
      ),
    );
  }
  for (const property of input.properties) {
    entries.push(
      ...localizedEntries(
        baseUrl,
        `/propiedades/${property.slug}`,
        knownLocales(property.locales),
        {
          lastModified: property.updatedAt,
          changeFrequency: 'daily',
        },
      ),
    );
  }
  for (const post of input.posts) {
    entries.push(
      ...localizedEntries(baseUrl, `/blog/${post.slug}`, knownLocales(post.locales), {
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
      }),
    );
  }

  return entries;
}
