import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { getPropertyBySlug } from '@/lib/api/properties';
import { getFxRateUsdCop } from '@/lib/api/settings';
import { resolveMediaUrl } from '@/lib/api-client';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { PropertyGallery } from '@/components/blocks/PropertyGallery';
import { PropertyContactCard } from '@/components/blocks/PropertyContactCard';
import { PropertyMobileStickyBar } from '@/components/blocks/PropertyMobileStickyBar';
import { PropertyLocationMap } from '@/components/blocks/PropertyLocationMap';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { ShareButton } from '@/components/ui/ShareButton';
import { formatArea, formatPrice, formatUsdEstimate } from '@/lib/format';
import { resolveDetailAlternates } from '@/lib/seo/alternates';
import { buildBreadcrumbList } from '@/lib/seo/breadcrumbs';
import { buildPropertyJsonLd } from '@/lib/seo/property-jsonld';
import { buildSocialMetadata } from '@/lib/seo/social';
import { ORGANIZATION_INFO } from '@/lib/seo/organization';
import { SITE_URL } from '@/lib/seo/site-url';
import styles from './page.module.css';

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
    location: string;
    breadcrumbHome: string;
    breadcrumbProperties: string;
    updatedAt: string;
    usdEstimate: string;
    favorite: string;
    share: string;
    shareCopied: string;
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
    location: 'Ubicación',
    breadcrumbHome: 'Inicio',
    breadcrumbProperties: 'Propiedades',
    updatedAt: 'Actualizado el',
    usdEstimate: 'Estimado (conversión informativa, no oficial)',
    favorite: 'Guardar en favoritos',
    share: 'Compartir',
    shareCopied: 'Link copiado',
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
    location: 'Location',
    breadcrumbHome: 'Home',
    breadcrumbProperties: 'Properties',
    updatedAt: 'Updated on',
    usdEstimate: 'Estimate (informational conversion, not official)',
    favorite: 'Save to favorites',
    share: 'Share',
    shareCopied: 'Link copied',
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

