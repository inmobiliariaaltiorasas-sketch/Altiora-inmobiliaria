import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getCityFaqs } from '@/lib/api/content';

const COPY: Record<
  SupportedLocale,
  { titleSuffix: string; empty: string; neighborhoods: string; faq: string }
> = {
  'es-CO': {
    titleSuffix: 'propiedades en venta y arriendo',
    empty: 'Todavía no hay propiedades publicadas en esta ciudad.',
    neighborhoods: 'Barrios',
    faq: 'Preguntas frecuentes',
  },
  'en-US': {
    titleSuffix: 'properties for sale and rent',
    empty: 'No properties are published in this city yet.',
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
  return {
    title,
    description: `Catálogo de propiedades ALTiora en ${city.name}, ${city.department}.`,
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
    <main className="container" style={{ padding: '2.5rem 1.5rem 3rem' }}>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <h1 style={{ fontSize: '1.9rem' }}>
        {city.name}, {city.department}
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{copy.titleSuffix}</p>

      {city.neighborhoods.length > 0 ? (
        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">{copy.neighborhoods}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {city.neighborhoods.map((n) => (
              <span
                key={n.id}
                className="badge"
                style={{ background: 'var(--surface-2)', color: 'var(--navy-900)' }}
              >
                {n.name}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {results.items.length === 0 ? (
        <p style={{ marginTop: '1.5rem' }}>{copy.empty}</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            gap: '1.25rem',
            marginTop: '1.5rem',
          }}
        >
          {results.items.map((property) => (
            <PropertyCard key={property.id} property={property} locale={locale} />
          ))}
        </div>
      )}

      {faqs.length > 0 ? (
        <section style={{ marginTop: '3rem', maxWidth: '42rem' }}>
          <h2 style={{ fontSize: '1.3rem' }}>{copy.faq}</h2>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {faqs.map((faq) => (
              <details key={faq.id} className="card" style={{ padding: '0.9rem 1.1rem' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{faq.question}</summary>
                <p style={{ marginTop: '0.6rem', color: 'var(--text)' }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
