import createMiddleware from 'next-intl/middleware';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@altiora/shared-types';

export default createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});

/** Nunca corre sobre /admin — el panel es interno y siempre en español (v1 sección 12). */
export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
