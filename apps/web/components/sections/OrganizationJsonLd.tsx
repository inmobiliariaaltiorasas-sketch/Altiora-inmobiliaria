const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

/**
 * Un único bloque `Organization` por página pública, en vez de repetirlo en cada ficha/post
 * (v1 sección 9 — consistencia GEO: la misma entidad, descrita una sola vez en el layout).
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ALTiora Construcciones e Inmobiliaria S.A.S.',
    url: WEB_URL,
    areaServed: { '@type': 'City', name: 'Cartago', containedInPlace: 'Valle del Cauca, Colombia' },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
