import Image from 'next/image';
import type { PropertySummaryDto, SupportedLocale } from '@altiora/shared-types';
import { HouseIcon, ShieldCheckIcon, UsersIcon } from '@/components/ui/icons';
import { HeroSlider } from './HeroSlider';
import styles from './Hero.module.css';

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    benefits: Array<{ title: string; body: string }>;
    ctaProperty: string;
  }
> = {
  'es-CO': {
    eyebrow: 'Encuentra tu próximo hogar',
    title: 'Casas y apartamentos en Cartago',
    subtitle:
      'Propiedades verificadas, precios reales y asesoría personalizada para que tomes la mejor decisión.',
    benefits: [
      { title: 'Precios reales', body: 'y visibles' },
      { title: 'Propiedades', body: 'verificadas' },
      { title: 'Asesoría', body: 'en cada paso' },
    ],
    ctaProperty: 'Ver propiedad',
  },
  'en-US': {
    eyebrow: 'Find your next home',
    title: 'Houses and apartments in Cartago',
    subtitle:
      'Verified properties, real prices and personalized guidance to help you make the best decision.',
    benefits: [
      { title: 'Real prices', body: 'always visible' },
      { title: 'Verified', body: 'properties' },
      { title: 'Guidance', body: 'every step' },
    ],
    ctaProperty: 'View property',
  },
};

const BENEFIT_ICONS = [HouseIcon, ShieldCheckIcon, UsersIcon];

export function Hero({
  locale,
  featured,
}: {
  locale: SupportedLocale;
  featured: PropertySummaryDto[];
}) {
  const copy = COPY[locale];

  return (
    <section className={styles.hero}>
      <Image src="/hero-property.jpg" alt="" fill priority sizes="100vw" className={styles.photo} />
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <div className={`container ${styles.content}`}>
        <span className={`eyebrow ${styles.eyebrow}`}>—{copy.eyebrow}</span>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>

        <ul className={styles.benefits}>
          {copy.benefits.map((benefit, index) => {
            const Icon = BENEFIT_ICONS[index] ?? HouseIcon;
            return (
              <li key={benefit.title} className={styles.benefit}>
                <Icon className={styles.benefitIcon} aria-hidden="true" />
                <span>
                  {benefit.title}
                  <br />
                  {benefit.body}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <HeroSlider locale={locale} slides={featured.slice(0, 3)} ctaLabel={copy.ctaProperty} />
    </section>
  );
}
