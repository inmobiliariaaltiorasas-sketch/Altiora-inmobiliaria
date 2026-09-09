const PRODUCTION_URL = 'https://altioraimobiliaria.online';

/** Nunca cae a localhost/túnel: si falta el env, usamos el dominio real de producción. */
export const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? PRODUCTION_URL;

export const ORGANIZATION_ID = `${WEB_URL}/#organization`;
export const WEBSITE_ID = `${WEB_URL}/#website`;

/**
 * Única fuente de datos reales de la entidad Altiora — reutilizada por JSON-LD (Organization)
 * y por cualquier contenido GEO/citable. No agregar campos (redes, horarios, geo, rating) sin
 * un dato real confirmado detrás.
 */
export const ORGANIZATION_INFO = {
  name: 'Altiora Construcciones e Inmobiliaria S.A.S.',
  legalName: 'Altiora Construcciones e Inmobiliaria S.A.S.',
  telephone: '+57 300 605 0811',
  email: 'info@altiora.com.co',
  logo: `${WEB_URL}/altiora-logo-full.png`,
  streetAddress: 'Calle 20 # 11-18, Laureles',
  addressLocality: 'Cartago',
  addressRegion: 'Valle del Cauca',
  addressCountry: 'CO',
  description:
    'Altiora Construcciones e Inmobiliaria S.A.S. es una inmobiliaria que ofrece servicios de compra, venta, arriendo y asesoría inmobiliaria en Cartago y el norte del Valle del Cauca.',
  knowsAbout: ['Compra de vivienda', 'Venta de propiedades', 'Arriendo', 'Asesoría inmobiliaria'],
} as const;

/** Construye `alternates` (canonical + hreflang) para una ruta pública dada, sin locale. */
export function buildAlternates(path: string) {
  const clean = path === '' ? '' : path.startsWith('/') ? path : `/${path}`;
  return {
    canonical: `${WEB_URL}/es-CO${clean}`,
    languages: {
      'es-CO': `${WEB_URL}/es-CO${clean}`,
      'en-US': `${WEB_URL}/en-US${clean}`,
    },
  };
}
