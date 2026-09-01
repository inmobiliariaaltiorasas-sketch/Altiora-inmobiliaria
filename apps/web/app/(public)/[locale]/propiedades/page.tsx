import Link from 'next/link';
import type { Metadata } from 'next';
import type { OperationType, SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { PropertySearchForm } from '@/components/blocks/PropertySearchForm';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getPropertyTypes } from '@/lib/api/catalog';

const COPY: Record<
  SupportedLocale,
  {
    title: string;
    description: string;
    empty: string;
    previous: string;
    next: string;
    results: (n: number) => string;
  }
> = {
  'es-CO': {
    title: 'Propiedades en venta y arriendo en Cartago',
    description:
      'Catálogo completo de propiedades en Cartago, Valle del Cauca, con precios y disponibilidad reales.',
    empty:
      'No encontramos propiedades con esos filtros. Probá ampliando el rango de precio o cambiando la ciudad.',
    previous: '← Anterior',
    next: 'Siguiente →',
    results: (n) => `${n} propiedades encontradas`,
  },
  'en-US': {
    title: 'Properties for sale and rent in Cartago',
    description:
      'Full catalog of properties in Cartago, Valle del Cauca, with real prices and availability.',
    empty:
      'No properties matched those filters. Try widening the price range or changing the city.',
    previous: '← Previous',
    next: 'Next →',
    results: (n) => `${n} properties found`,
  },
};

type SearchParams = Record<string, string | undefined>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  return { title: COPY[locale].title, description: COPY[locale].description };
}

export default async function PropertiesSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const sp = await searchParams;
  const copy = COPY[locale];

  const page = sp.page ? Number(sp.page) : 1;
  const [results, locations, propertyTypes] = await Promise.all([
    searchProperties({
      locale,
      city: sp.city,
      type: sp.type,
      operation: sp.operation as OperationType | undefined,
      minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
      maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
      minBedrooms: sp.minBedrooms ? Number(sp.minBedrooms) : undefined,
      page,
      pageSize: 12,
    }),
    getLocationsTree(),
    getPropertyTypes(),
  ]);

  const totalPages = Math.max(1, Math.ceil(results.total / results.pageSize));

  const pageLink = (targetPage: number) => {
    const query = new URLSearchParams(sp as Record<string, string>);
    query.set('page', String(targetPage));
    return `/${locale}/propiedades?${query.toString()}`;
  };

  return (
    <main className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <h1 style={{ fontSize: '1.9rem' }}>{copy.title}</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>{copy.description}</p>

      <div style={{ marginTop: '1.5rem' }}>
        <PropertySearchForm
          locale={locale}
          cities={locations}
          propertyTypes={propertyTypes}
          defaults={sp as Record<string, string>}
        />
      </div>

      <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
        {copy.results(results.total)}
      </p>

      {results.items.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>{copy.empty}</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            gap: '1.25rem',
            marginTop: '1rem',
          }}
        >
          {results.items.map((property) => (
            <PropertyCard key={property.id} property={property} locale={locale} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
          {page > 1 ? (
            <Link href={pageLink(page - 1)} className="btn btn-outline">
              {copy.previous}
            </Link>
          ) : null}
          {page < totalPages ? (
            <Link href={pageLink(page + 1)} className="btn btn-outline">
              {copy.next}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
