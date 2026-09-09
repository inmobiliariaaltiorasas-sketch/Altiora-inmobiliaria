import Link from 'next/link';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { PropertySearchForm, type QuickSearchLink } from '@/components/blocks/PropertySearchForm';
import { Hero } from '@/components/sections/Hero';
import { ResourcesBlock } from '@/components/sections/ResourcesBlock';
import { WhyAltiora } from '@/components/sections/WhyAltiora';
import { BrandBlock } from '@/components/sections/BrandBlock';
import { SellPropertySection } from '@/components/sections/SellPropertySection';
import { Testimonials, type Testimonial } from '@/components/sections/Testimonials';
import { FinalCta } from '@/components/sections/FinalCta';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getPropertyTypes } from '@/lib/api/catalog';
import { buildAlternates, ORGANIZATION_INFO } from '@/lib/seo/organization';
import styles from './page.module.css';

// Sin testimonios reales todavía — el componente se oculta solo mientras esta lista esté vacía.
const TESTIMONIALS: Testimonial[] = [];

const COPY: Record<
  SupportedLocale,
  {
    title: string;
    description: string;
    featuredEyebrow: string;
    featuredTitle: string;
    featuredIntro: string;
    seeAll: string;
    trustItems: string[];
    aboutEyebrow: string;
    aboutTitle: string;
    aboutBody: string;
    aboutLinks: { label: string; href: (locale: SupportedLocale) => string }[];
  }
> = {
  'es-CO': {
    title: 'Inmobiliaria en Cartago | Casas, apartamentos y lotes | Altiora',
    description:
      'Encuentra casas, apartamentos y lotes en Cartago, Valle del Cauca. Compra, vende o arrienda con acompañamiento inmobiliario de Altiora.',
    featuredEyebrow: 'SELECCIÓN ALTIORA',
    featuredTitle: 'Propiedades que vale la pena descubrir',
    featuredIntro:
      'Una selección de inmuebles pensados para diferentes estilos de vida e inversión.',
    seeAll: 'Ver todas las propiedades →',
    trustItems: ['Precios reales y visibles', 'Propiedades verificadas', 'Asesoría en cada paso'],
    aboutEyebrow: 'ALTIORA EN CARTAGO',
    aboutTitle: 'Inmobiliaria local en Cartago, Valle del Cauca',
    aboutBody:
      'Altiora Construcciones e Inmobiliaria S.A.S. es una inmobiliaria que ofrece servicios de compra, venta, arriendo y asesoría inmobiliaria en Cartago y el norte del Valle del Cauca. Acompañamos cada proceso con información clara sobre precios y disponibilidad.',
    aboutLinks: [
      { label: 'propiedades en Cartago', href: (l) => `/${l}/propiedades` },
      { label: 'vender tu propiedad', href: (l) => `/${l}/nosotros` },
      { label: 'conocer Cartago', href: (l) => `/${l}/ciudades/cartago-valle-del-cauca` },
    ],
  },
  'en-US': {
    title: 'Real Estate in Cartago | Houses, Apartments and Lots | Altiora',
    description:
      'Find houses, apartments and lots in Cartago, Valle del Cauca. Buy, sell or rent with real estate guidance from Altiora.',
    featuredEyebrow: 'ALTIORA SELECTION',
    featuredTitle: 'Properties worth discovering',
    featuredIntro: 'A selection of properties for different lifestyles and investment goals.',
    seeAll: 'View all properties →',
    trustItems: ['Real, visible prices', 'Verified properties', 'Guidance every step'],
    aboutEyebrow: 'ALTIORA IN CARTAGO',
    aboutTitle: 'Local real estate agency in Cartago, Valle del Cauca',
    aboutBody:
      'Altiora Construcciones e Inmobiliaria S.A.S. is a real estate agency offering buying, selling, renting and real estate advisory services in Cartago and northern Valle del Cauca. We support every process with clear information about prices and availability.',
    aboutLinks: [
      { label: 'properties in Cartago', href: (l) => `/${l}/propiedades` },
      { label: 'sell your property', href: (l) => `/${l}/nosotros` },
      { label: 'explore Cartago', href: (l) => `/${l}/ciudades/cartago-valle-del-cauca` },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  const alternates = buildAlternates('');

  return {
    title: copy.title,
    description: copy.description,
    alternates,
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: alternates.languages[locale],
      siteName: 'ALTiora',
      type: 'website',
      images: [{ url: ORGANIZATION_INFO.logo }],
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
      <Hero locale={locale} />

      <div className={`container ${styles.searchOverlap}`}>
        <PropertySearchForm
          locale={locale}
          cities={locations}
          propertyTypes={propertyTypes}
          variant="hero"
          quickSearches={quickSearches}
        />
        <p className={styles.trustLine}>{copy.trustItems.join(' · ')}</p>
      </div>

      <section className={`container ${styles.aboutSection}`}>
        <span className="eyebrow">{copy.aboutEyebrow}</span>
        <h2 className={styles.aboutTitle}>{copy.aboutTitle}</h2>
        <p className={styles.aboutBody}>
          {copy.aboutBody}{' '}
          {copy.aboutLinks.map((link, index) => (
            <span key={link.label}>
              <Link href={link.href(locale)}>{link.label}</Link>
              {index < copy.aboutLinks.length - 1 ? ' · ' : '.'}
            </span>
          ))}
        </p>
      </section>

      {results.items.length > 0 ? (
        <section className={`container section`}>
          <div className={styles.featuredHeader}>
            <div>
              <span className="eyebrow">{copy.featuredEyebrow}</span>
              <h2 className={styles.featuredTitle}>{copy.featuredTitle}</h2>
              <p className={styles.featuredIntro}>{copy.featuredIntro}</p>
            </div>
            <Link href={`/${locale}/propiedades`} className={`btn btn-outline ${styles.seeAllLink}`}>
              {copy.seeAll}
            </Link>
          </div>
          <div className={styles.propertyGrid}>
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
      ) : null}

      <ResourcesBlock locale={locale} />

      <section className="container section">
        <WhyAltiora locale={locale} />
      </section>

      <section className={`container ${styles.brandSection}`}>
        <BrandBlock />
      </section>

      <SellPropertySection locale={locale} />

      {TESTIMONIALS.length > 0 ? (
        <section className="container section">
          <Testimonials locale={locale} testimonials={TESTIMONIALS} />
        </section>
      ) : null}

      <FinalCta locale={locale} />
    </main>
  );
}
