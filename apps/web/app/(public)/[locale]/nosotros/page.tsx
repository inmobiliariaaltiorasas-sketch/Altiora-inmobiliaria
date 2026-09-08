import type { Metadata } from 'next';
import type { SupportedLocale } from '@altiora/shared-types';
import { FinalCta } from '@/components/sections/FinalCta';
import styles from './page.module.css';

interface Step {
  number: string;
  title: string;
  body: string;
}

interface Value {
  title: string;
  body: string;
}

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    tagline: string;
    intro: string;
    processTitle: string;
    steps: Step[];
    valuesTitle: string;
    values: Value[];
    metaDescription: string;
  }
> = {
  'es-CO': {
    eyebrow: 'ALTIORA INMOBILIARIA',
    tagline: 'Tu patrimonio, nuestra prioridad.',
    intro:
      'Altiora Construcciones e Inmobiliaria S.A.S. acompaña procesos de compra, venta y arriendo de propiedades en Cartago y el norte del Valle del Cauca. Trabajamos con un inventario verificado y buscamos que cada decisión inmobiliaria se tome con información clara y asesoría real, sin letra pequeña.',
    processTitle: 'Nuestra forma de trabajar',
    steps: [
      {
        number: '01',
        title: 'Escuchamos',
        body: 'Entendemos qué buscás, tu presupuesto y tus tiempos antes de mostrarte cualquier propiedad.',
      },
      {
        number: '02',
        title: 'Seleccionamos',
        body: 'Filtramos el inventario disponible para mostrarte solo lo que realmente se ajusta a lo que necesitás.',
      },
      {
        number: '03',
        title: 'Verificamos',
        body: 'Revisamos la información de cada propiedad antes de presentártela.',
      },
      {
        number: '04',
        title: 'Negociamos',
        body: 'Te acompañamos en la conversación de precio y condiciones con el vendedor o arrendador.',
      },
      {
        number: '05',
        title: 'Acompañamos',
        body: 'Seguimos con vos hasta que el proceso quede cerrado, no solo hasta la primera visita.',
      },
    ],
    valuesTitle: 'Nuestros valores',
    values: [
      {
        title: 'Conocimiento local',
        body: 'Trabajamos día a día en Cartago y el norte del Valle; conocemos el mercado zona por zona.',
      },
      {
        title: 'Transparencia',
        body: 'Precios reales y visibles, sin condiciones ocultas.',
      },
      {
        title: 'Acompañamiento',
        body: 'Te guiamos en cada etapa, desde la primera visita hasta la firma.',
      },
      {
        title: 'Confianza',
        body: 'Cada propiedad que mostramos pasa por una revisión previa de nuestro equipo.',
      },
    ],
    metaDescription:
      'Conocé cómo trabaja Altiora Construcciones e Inmobiliaria: acompañamiento real en la compra, venta y arriendo de propiedades en Cartago y el norte del Valle.',
  },
  'en-US': {
    eyebrow: 'ALTIORA REAL ESTATE',
    tagline: 'Your legacy, our priority.',
    intro:
      'Altiora Construcciones e Inmobiliaria S.A.S. supports buying, selling and renting processes in Cartago and northern Valle del Cauca. We work with a verified inventory and want every real estate decision to be made with clear information and real guidance, no fine print.',
    processTitle: 'How we work',
    steps: [
      {
        number: '01',
        title: 'We listen',
        body: "We understand what you're looking for, your budget and your timeline before showing you any property.",
      },
      {
        number: '02',
        title: 'We select',
        body: 'We filter the available inventory to show you only what truly fits what you need.',
      },
      {
        number: '03',
        title: 'We verify',
        body: "We check each property's information before presenting it to you.",
      },
      {
        number: '04',
        title: 'We negotiate',
        body: 'We support you through the price and terms conversation with the seller or landlord.',
      },
      {
        number: '05',
        title: 'We follow through',
        body: 'We stay with you until the process is closed, not just through the first visit.',
      },
    ],
    valuesTitle: 'Our values',
    values: [
      {
        title: 'Local expertise',
        body: 'We work day to day in Cartago and northern Valle; we know the market area by area.',
      },
      {
        title: 'Transparency',
        body: 'Real, visible prices with no hidden conditions.',
      },
      {
        title: 'Guidance',
        body: 'We guide you through every stage, from the first visit to closing.',
      },
      {
        title: 'Trust',
        body: 'Every property we show goes through a prior review by our team.',
      },
    ],
    metaDescription:
      "Learn how Altiora Construcciones e Inmobiliaria works: real guidance for buying, selling and renting properties in Cartago and northern Valle del Cauca.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];
  return {
    title: `${locale === 'es-CO' ? 'Nosotros' : 'About us'} | ALTiora`,
    description: copy.metaDescription,
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = (await params) as { locale: SupportedLocale };
  const copy = COPY[locale];

  return (
    <main>
      <div className={`container ${styles.intro}`}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1 className={styles.tagline}>{copy.tagline}</h1>
        <p className={styles.introBody}>{copy.intro}</p>
      </div>

      <section className="container section">
        <h2 className={styles.sectionTitle}>{copy.processTitle}</h2>
        <ol className={styles.steps}>
          {copy.steps.map((step) => (
            <li key={step.number} className={styles.step}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`container section ${styles.valuesSection}`}>
        <h2 className={styles.sectionTitle}>{copy.valuesTitle}</h2>
        <div className={styles.valuesGrid}>
          {copy.values.map((value) => (
            <div key={value.title} className={styles.valueItem}>
              <h3 className={styles.valueTitle}>{value.title}</h3>
              <p className={styles.valueBody}>{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <FinalCta locale={locale} />
    </main>
  );
}
