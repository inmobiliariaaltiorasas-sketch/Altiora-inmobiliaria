import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { PropertySearchForm, type QuickSearchLink } from '@/components/blocks/PropertySearchForm';
import { Hero } from '@/components/sections/Hero';
import { ResourcesBlock } from '@/components/sections/ResourcesBlock';
import { WhyAltiora } from '@/components/sections/WhyAltiora';
import { BrandBlock } from '@/components/sections/BrandBlock';
import { FinalCta } from '@/components/sections/FinalCta';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getPropertyTypes } from '@/lib/api/catalog';
import styles from './page.module.css';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const COPY: Record<
  SupportedLocale,
  { title: string; description: string; featured: string; seeAll: string }
> = {
  'es-CO': {
    title: 'ALTiora — Casas y apartamentos en Cartago, Valle del Cauca',
    description:
      'Propiedades verificadas en Cartago con precios reales y visibles, sin registro. Busca casas, apartamentos y lotes, y habla con un asesor cuando vos decidas.',
    featured: 'Propiedades destacadas',
    seeAll: 'Ver todas →',
  },
  'en-US': {
    title: 'ALTiora — Houses and apartments in Cartago, Valle del Cauca',
    description:
      'Verified properties in Cartago with real, visible prices and no sign-up required. Search houses, apartments and lots, and talk to an advisor whenever you decide.',
    featured: 'Featured properties',
    seeAll: 'See all →',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const url = `${WEB_URL}/${locale}`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: url },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: 'ALTiora',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];

  const [results, locations, propertyTypes] = await Promise.all([
    searchProperties({ locale, pageSize: 8 }),
    getLocationsTree(),
    getPropertyTypes(),
  ]);

  const cartago = locations[0];
  const findType = (slug: string) => propertyTypes.find((type) => type.slug === slug);

  const quickSearches: QuickSearchLink[] = [];
  const casa = findType('casa');
  if (casa) {
    quickSearches.push({
      label: locale === 'es-CO' ? 'Casas hasta $500M' : 'Houses up to $500M',
      href: `/${locale}/propiedades?type=${casa.slug}&maxPrice=500000000`,
    });
  }
  const apartamento = findType('apartamento');
  if (apartamento) {
    quickSearches.push({
      label: locale === 'es-CO' ? 'Apartamentos' : 'Apartments',
      href: `/${locale}/propiedades?type=${apartamento.slug}`,
    });
  }
  quickSearches.push({
    label: locale === 'es-CO' ? '3+ habitaciones' : '3+ bedrooms',
    href: `/${locale}/propiedades?minBedrooms=3`,
  });
  if (cartago) {
    quickSearches.push({
      label: cartago.name,
      href: `/${locale}/propiedades?city=${cartago.slug}`,
    });
  }
  const lote = findType('lote');
  if (lote) {
    quickSearches.push({
      label: locale === 'es-CO' ? 'Lotes' : 'Lots',
      href: `/${locale}/propiedades?type=${lote.slug}`,
    });
  }

  return (
    <main>
      <Hero locale={locale} featured={results.items} />

      <div className={`container ${styles.searchOverlap}`}>
        <PropertySearchForm
          locale={locale}
          cities={locations}
          propertyTypes={propertyTypes}
          variant="hero"
          quickSearches={quickSearches}
        />
      </div>

      <section className={`container section`}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <h2 style={{ fontSize: '1.6rem' }}>{copy.featured}</h2>
          <Link
            href={`/${locale}/propiedades`}
            style={{ color: 'var(--gold-500)', textDecoration: 'none', fontWeight: 600 }}
          >
            {copy.seeAll}
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
          }}
        >
          {results.items.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              locale={locale}
              featured={property.isFeatured}
            />
          ))}
        </div>
      </section>

      <ResourcesBlock locale={locale} />

      <section className="container section">
        <WhyAltiora locale={locale} />
      </section>

      <section className={`container ${styles.brandSection}`}>
        <BrandBlock />
      </section>

      <FinalCta locale={locale} />
    </main>
  );
}
