import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { getPropertyBySlug } from '@/lib/api/properties';
import { getFxRateUsdCop } from '@/lib/api/settings';
import { resolveMediaUrl } from '@/lib/api-client';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { PropertyInquirySection } from '@/components/blocks/PropertyInquirySection';
import { formatArea, formatPrice, formatUsdEstimate } from '@/lib/format';

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const COPY: Record<
  SupportedLocale,
  {
    bedrooms: string;
    bathrooms: string;
    parking: string;
    area: string;
    landArea: string;
    year: string;
    description: string;
    features: string;
    related: string;
    breadcrumbProperties: string;
    updatedAt: string;
    usdEstimate: string;
    availability: Record<string, string>;
  }
> = {
  'es-CO': {
    bedrooms: 'Habitaciones',
    bathrooms: 'Baños',
    parking: 'Parqueaderos',
    area: 'Área construida',
    landArea: 'Área del terreno',
    year: 'Año de construcción',
    description: 'Descripción',
    features: 'Características',
    related: 'Propiedades relacionadas',
    breadcrumbProperties: 'Propiedades',
    updatedAt: 'Actualizado el',
    usdEstimate: 'Estimado (conversión informativa, no oficial)',
    availability: {
      DRAFT: 'Borrador',
      PUBLISHED: 'Disponible',
      PAUSED: 'Pausada',
      SOLD: 'Vendida',
      ARCHIVED: 'Archivada',
    },
  },
  'en-US': {
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    parking: 'Parking spots',
    area: 'Built area',
    landArea: 'Land area',
    year: 'Year built',
    description: 'Description',
    features: 'Features',
    related: 'Related properties',
    breadcrumbProperties: 'Properties',
    updatedAt: 'Updated on',
    usdEstimate: 'Estimate (informational conversion, not official)',
    availability: {
      DRAFT: 'Draft',
      PUBLISHED: 'Available',
      PAUSED: 'Paused',
      SOLD: 'Sold',
      ARCHIVED: 'Archived',
    },
  },
};

interface RouteParams {
  locale: string;
  slug: string;
}

function resolveTranslation(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyBySlug>>>,
  locale: SupportedLocale,
) {
  return property.translations.find((t) => t.locale === locale) ?? property.translations[0];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, slug } = (await params) as { locale: SupportedLocale; slug: string };
  const property = await getPropertyBySlug(slug, locale);
  if (!property) return {};

  const translation = resolveTranslation(property, locale);
  const title = translation?.seoTitle ?? translation?.title ?? slug;
  const description = translation?.seoDescription ?? translation?.shortDescription ?? '';
  const canonical = translation?.seoCanonicalOverride ?? `${WEB_URL}/${locale}/propiedades/${slug}`;
  const image = property.media[0] ? resolveMediaUrl(property.media[0].url) : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, slug } = (await params) as { locale: SupportedLocale; slug: string };
  const [property, fxRate] = await Promise.all([
    getPropertyBySlug(slug, locale),
    getFxRateUsdCop(),
  ]);
  if (!property) notFound();

  const copy = COPY[locale];
  const usdEstimate =
    locale === 'en-US' ? formatUsdEstimate(property.price, property.currency, fxRate) : null;
  const translation = resolveTranslation(property, locale);
  const canonical = `${WEB_URL}/${locale}/propiedades/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: translation?.title,
        description: translation?.shortDescription,
        image: property.media.map((m) => m.url),
        offers: {
          '@type': 'Offer',
          price: property.price,
          priceCurrency: property.currency,
          availability:
            property.status === 'PUBLISHED'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: canonical,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ALTiora', item: `${WEB_URL}/${locale}` },
          {
            '@type': 'ListItem',
            position: 2,
            name: copy.breadcrumbProperties,
            item: `${WEB_URL}/${locale}/propiedades`,
          },
          { '@type': 'ListItem', position: 3, name: translation?.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="container" style={{ padding: '2rem 1.5rem 3rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <span className="badge">{copy.availability[property.status]}</span>
      <h1 style={{ fontSize: '1.9rem', marginTop: '0.6rem' }}>{translation?.title}</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        {property.location.neighborhood ? `${property.location.neighborhood.name}, ` : ''}
        {property.location.city.name}, {property.location.city.department}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
        {copy.updatedAt} {new Date(property.updatedAt).toLocaleDateString(locale)}
      </p>

      {property.media.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
            gap: '0.6rem',
            marginTop: '1.25rem',
          }}
        >
          {property.media.map((media, index) => (
            <div
              key={media.id}
              style={{
                position: 'relative',
                aspectRatio: '4 / 3',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
              }}
            >
              <Image
                src={resolveMediaUrl(media.url)}
                alt={`${translation?.title} — ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ objectFit: 'cover' }}
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(16rem, 1fr)',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        <div>
          <div className="price" style={{ fontSize: '1.8rem', color: 'var(--navy-900)' }}>
            {formatPrice(property.price, property.currency, locale)}
          </div>
          {usdEstimate ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              ≈ {usdEstimate} · {copy.usdEstimate}
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))',
              gap: '0.9rem',
              marginTop: '1.4rem',
            }}
          >
            <Stat label={copy.bedrooms} value={property.bedrooms} />
            <Stat label={copy.bathrooms} value={property.bathrooms} />
            <Stat label={copy.parking} value={property.parkingSpots} />
            <Stat label={copy.area} value={formatArea(property.builtAreaM2, locale)} />
            {property.landAreaM2 ? (
              <Stat label={copy.landArea} value={formatArea(property.landAreaM2, locale)} />
            ) : null}
            {property.yearBuilt ? <Stat label={copy.year} value={property.yearBuilt} /> : null}
          </div>

          <h2 style={{ fontSize: '1.2rem', marginTop: '2rem' }}>{copy.description}</h2>
          <p style={{ color: 'var(--text)', marginTop: '0.5rem', whiteSpace: 'pre-line' }}>
            {translation?.fullDescription}
          </p>

          {property.features.length > 0 ? (
            <>
              <h2 style={{ fontSize: '1.2rem', marginTop: '2rem' }}>{copy.features}</h2>
              <div
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.7rem' }}
              >
                {property.features.map((feature) => (
                  <span
                    key={feature.id}
                    className="badge"
                    style={{ background: 'var(--surface-2)', color: 'var(--navy-900)' }}
                  >
                    {feature.name}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div>
          <PropertyInquirySection
            propertyId={property.id}
            propertyTitle={translation?.title ?? slug}
            locale={locale}
          />
        </div>
      </div>

      {property.relatedProperties.length > 0 ? (
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>{copy.related}</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
              gap: '1.25rem',
              marginTop: '1rem',
            }}
          >
            {property.relatedProperties.map((related) => (
              <PropertyCard key={related.id} property={related} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
