import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { PropertyCard } from '@/components/blocks/PropertyCard';
import { searchProperties } from '@/lib/api/properties';
import { getLocationsTree } from '@/lib/api/locations';
import { getCityFaqs } from '@/lib/api/content';
import { buildAlternates, ORGANIZATION_INFO, WEB_URL } from '@/lib/seo/organization';
import styles from './page.module.css';

interface StaticFaq {
  id: string;
  question: string;
  answer: string;
}

/**
 * FAQs estáticas de intención AEO (además de precio/barrios, que son dinámicas y ya vienen de
 * `getCityFaqs`). Viven en código, no en la tabla `Faq`, porque no dependen de datos de
 * propiedades — son las mismas siempre. `hasInventory` decide la respuesta honesta sobre
 * inventario disponible: nunca afirmar que hay casas si el catálogo está vacío.
 */
function staticCityFaqs(locale: SupportedLocale, cityName: string, hasInventory: boolean): StaticFaq[] {
  if (locale === 'en-US') {
    return [
      {
        id: 'static-inventory-type',
        question: `What type of properties can I find in ${cityName}?`,
        answer: hasInventory
          ? `Altiora's catalog in ${cityName} includes houses, apartments and lots for sale or rent. You can filter by property type and price in our property search.`
          : `We don't have published listings in ${cityName} right now. Talk to an Altiora advisor to know about upcoming houses, apartments and lots as they become available.`,
      },
      {
        id: 'static-how-to-buy',
        question: `How can I buy a property in ${cityName} with Altiora?`,
        answer: `You browse the catalog, contact an Altiora advisor about the property you're interested in, and we guide you through the visit, price negotiation and closing process.`,
      },
      {
        id: 'static-sell-help',
        question: `Does Altiora help sell properties in ${cityName}?`,
        answer: `Yes. Altiora supports property owners in ${cityName} who want to sell, from an initial valuation through negotiation and closing with a buyer.`,
      },
      {
        id: 'static-valuation',
        question: 'How do I request a valuation of my property?',
        answer: `Fill out the owner form on our website with your property details, or reach out directly, and an Altiora advisor will contact you to arrange a valuation.`,
      },
      {
        id: 'static-contact-advisor',
        question: `How can I contact a real estate advisor in ${cityName}?`,
        answer: `You can reach Altiora through the contact form or WhatsApp on our website, or by phone at +57 300 605 0811.`,
      },
    ];
  }

  return [
    {
      id: 'static-inventory-type',
      question: `¿Qué tipo de propiedades puedo encontrar en ${cityName}?`,
      answer: hasInventory
        ? `El catálogo de Altiora en ${cityName} incluye casas, apartamentos y lotes en venta o arriendo. Podés filtrar por tipo de propiedad y precio en nuestro buscador.`
        : `Todavía no tenemos propiedades publicadas en ${cityName}. Hablá con un asesor de Altiora para conocer casas, apartamentos y lotes a medida que se publiquen.`,
    },
    {
      id: 'static-how-to-buy',
      question: `¿Cómo puedo comprar una propiedad en ${cityName} con Altiora?`,
      answer: `Explorás el catálogo, contactás a un asesor de Altiora por la propiedad que te interesa, y te acompañamos en la visita, la negociación del precio y el cierre del proceso.`,
    },
    {
      id: 'static-sell-help',
      question: `¿Altiora ayuda a vender propiedades en ${cityName}?`,
      answer: `Sí. Altiora acompaña a propietarios en ${cityName} que quieren vender, desde la valoración inicial hasta la negociación y el cierre con un comprador.`,
    },
    {
      id: 'static-valuation',
      question: '¿Cómo solicitar una valoración de mi inmueble?',
      answer: `Completá el formulario para propietarios en nuestro sitio con los datos de tu inmueble, o escribinos directamente, y un asesor de Altiora te va a contactar para coordinar la valoración.`,
    },
    {
      id: 'static-contact-advisor',
      question: `¿Cómo contactar a un asesor inmobiliario en ${cityName}?`,
      answer: `Podés escribirnos por el formulario de contacto o WhatsApp en nuestro sitio, o llamar al 300 605 0811.`,
    },
  ];
}

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
    breadcrumbCities: 'Zonas',
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

  const title =
    locale === 'en-US'
      ? `Properties in ${city.name}, ${city.department} | Altiora`
      : `Propiedades en ${city.name}, ${city.department} | Altiora`;
  const description =
    locale === 'en-US'
      ? `Explore real estate opportunities in ${city.name}, ${city.department}. Houses, apartments, lots and real estate guidance with Altiora.`
      : `Explora propiedades y oportunidades inmobiliarias en ${city.name}, ${city.department}. Casas, apartamentos, lotes y asesoría inmobiliaria con Altiora.`;
  const alternates = buildAlternates(`/ciudades/${ciudad}`);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.languages[locale],
      siteName: 'ALTiora',
      type: 'website',
      images: [{ url: ORGANIZATION_INFO.logo }],
    },
  };
}

export default async function CityPage({ params }: { params: Promise<RouteParams> }) {
  const { locale, ciudad } = (await params) as { locale: SupportedLocale; ciudad: string };
  const copy = COPY[locale];

  const cities = await getLocationsTree();
  const city = cities.find((c) => c.slug === ciudad);
  if (!city) notFound();

  const [results, dynamicFaqs] = await Promise.all([
    searchProperties({ locale, city: ciudad, pageSize: 24 }),
    getCityFaqs(ciudad, locale),
  ]);

  const staticFaqs = staticCityFaqs(locale, city.name, results.items.length > 0);
  const faqs = [...dynamicFaqs, ...staticFaqs];

  const cityUrl = `${WEB_URL}/${locale}/ciudades/${ciudad}`;
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

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Altiora', item: `${WEB_URL}/${locale}` },
      {
        '@type': 'ListItem',
        position: 2,
        name: copy.breadcrumbCities,
        item: `${WEB_URL}/${locale}/ciudades`,
      },
      { '@type': 'ListItem', position: 3, name: city.name, item: cityUrl },
    ],
  };

  return (
    <main>
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
