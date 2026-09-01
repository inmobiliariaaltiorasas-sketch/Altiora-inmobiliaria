import { getRequestConfig } from 'next-intl/server';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@altiora/shared-types';

/**
 * Fuente única de la config de next-intl. `requestLocale` viene del middleware para rutas
 * `/[locale]/...`; en `/admin` (fuera del matcher del middleware, es interno y solo en español)
 * cae al default — evita forzar locale en un panel que nunca se tradujo.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const negotiated = await requestLocale;
  const locale: SupportedLocale =
    negotiated && SUPPORTED_LOCALES.includes(negotiated as SupportedLocale)
      ? (negotiated as SupportedLocale)
      : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
