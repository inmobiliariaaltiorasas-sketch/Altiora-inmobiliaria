import type { SupportedLocale } from '@altiora/shared-types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './PropertyMobileStickyBar.module.css';

const COPY: Record<SupportedLocale, { whatsapp: string; visit: string }> = {
  'es-CO': { whatsapp: 'WhatsApp', visit: 'Agendar visita' },
  'en-US': { whatsapp: 'WhatsApp', visit: 'Schedule visit' },
};

/**
 * CTA fija solo en mobile (ver .module.css) — "Agendar visita" ancla a la PropertyContactCard
 * (#contacto) en vez de duplicar el formulario de leads en un segundo componente con estado propio.
 */
export function PropertyMobileStickyBar({
  propertyTitle,
  propertySlug,
  propertyUrl,
  locale,
}: {
  propertyTitle: string;
  propertySlug: string;
  propertyUrl: string;
  locale: SupportedLocale;
}) {
  const copy = COPY[locale];
  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? `Hola, estoy interesado en la propiedad "${propertyTitle}", código ${propertySlug}. Quisiera recibir más información. ${propertyUrl}`
      : `Hi, I'm interested in the property "${propertyTitle}", code ${propertySlug}. I'd like more information. ${propertyUrl}`,
  );

  return (
    <div className={styles.bar}>
      {whatsappLink ? (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`btn btn-gold ${styles.btn}`}>
          <WhatsAppIcon className={styles.icon} aria-hidden="true" />
          {copy.whatsapp}
        </a>
      ) : null}
      <a href="#contacto" className={`btn btn-primary ${styles.btn}`}>
        {copy.visit}
      </a>
    </div>
  );
}
