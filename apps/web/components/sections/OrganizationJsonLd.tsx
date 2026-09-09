import { ORGANIZATION_ID, ORGANIZATION_INFO, WEB_URL } from '@/lib/seo/organization';

/**
 * Un único bloque `RealEstateAgent` por página pública, en vez de repetirlo en cada ficha/post
 * (v1 sección 9 — consistencia GEO: la misma entidad, con el mismo @id, descrita una sola vez
 * en el layout). Solo propiedades Schema.org respaldadas por datos reales — nada de
 * aggregateRating/review/openingHours/sameAs/geo mientras no existan.
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': ORGANIZATION_ID,
    name: ORGANIZATION_INFO.name,
    legalName: ORGANIZATION_INFO.legalName,
    url: WEB_URL,
    logo: ORGANIZATION_INFO.logo,
    telephone: ORGANIZATION_INFO.telephone,
    email: ORGANIZATION_INFO.email,
    description: ORGANIZATION_INFO.description,
    knowsAbout: ORGANIZATION_INFO.knowsAbout,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION_INFO.streetAddress,
      addressLocality: ORGANIZATION_INFO.addressLocality,
      addressRegion: ORGANIZATION_INFO.addressRegion,
      addressCountry: ORGANIZATION_INFO.addressCountry,
    },
    areaServed: [
      { '@type': 'City', name: 'Cartago' },
      { '@type': 'AdministrativeArea', name: 'Valle del Cauca' },
      { '@type': 'Country', name: 'Colombia' },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
