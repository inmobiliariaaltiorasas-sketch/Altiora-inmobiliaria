import createMiddleware from 'next-intl/middleware';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@altiora/shared-types';

export default createMiddleware({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  // Altiora es un negocio colombiano: una visita a la raíz sin prefijo de idioma
  // siempre debe caer en es-CO en vez de seguir el header Accept-Language del
  // navegador. `localeDetection: false` desactiva accept-language Y la cookie
  // NEXT_LOCALE para rutas sin prefijo (confirmado leyendo
  // next-intl/dist/esm/production/middleware/resolveLocale.js: ambas señales
  // comparten el mismo flag, no hay opción granular en v4.13.7). No afecta en
  // absoluto a URLs con locale explícito en el path (/en-US/..., /es-CO/...)
  // — esa resolución ocurre antes y siempre gana, así que LocaleSwitcher sigue
  // funcionando igual.
  localeDetection: false,
});

/** Nunca corre sobre /admin — el panel es interno y siempre en español (v1 sección 12). */
export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
};
