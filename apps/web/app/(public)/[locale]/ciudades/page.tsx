import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { getLocationsTree } from '@/lib/api/locations';

const COPY: Record<SupportedLocale, { title: string; lede: string; neighborhoods: string }> = {
  'es-CO': {
    title: 'Ciudades',
    lede: 'Explorá el catálogo de ALTiora por ciudad.',
    neighborhoods: 'barrios',
  },
  'en-US': {
    title: 'Cities',
    lede: 'Explore the ALTiora catalog by city.',
    neighborhoods: 'neighborhoods',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  return { title: `${COPY[locale].title} | ALTiora`, description: COPY[locale].lede };
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

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem 3rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>{copy.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{copy.lede}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          gap: '1.25rem',
          marginTop: '2rem',
        }}
      >
        {cities.map((city) => (
          <Link
            key={city.id}
            href={`/${locale}/ciudades/${city.slug}`}
            className="card"
            style={{ padding: '1.25rem', textDecoration: 'none', color: 'var(--text)' }}
          >
            <h2 style={{ fontSize: '1.2rem' }}>{city.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              {city.department}
              {city.neighborhoods.length > 0
                ? ` · ${city.neighborhoods.length} ${copy.neighborhoods}`
                : ''}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
