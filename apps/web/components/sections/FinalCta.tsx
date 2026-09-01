import type { SupportedLocale } from '@altiora/shared-types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './FinalCta.module.css';

const COPY: Record<
  SupportedLocale,
  { title: string; subtitle: string; cta: string; message: string }
> = {
  'es-CO': {
    title: '¿Listo para encontrar tu nueva propiedad?',
    subtitle: 'Habla con uno de nuestros asesores y recibe atención personalizada.',
    cta: 'Hablar por WhatsApp',
    message: 'Hola, quiero encontrar mi próxima propiedad con ALTiora',
  },
  'en-US': {
    title: 'Ready to find your new property?',
    subtitle: 'Talk to one of our advisors and get personalized attention.',
    cta: 'Chat on WhatsApp',
    message: 'Hi, I want to find my next property with ALTiora',
  },
};

export function FinalCta({ locale }: { locale: SupportedLocale }) {
  const copy = COPY[locale];
  const whatsappLink = buildWhatsAppLink(copy.message);

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.subtitle}>{copy.subtitle}</p>
        {whatsappLink ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-gold ${styles.cta}`}
          >
            <WhatsAppIcon className={styles.icon} aria-hidden="true" />
            {copy.cta}
          </a>
        ) : null}
      </div>
    </section>
  );
}
