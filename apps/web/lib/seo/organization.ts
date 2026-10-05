import type { SupportedLocale } from '@/lib/locales';
import { buildAlternatesFor, type PageAlternates } from './alternates';
import { BRAND_NAME, LEGAL_NAME } from './brand';
import { SITE_URL } from './site-url';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Única fuente de datos reales de la entidad Altiora — reutilizada por JSON-LD (Organization)
 * y por cualquier contenido GEO/citable. No agregar campos (redes, horarios, geo, rating) sin
 * un dato real confirmado detrás.
 */
export const ORGANIZATION_INFO = {
  name: BRAND_NAME,
  legalName: LEGAL_NAME,
  telephone: '+57 300 605 0811',
  email: 'info@altiora.com.co',
  logo: `${SITE_URL}/altiora-logo-full.png`,
  streetAddress: 'Calle 20 # 11-18, Laureles',
  addressLocality: 'Cartago',
  addressRegion: 'Valle del Cauca',
  addressCountry: 'CO',
  description:
    'Altiora Construcciones e Inmobiliaria S.A.S. es una inmobiliaria que ofrece servicios de compra, venta, arriendo y asesoría inmobiliaria en Cartago y el norte del Valle del Cauca.',
  knowsAbout: ['Compra de vivienda', 'Venta de propiedades', 'Arriendo', 'Asesoría inmobiliaria'],
} as const;

/**
 * Builds `alternates` (canonical + hreflang) for a public route that exists in every locale.
 * The canonical references the locale being rendered; `x-default` points to es-CO.
 */
export function buildAlternates(locale: SupportedLocale, path: string): PageAlternates {
  return buildAlternatesFor(SITE_URL, locale, path);
}
