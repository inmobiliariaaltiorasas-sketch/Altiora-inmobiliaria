import type { SupportedLocale } from '@altiora/shared-types';
import { InquiryForm } from '@/components/blocks/InquiryForm';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './SellPropertySection.module.css';

const COPY: Record<
  SupportedLocale,
  {
    eyebrow: string;
    title: string;
    body: string;
    formTitle: string;
    whatsappCta: string;
    whatsappMessage: string;
  }
> = {
  'es-CO': {
    eyebrow: 'PARA PROPIETARIOS',
    title: '¿Estás pensando en vender tu propiedad?',
    body: 'Te ayudamos a presentarla de manera profesional, definir una estrategia comercial y conectar con compradores realmente interesados.',
    formTitle: 'Solicitar valoración',
    whatsappCta: 'Hablar por WhatsApp',
    whatsappMessage: 'Hola, quisiera recibir asesoría para vender mi propiedad.',
  },
  'en-US': {
    eyebrow: 'FOR OWNERS',
    title: 'Thinking about selling your property?',
    body: 'We help you present it professionally, define a commercial strategy and connect with genuinely interested buyers.',
    formTitle: 'Request a valuation',
    whatsappCta: 'Chat on WhatsApp',
    whatsappMessage: "Hi, I'd like advice on selling my property.",
  },
};

export function SellPropertySection({ locale }: { locale: SupportedLocale }) {
  const copy = COPY[locale];
  const whatsappLink = buildWhatsAppLink(copy.whatsappMessage);

  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2 className={styles.title}>{copy.title}</h2>
          <p className={styles.body}>{copy.body}</p>
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-outline ${styles.whatsappLink}`}
            >
              <WhatsAppIcon className={styles.whatsappIcon} aria-hidden="true" />
              {copy.whatsappCta}
            </a>
          ) : null}
        </div>

        <div className={styles.formWrap}>
          <InquiryForm
            inquiryType="ADVISOR_REQUEST"
            locale={locale}
            title={copy.formTitle}
            showPropertyContextFields
          />
        </div>
      </div>
    </section>
  );
}
