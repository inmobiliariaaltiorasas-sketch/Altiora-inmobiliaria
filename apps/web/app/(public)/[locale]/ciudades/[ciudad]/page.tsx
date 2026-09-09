import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getCityFaqs } from '@/lib/api/content';
import styles from './page.module.css';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const COPY: Record<
  SupportedLocale,
  {
    breadcrumbCities: string;
    titleSuffix: string;
    empty: string;
    emptyCta: string;
    neighborhoods: string;
    faq: string;
  }
> = {
  'es-CO': {
    breadcrumbCities: 'Ciudades',
    titleSuffix: 'propiedades en venta y arriendo',
    empty: 'Todavía no hay propiedades publicadas en esta zona.',
    emptyCta: 'Hablar con un asesor',
    neighborhoods: 'Barrios',
    faq: 'Preguntas frecuentes',
  },
  'en-US': {
    breadcrumbCities: 'Cities',
    titleSuffix: 'properties for sale and rent',
    empty: 'No properties are published in this city yet.',
    emptyCta: 'Talk to an advisor',
    neighborhoods: 'Neighborhoods',
    faq: 'Frequently asked questions',
  },
};

interface RouteParams {
  locale: string;
  ciudad: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, ciudad } = (await params) as { locale: SupportedLocale; ciudad: string };
  const cities = await getLocationsTree();
  const city = cities.find((c) => c.slug === ciudad);
  if (!city) return {};

  const title = `${city.name} — ${COPY[locale].titleSuffix} | ALTiora`;
  const description = `Catálogo de propiedades ALTiora en ${city.name}, ${city.department}.`;
  const url = `${WEB_URL}/${locale}/ciudades/${ciudad}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'ALTiora', type: 'website' },
  };
}

export default async function CityPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, ciudad } = (await params) as { locale: SupportedLocale; ciudad: string };
  const copy = COPY[locale];

  const cities = await getLocationsTree();
  const city = cities.find((c) => c.slug === ciudad);
  if (!city) notFound();

  const [results, faqs] = await Promise.all([
    searchProperties({ locale, city: ciudad, pageSize: 24 }),
    getCityFaqs(ciudad, locale),
  ]);

  const faqJsonLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

  return (
    <main>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}

      <nav
        className={`container ${styles.breadcrumb}`}
        aria-label={locale === 'es-CO' ? 'Ruta de navegación' : 'Breadcrumb'}
      >
        <Link href={`/${locale}/ciudades`}>{copy.breadcrumbCities}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{city.name}</span>
      </nav>

      <div className={`container ${styles.intro}`}>
        <h1 className={styles.tagline}>
          {city.name}, {city.department}
        </h1>
        <p className={styles.subtitle}>{copy.titleSuffix}</p>

        {city.neighborhoods.length > 0 ? (
          <div className={styles.neighborhoods}>
            <span className="eyebrow">{copy.neighborhoods}</span>
            <div className={styles.chips}>
              {city.neighborhoods.map((n) => (
                <span key={n.id} className={`badge ${styles.chip}`}>
                  {n.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <section className="container section">
        {results.items.length === 0 ? (
          <div className={`card ${styles.empty}`}>
            <p>{copy.empty}</p>
            <Link href={`/${locale}/contacto`} className="btn btn-primary">
              {copy.emptyCta}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.items.map((property) => (
              <PropertyCard key={property.id} property={property} locale={locale} />
            ))}
          </div>
        )}

        {faqs.length > 0 ? (
          <section className={styles.faqSection} style={{ marginTop: '3.5rem' }}>
            <h2 className={styles.faqTitle}>{copy.faq}</h2>
            <div className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.id} className={`card ${styles.faqItem}`}>
                  <summary className={styles.faqQuestion}>{faq.question}</summary>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
