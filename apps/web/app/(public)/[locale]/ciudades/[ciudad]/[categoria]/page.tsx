import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { CategoryLinks } from '@/components/blocks/CategoryLinks';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { listPropertyFacets, searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import {
  buildCategorySlug,
  categoryLabel,
  parseCategorySlug,
  selectCityCategories,
} from '@/lib/seo/categories';
import {
  buildCategoryFaqs,
  buildCategoryHeading,
  buildCategoryMetadataText,
  buildCategorySummary,
  buildFaqPageJsonLd,
  buildPropertyItemList,
} from '@/lib/seo/category-page';
import { buildBreadcrumbList } from '@/lib/seo/breadcrumbs';
import { buildAlternates, ORGANIZATION_INFO } from '@/lib/seo/organization';
import { buildSocialMetadata } from '@/lib/seo/social';
import { SITE_URL } from '@/lib/seo/site-url';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import cityStyles from '../page.module.css';
import styles from './page.module.css';

const COPY: Record<
  SupportedLocale,
  {
    breadcrumbHome: string;
    breadcrumbCities: string;
    ctaTitle: string;
    ctaText: string;
    contact: string;
    whatsapp: string;
    whatsappMessage: (heading: string) => string;
    otherCategories: string;
    faq: string;
    breadcrumbLabel: string;
  }
> = {
  'es-CO': {
    breadcrumbHome: 'Inicio',
    breadcrumbCities: 'Zonas',
    ctaTitle: '¿Quieres ver alguna de estas propiedades?',
    ctaText: 'Escríbenos y un asesor te ayuda a coordinar la visita.',
    contact: 'Hablar con un asesor',
    whatsapp: 'Escribir por WhatsApp',
    whatsappMessage: (heading) => `Hola, me interesa información sobre: ${heading}.`,
    otherCategories: 'Otras propiedades en esta zona',
    faq: 'Preguntas frecuentes',
    breadcrumbLabel: 'Ruta de navegación',
  },
  'en-US': {
    breadcrumbHome: 'Home',
    breadcrumbCities: 'Cities',
    ctaTitle: 'Would you like to see any of these properties?',
    ctaText: 'Write to us and an advisor will help you arrange the visit.',
    contact: 'Talk to an advisor',
    whatsapp: 'Chat on WhatsApp',
    whatsappMessage: (heading) => `Hi, I'd like information about: ${heading}.`,
    otherCategories: 'Other properties in this city',
    faq: 'Frequently asked questions',
    breadcrumbLabel: 'Breadcrumb',
  },
};

interface RouteParams {
  locale: string;
  ciudad: string;
  categoria: string;
}

/** Resolves the city and the category, or `null` when either does not exist or has no inventory. */
async function resolveCategoryPage(ciudad: string, categoria: string) {
  const ref = parseCategorySlug(categoria);
  if (!ref) return null;

  const [cities, facets] = await Promise.all([getLocationsTree(), listPropertyFacets()]);
  const city = cities.find((c) => c.slug === ciudad);
  if (!city) return null;

  const categories = selectCityCategories(facets, ciudad);
  const category = categories.find(
    (c) => c.slug === buildCategorySlug(ref.typeSlug, ref.operation),
  );
  if (!category) return null;

  return { city, category, categories, typeSlug: ref.typeSlug, operation: ref.operation };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { locale, ciudad, categoria } = (await params) as RouteParams & {
    locale: SupportedLocale;
  };
  const resolved = await resolveCategoryPage(ciudad, categoria);
  if (!resolved) return {};

  const { city, category } = resolved;
  const { title, description } = buildCategoryMetadataText({
    category,
    cityName: city.name,
    department: city.department,
    locale,
  });
  const alternates = buildAlternates(locale, `/ciudades/${ciudad}/${categoria}`);

  return {
    ...buildSocialMetadata({
      rawTitle: title,
      description,
      url: alternates.canonical,
      fallbackImage: ORGANIZATION_INFO.logo,
    }),
    description,
    alternates,
  };
}

export default async function CityCategoryPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, ciudad, categoria } = (await params) as RouteParams & {
    locale: SupportedLocale;
  };
  const copy = COPY[locale];

  const resolved = await resolveCategoryPage(ciudad, categoria);
  if (!resolved) notFound();
  const { city, category, categories, typeSlug, operation } = resolved;

  const results = await searchProperties({
    locale,
    city: ciudad,
    type: typeSlug,
    operation,
    pageSize: 48,
  });

  const heading = buildCategoryHeading({
    category,
    cityName: city.name,
    department: city.department,
    locale,
  });
  const summary = buildCategorySummary({ category, cityName: city.name, locale });

  const whatsappLink = buildWhatsAppLink(copy.whatsappMessage(heading));
  const faqs = buildCategoryFaqs({
    category,
    cityName: city.name,
    locale,
    whatsappAvailable: whatsappLink !== null,
  });

  const cityUrl = `${SITE_URL}/${locale}/ciudades/${ciudad}`;
  // One list feeds both the visible breadcrumb and its JSON-LD, so they cannot diverge.
  const trail = [
    { name: copy.breadcrumbHome, url: `${SITE_URL}/${locale}` },
    { name: copy.breadcrumbCities, url: `${SITE_URL}/${locale}/ciudades` },
    { name: city.name, url: cityUrl },
    { name: categoryLabel(typeSlug, operation, locale), url: `${cityUrl}/${categoria}` },
  ];
  const jsonLd = [
    buildBreadcrumbList(trail),
    buildPropertyItemList({ properties: results.items, locale, baseUrl: SITE_URL }),
    buildFaqPageJsonLd(faqs),
  ].map((node) => ({ '@context': 'https://schema.org', ...node }));

  const otherCategories = categories.filter((c) => c.slug !== category.slug);
  const lastIndex = trail.length - 1;

  return (
    <main>
      {jsonLd.map((node) => (
        <script
          key={node['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <nav className={`container ${cityStyles.breadcrumb}`} aria-label={copy.breadcrumbLabel}>
        {trail.map((item, index) => (
          <span key={item.url} className={styles.crumb}>
            {index === lastIndex ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.url.slice(SITE_URL.length)}>{item.name}</Link>
            )}
            {index < lastIndex ? <span aria-hidden="true">/</span> : null}
          </span>
        ))}
      </nav>

      <div className={`container ${cityStyles.intro}`}>
        <h1 className={cityStyles.tagline}>{heading}</h1>
        <p className={cityStyles.subtitle}>{summary}</p>
      </div>

      <section className="container section">
        <div className={cityStyles.grid}>
          {results.items.map((property) => (
            <PropertyCard key={property.id} property={property} locale={locale} />
          ))}
        </div>

        <div className={`card ${styles.cta}`}>
          <h2 className={styles.ctaTitle}>{copy.ctaTitle}</h2>
          <p>{copy.ctaText}</p>
          <div className={styles.ctaActions}>
            <Link href={`/${locale}/contacto`} className="btn btn-primary">
              {copy.contact}
            </Link>
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                {copy.whatsapp}
              </a>
            ) : null}
          </div>
        </div>

        <CategoryLinks
          heading={copy.otherCategories}
          links={otherCategories.map((other) => ({
            href: `/${locale}/ciudades/${ciudad}/${other.slug}`,
            label: categoryLabel(other.typeSlug, other.operationType, locale),
            count: other.count,
          }))}
        />

        <section className={cityStyles.faqSection} style={{ marginTop: '3.5rem' }}>
          <h2 className={cityStyles.faqTitle}>{copy.faq}</h2>
          <div className={cityStyles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.question} className={`card ${cityStyles.faqItem}`}>
                <summary className={cityStyles.faqQuestion}>{faq.question}</summary>
                <p className={cityStyles.faqAnswer}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
