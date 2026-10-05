import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/locales';

export interface PageAlternates {
  canonical: string;
  languages: Record<string, string>;
}

function normalizePath(path: string): string {
  if (path === '') return '';
  return path.startsWith('/') ? path : `/${path}`;
}

function localeUrl(baseUrl: string, locale: SupportedLocale, path: string): string {
  return `${baseUrl}/${locale}${normalizePath(path)}`;
}

/**
 * Canonical + hreflang for a page that exists in every supported locale. The canonical always
 * references the locale being rendered; `x-default` points to the default locale (es-CO).
 */
export function buildAlternatesFor(
  baseUrl: string,
  locale: SupportedLocale,
  path: string,
): PageAlternates {
  const languages: Record<string, string> = {};
  for (const supported of SUPPORTED_LOCALES) {
    languages[supported] = localeUrl(baseUrl, supported, path);
  }
  languages['x-default'] = localeUrl(baseUrl, DEFAULT_LOCALE, path);
  return { canonical: localeUrl(baseUrl, locale, path), languages };
}

/**
 * Canonical + hreflang for a detail page whose translations may be partial. The API serves a
 * fallback translation when the requested locale has none, so that URL must not claim to be its
 * own canonical nor be advertised as a language alternate: it canonicalises to the default
 * locale and only locales with a real translation are listed.
 */
export function resolveDetailAlternates(input: {
  baseUrl: string;
  locale: SupportedLocale;
  path: string;
  availableLocales: readonly string[];
  canonicalOverride?: string | null;
}): PageAlternates {
  const { baseUrl, locale, path, availableLocales } = input;
  const existing = SUPPORTED_LOCALES.filter((supported) => availableLocales.includes(supported));

  const languages: Record<string, string> = {};
  for (const supported of existing) {
    languages[supported] = localeUrl(baseUrl, supported, path);
  }
  const xDefaultLocale = existing.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : (existing[0] ?? DEFAULT_LOCALE);
  languages['x-default'] = localeUrl(baseUrl, xDefaultLocale, path);

  const computedCanonical = existing.includes(locale)
    ? localeUrl(baseUrl, locale, path)
    : localeUrl(baseUrl, DEFAULT_LOCALE, path);
  const override = input.canonicalOverride?.trim();

  return { canonical: override ? override : computedCanonical, languages };
}
