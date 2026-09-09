import type { SupportedLocale } from '@altiora/shared-types';
import { ORGANIZATION_ID, WEBSITE_ID, WEB_URL } from '@/lib/seo/organization';

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
    name: 'Altiora',
    url: WEB_URL,
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
