import Link from 'next/link';
import type { Metadata } from 'next';
import type { OperationType, SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { PropertySearchForm } from '@/components/blocks/PropertySearchForm';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getPropertyTypes } from '@/lib/api/catalog';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import styles from './page.module.css';

const COPY: Record<
  SupportedLocale,
  {
    title: string;
    description: string;
    emptyFiltered: string;
    resetFilters: string;
    emptyCatalogTitle: string;
    emptyCatalogBody: string;
    emptyCatalogContactCta: string;
    emptyCatalogWhatsappCta: string;
    previous: string;
    next: string;
    results: (n: number) => string;
  }
> = {
  'es-CO': {
    title: 'Propiedades en venta y arriendo en Cartago',
    description:
      'Catálogo completo de propiedades en Cartago, Valle del Cauca, con precios y disponibilidad reales.',
    emptyFiltered:
      'No encontramos propiedades con esos filtros. Probá ampliando el rango de precio o cambiando la ciudad.',
    resetFilters: 'Quitar filtros',
    emptyCatalogTitle: 'Estamos preparando nuevas oportunidades',
    emptyCatalogBody:
      'Nuestro inventario se actualiza constantemente. Habla con un asesor de Altiora para conocer propiedades disponibles o próximas a publicarse.',
    emptyCatalogContactCta: 'Hablar con un asesor',
    emptyCatalogWhatsappCta: 'Hablar por WhatsApp',
    previous: '← Anterior',
    next: 'Siguiente →',
    results: (n) => `${n} propiedades encontradas`,
  },
  'en-US': {
    title: 'Properties for sale and rent in Cartago',
    description:
      'Full catalog of properties in Cartago, Valle del Cauca, with real prices and availability.',
    emptyFiltered:
      'No properties matched those filters. Try widening the price range or changing the city.',
    resetFilters: 'Clear filters',
    emptyCatalogTitle: "We're preparing new opportunities",
    emptyCatalogBody:
      'Our inventory updates constantly. Talk to an Altiora advisor to learn about available properties or listings coming soon.',
    emptyCatalogContactCta: 'Talk to an advisor',
    emptyCatalogWhatsappCta: 'Chat on WhatsApp',
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

  /**
   * Con 0 resultados hay que distinguir "no hay ningún inmueble publicado" de "estos filtros no
   * matchean nada" — son estados de negocio distintos y el copy no puede ser el mismo. Si ya se
   * aplicó algún filtro, un segundo fetch liviano (pageSize:1, sin filtros) confirma si el
   * catálogo global tiene contenido; sin filtros, el propio resultado ya lo confirma.
   */
  let catalogHasPublishedProperties = true;
  if (results.items.length === 0) {
    const hasFilters = Boolean(
      sp.city || sp.type || sp.operation || sp.minPrice || sp.maxPrice || sp.minBedrooms,
    );
    catalogHasPublishedProperties = hasFilters
      ? (await searchProperties({ locale, pageSize: 1 })).total > 0
      : false;
  }

  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? 'Hola, quisiera recibir asesoría para encontrar una propiedad.'
      : 'Hi, I would like guidance to find a property.',
  );

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

      {catalogHasPublishedProperties ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          {copy.results(results.total)}
        </p>
      ) : null}

      {results.items.length === 0 ? (
        catalogHasPublishedProperties ? (
          <div className={styles.filteredEmpty}>
            <p>{copy.emptyFiltered}</p>
            <Link href={`/${locale}/propiedades`} className="btn btn-outline">
              {copy.resetFilters}
            </Link>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>{copy.emptyCatalogTitle}</h2>
            <p className={styles.emptyBody}>{copy.emptyCatalogBody}</p>
            <div className={styles.emptyActions}>
              <Link href={`/${locale}/contacto`} className="btn btn-primary">
                {copy.emptyCatalogContactCta}
              </Link>
              {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                  {copy.emptyCatalogWhatsappCta}
                </a>
              ) : null}
            </div>
          </div>
        )
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