/** Canonical + hreflang shared by the metadata and the structured data of the same page. */
function propertyAlternates(
  property: NonNullable<Awaited<ReturnType<typeof getPropertyBySlug>>>,
  locale: SupportedLocale,
  slug: string,
) {
  const translation = resolveTranslation(property, locale);
  return resolveDetailAlternates({
    baseUrl: SITE_URL,
    locale,
    path: `/propiedades/${slug}`,
    availableLocales: property.translations.map((t) => t.locale),
    // Only an override written for the requested locale applies; a fallback translation's does not.
    canonicalOverride:
      translation?.locale === locale ? translation.seoCanonicalOverride : undefined,
  });
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
  const { canonical, languages } = propertyAlternates(property, locale, slug);
  // Absolute URL: relative media paths point at the API host, not at the web origin.
  const image = property.media[0] ? resolveMediaUrl(property.media[0].url) : undefined;

  return {
    ...buildSocialMetadata({
      rawTitle: title,
      description,
      url: canonical,
      image,
      fallbackImage: ORGANIZATION_INFO.logo,
    }),
    description,
    alternates: { canonical, languages },
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
  // `canonical` is the URL being rendered (share links); `structuredUrl` is the canonical the
  // metadata declares, so the structured data points at the same URL.
  const canonical = `${SITE_URL}/${locale}/propiedades/${slug}`;
  const structuredUrl = propertyAlternates(property, locale, slug).canonical;
  const propertyTitle = translation?.title ?? slug;
  const locationLabel = property.location.neighborhood
    ? `${property.location.neighborhood.name}, ${property.location.city.name}`
    : `${property.location.city.name}, ${property.location.city.department}`;

  const breadcrumb = [
    { name: copy.breadcrumbHome, url: `${SITE_URL}/${locale}` },
    { name: copy.breadcrumbProperties, url: `${SITE_URL}/${locale}/propiedades` },
    {
      name: property.location.city.name,
      url: `${SITE_URL}/${locale}/ciudades/${property.location.city.slug}`,
    },
    { name: propertyTitle, url: structuredUrl },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      buildPropertyJsonLd({ property, translation, url: structuredUrl }),
      // Same trail as the visible breadcrumb below.
      buildBreadcrumbList(breadcrumb),
    ],
  };

  return (
    <main className={`container ${styles.main}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href={`/${locale}`}>{copy.breadcrumbHome}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${locale}/propiedades`}>{copy.breadcrumbProperties}</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/${locale}/ciudades/${property.location.city.slug}`}>
          {property.location.city.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span className={styles.breadcrumbCurrent}>{propertyTitle}</span>
      </nav>

      <div className={styles.titleRow}>
        <div>
          <span className="badge">{copy.availability[property.status]}</span>
          <h1 className={styles.title}>{propertyTitle}</h1>
        </div>
        <div className={styles.headerActions}>
          <ShareButton
            url={canonical}
            title={propertyTitle}
            label={copy.share}
            copiedLabel={copy.shareCopied}
          />
          <FavoriteButton label={copy.favorite} />
        </div>
      </div>

      <p className={styles.location}>{locationLabel}</p>
      <p className={styles.updatedAt}>
        {copy.updatedAt} {new Date(property.updatedAt).toLocaleDateString(locale)}
      </p>

      <div className={styles.gallery}>
        <PropertyGallery media={property.media} title={propertyTitle} locale={locale} />
      </div>

      <div className={styles.layout}>
        <div>
          <div className={styles.priceRow}>
            <span className={`price ${styles.price}`}>
              {formatPrice(property.price, property.currency, locale)}
            </span>
            {usdEstimate ? (
              <span className={styles.usdEstimate}>
                ≈ {usdEstimate} · {copy.usdEstimate}
              </span>
            ) : null}
          </div>

          <div className={styles.stats}>
            <Stat label={copy.bedrooms} value={property.bedrooms} />
            <Stat label={copy.bathrooms} value={property.bathrooms} />
            <Stat label={copy.parking} value={property.parkingSpots} />
            <Stat label={copy.area} value={formatArea(property.builtAreaM2, locale)} />
            {property.landAreaM2 ? (
              <Stat label={copy.landArea} value={formatArea(property.landAreaM2, locale)} />
            ) : null}
            {property.yearBuilt ? <Stat label={copy.year} value={property.yearBuilt} /> : null}
          </div>

          <h2 className={styles.sectionTitle}>{copy.description}</h2>
          <p className={styles.description}>{translation?.fullDescription}</p>

          {property.features.length > 0 ? (
            <>
              <h2 className={styles.sectionTitle}>{copy.features}</h2>
              <div className={styles.featureList}>
                {property.features.map((feature) => (
                  <span key={feature.id} className={`badge ${styles.featureBadge}`}>
                    {feature.name}
                  </span>
                ))}
              </div>
            </>
          ) : null}

          {property.location.latitude != null && property.location.longitude != null ? (
            <>
              <h2 className={styles.sectionTitle}>{copy.location}</h2>
              <PropertyLocationMap
                latitude={property.location.latitude}
                longitude={property.location.longitude}
                locale={locale}
              />
            </>
          ) : null}

          {property.relatedProperties.length > 0 ? (
            <section>
              <h2 className={styles.sectionTitle}>{copy.related}</h2>
              <div className={styles.relatedGrid}>
                {property.relatedProperties.map((related) => (
                  <PropertyCard key={related.id} property={related} locale={locale} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div>
          <PropertyContactCard
            propertyId={property.id}
            propertyTitle={propertyTitle}
            propertySlug={property.slug}
            propertyUrl={canonical}
            locale={locale}
          />
        </div>
      </div>

      <PropertyMobileStickyBar
        propertyTitle={propertyTitle}
        propertySlug={property.slug}
        propertyUrl={canonical}
        locale={locale}
      />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}
