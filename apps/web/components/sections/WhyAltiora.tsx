import type { SupportedLocale } from '@altiora/shared-types';
import { AwardIcon, FileTextIcon, HandshakeIcon, ShieldCheckIcon } from '@/components/ui/icons';
import styles from './WhyAltiora.module.css';

const COPY: Record<
  SupportedLocale,
  { title: string; items: Array<{ icon: typeof AwardIcon; title: string; body: string }> }
> = {
  'es-CO': {
    title: '¿Por qué elegir Altiora?',
    items: [
      {
        icon: AwardIcon,
        title: 'Experiencia local',
        body: 'Conocimiento profundo del mercado inmobiliario en Cartago.',
      },
      {
        icon: FileTextIcon,
        title: 'Transparencia',
        body: 'Precios reales, información clara y procesos transparentes.',
      },
      {
        icon: HandshakeIcon,
        title: 'Acompañamiento',
        body: 'Te guiamos desde la búsqueda hasta la entrega de tu propiedad.',
      },
      {
        icon: ShieldCheckIcon,
        title: 'Respaldo',
        body: 'Altiora Construcciones e Inmobiliaria S.A.S. es seguridad y confianza.',
      },
    ],
  },
  'en-US': {
    title: 'Why choose Altiora?',
    items: [
      {
        icon: AwardIcon,
        title: 'Local expertise',
        body: 'Deep knowledge of the real estate market in Cartago.',
      },
      {
        icon: FileTextIcon,
        title: 'Transparency',
        body: 'Real prices, clear information and transparent processes.',
      },
      {
        icon: HandshakeIcon,
        title: 'Guidance',
        body: 'We guide you from the search to the delivery of your property.',
      },
      {
        icon: ShieldCheckIcon,
        title: 'Backing',
        body: 'Altiora Construcciones e Inmobiliaria S.A.S. means security and trust.',
      },
    ],
  },
};

export function WhyAltiora({ locale }: { locale: SupportedLocale }) {
  const copy = COPY[locale];

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{copy.title}</h2>
      <div className={styles.grid}>
        {copy.items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className={styles.item}>
              <Icon className={styles.icon} aria-hidden="true" />
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemBody}>{item.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
