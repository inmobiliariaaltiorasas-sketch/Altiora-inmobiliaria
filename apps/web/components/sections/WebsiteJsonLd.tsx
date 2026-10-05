import type { SupportedLocale } from '@altiora/shared-types';
import { ORGANIZATION_ID, WEBSITE_ID } from '@/lib/seo/organization';
import { BRAND_NAME, LEGAL_NAME } from '@/lib/seo/brand';
import { SITE_URL } from '@/lib/seo/site-url';

/**
 * `SearchAction` no se agrega: `/[locale]/propiedades?...` no es una ruta de búsqueda genérica
 * indexable por template (usa parámetros específicos por filtro, no un placeholder `{search_term}`
 * único), así que no cumple el contrato real de SearchAction — agregarla sería declarar algo que
 * no funciona como Google espera.
 */
export function WebsiteJsonLd({ locale }: { locale: SupportedLocale }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: BRAND_NAME,
    alternateName: LEGAL_NAME,
    url: SITE_URL,
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
