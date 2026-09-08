import Image from 'next/image';
import type { SupportedLocale } from '@altiora/shared-types';
import styles from './Hero.module.css';

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
  }
> = {
  'es-CO': {
    eyebrow: 'ALTIORA INMOBILIARIA',
    title: 'Encuentra el lugar donde\ncomienza tu próxima historia',
    subtitle:
      'Casas, apartamentos, lotes y proyectos seleccionados en Cartago y el norte del Valle.',
  },
  'en-US': {
    eyebrow: 'ALTIORA REAL ESTATE',
    title: 'Find the place where\nyour next story begins',
    subtitle:
      'Houses, apartments, lots and selected projects in Cartago and northern Valle del Cauca.',
  },
};

/**
 * Solo foto + titular + buscador (este último vive en page.tsx, superpuesto al borde
 * inferior del Hero) — sin card de propiedad flotante ni indicadores dentro de la foto,
 * para que la primera pantalla se sienta como la referencia premium: fotografía protagonista.
 */
export function Hero({ locale }: { locale: SupportedLocale }) {
  const copy = COPY[locale];

  return (
    <section className={styles.hero}>
      <Image src="/hero-home.png" alt="" fill priority sizes="100vw" className={styles.photo} />
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <span className={`eyebrow ${styles.eyebrow}`}>—{copy.eyebrow}</span>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
      </div>
    </section>
  );
}
