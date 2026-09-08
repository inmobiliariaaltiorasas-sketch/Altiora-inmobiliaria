import type { SupportedLocale } from '@altiora/shared-types';
import { PropertyInquirySection } from './PropertyInquirySection';
import styles from './PropertyContactCard.module.css';

const COPY: Record<SupportedLocale, { title: string }> = {
  'es-CO': { title: '¿Te interesa esta propiedad?' },
  'en-US': { title: 'Interested in this property?' },
};

export function PropertyContactCard({
  propertyId,
  propertyTitle,
  propertySlug,
  propertyUrl,
  locale,
}: {
  propertyId: string;
  propertyTitle: string;
  propertySlug: string;
  propertyUrl: string;
  locale: SupportedLocale;
}) {
  return (
    <div id="contacto" className={`card ${styles.card}`}>
      <h2 className={styles.title}>{COPY[locale].title}</h2>
      <PropertyInquirySection
        propertyId={propertyId}
        propertyTitle={propertyTitle}
        propertySlug={propertySlug}
        propertyUrl={propertyUrl}
        locale={locale}
      />
    </div>
  );
}
