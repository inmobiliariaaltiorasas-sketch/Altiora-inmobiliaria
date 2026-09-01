import Link from 'next/link';
import type { SupportedLocale } from '@altiora/shared-types';
import { CompassIcon, FileTextIcon, CalculatorIcon, HeadsetIcon } from '@/components/ui/icons';
import styles from './ResourcesBlock.module.css';

const COPY: Record<
  SupportedLocale,
  Array<{ icon: typeof CompassIcon; title: string; body: string; cta: string; href: string }>
> = {
  'es-CO': [
    {
      icon: CompassIcon,
      title: 'Conoce Cartago',
      body: 'Descubre los mejores barrios, sectores y oportunidades de inversión.',
      cta: 'Explorar zonas',
      href: '/es-CO/ciudades',
    },
    {
      icon: FileTextIcon,
      title: 'Guías y consejos',
      body: 'Aprende todo sobre compra de vivienda, financiación y más.',
      cta: 'Ir al blog',
      href: '/es-CO/blog',
    },
    {
      icon: CalculatorIcon,
      title: 'Calcula tu crédito',
      body: 'Simula tu crédito hipotecario en minutos y conoce tu capacidad de compra.',
      cta: 'Simular ahora',
      href: '/es-CO/calculadora-credito',
    },
    {
      icon: HeadsetIcon,
      title: 'Asesoría personalizada',
      body: 'Nuestro equipo está listo para acompañarte en todo el proceso.',
      cta: 'Hablar con asesor',
      href: '/es-CO/contacto',
    },
  ],
  'en-US': [
    {
      icon: CompassIcon,
      title: 'Discover Cartago',
      body: 'Explore the best neighborhoods, areas and investment opportunities.',
      cta: 'Explore areas',
      href: '/en-US/ciudades',
    },
    {
      icon: FileTextIcon,
      title: 'Guides & advice',
      body: 'Learn everything about buying a home, financing and more.',
      cta: 'Go to blog',
      href: '/en-US/blog',
    },
    {
      icon: CalculatorIcon,
      title: 'Calculate your loan',
      body: 'Simulate your mortgage in minutes and know your buying power.',
      cta: 'Simulate now',
      href: '/en-US/calculadora-credito',
    },
    {
      icon: HeadsetIcon,
      title: 'Personalized guidance',
      body: 'Our team is ready to support you through the whole process.',
      cta: 'Talk to an advisor',
      href: '/en-US/contacto',
    },
  ],
};

export function ResourcesBlock({ locale }: { locale: SupportedLocale }) {
  const items = COPY[locale];

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={styles.item}>
              <Icon className={styles.icon} aria-hidden="true" />
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.body}>{item.body}</p>
              <Link href={item.href} className={styles.cta}>
                {item.cta} →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
