import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { getLocationsTree } from '@/lib/api/locations';
import { PinIcon } from '@/components/ui/icons';
import { buildAlternates, ORGANIZATION_INFO } from '@/lib/seo/organization';
import styles from './page.module.css';

const COPY: Record<
  SupportedLocale,
  { eyebrow: string; title: string; lede: string; neighborhoods: string; viewProperties: string; empty: string }
> = {
  'es-CO': {
    eyebrow: 'EXPLORA POR ZONAS',
    title: 'Encuentra tu próxima propiedad por ciudad',
    lede: 'Cada zona tiene su propio ritmo y sus propias oportunidades. Elige una ciudad para ver el catálogo verificado de ALTiora ahí.',
    neighborhoods: 'barrios',
    viewProperties: 'Ver propiedades',
    empty: 'Todavía no hay ciudades cargadas en el catálogo.',
  },
  'en-US': {
    eyebrow: 'EXPLORE BY AREA',
    title: 'Find your next property by city',
    lede: 'Every area has its own pace and its own opportunities. Choose a city to see the verified ALTiora catalog there.',
    neighborhoods: 'neighborhoods',
    viewProperties: 'View properties',
    empty: 'No cities are loaded in the catalog yet.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const alternates = buildAlternates('/ciudades');

  return {
    title: `${copy.title} | ALTiora`,
    description: copy.lede,
    alternates,
    openGraph: {
      title: `${copy.title} | ALTiora`,
      description: copy.lede,
      url: alternates.languages[locale],
      siteName: 'ALTiora',
      type: 'website',
      images: [{ url: ORGANIZATION_INFO.logo }],
    },
  };
}

/** Directorio dinámico — solo ciudades reales cargadas por el admin (v1 corrección sección 2). */
export default async function CitiesDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const cities = await getLocationsTree();
  const singleCity = cities.length === 1 ? cities[0] : null;

  return (
    <main>
      <div className={`container ${styles.intro}`}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 className={styles.tagline}>{copy.title}</h1>
        <p className={styles.lede}>{copy.lede}</p>
      </div>

      <section className="container section" style={{ paddingTop: 0 }}>
        {cities.length === 0 ? (
          <p className={`card ${styles.empty}`}>{copy.empty}</p>
        ) : singleCity ? (
          /* Una sola ciudad real todavía — un grid auto-fill dejaría una card chica flotando
             con espacio vacío al lado. En su lugar, una pieza editorial única con el mismo
             peso visual que el resto del sitio, sin inventar ciudades para llenar un grid. */
          <Link
            href={`/${locale}/ciudades/${singleCity.slug}`}
            className={`card ${styles.featureCard}`}
          >
            <span className={styles.featureIcon} aria-hidden="true">
              <PinIcon />
            </span>
            <div className={styles.featureBody}>
              <h2 className={styles.featureName}>{singleCity.name}</h2>
              <p className={styles.featureDepartment}>{singleCity.department}</p>
              {singleCity.neighborhoods.length > 0 ? (
                <div className={styles.cityMeta}>
                  <span
                    className="badge"
                    style={{ background: 'var(--surface-2)', color: 'var(--navy-900)' }}
                  >
                    {singleCity.neighborhoods.length} {copy.neighborhoods}
                  </span>
                </div>
              ) : null}
              <span className={styles.featureCta}>{copy.viewProperties} →</span>
            </div>
          </Link>
        ) : (
          <div className={styles.grid}>
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/${locale}/ciudades/${city.slug}`}
                className={`card ${styles.cityCard}`}
              >
                <span className={styles.cityIcon} aria-hidden="true">
                  <PinIcon />
                </span>
                <h2 className={styles.cityName}>{city.name}</h2>
                <p className={styles.cityDepartment}>{city.department}</p>
                {city.neighborhoods.length > 0 ? (
                  <div className={styles.cityMeta}>
                    <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--navy-900)' }}>
                      {city.neighborhoods.length} {copy.neighborhoods}
                    </span>
                  </div>
                ) : null}
                <span className={styles.cta}>{copy.viewProperties} →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
