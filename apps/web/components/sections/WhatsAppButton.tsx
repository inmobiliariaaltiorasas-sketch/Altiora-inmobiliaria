import type { SupportedLocale } from '@altiora/shared-types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './WhatsAppButton.module.css';

const MESSAGE: Record<SupportedLocale, string> = {
  'es-CO': 'Hola, quiero más información sobre las propiedades de ALTiora',
  'en-US': 'Hi, I want more information about ALTiora properties',
};

const LABEL: Record<SupportedLocale, string> = {
  'es-CO': 'Hablar por WhatsApp',
  'en-US': 'Chat on WhatsApp',
};

/**
 * No lleva lógica comercial: solo arma el link con `buildWhatsAppLink` (v1 sección 14 —
 * la lógica de mensajería vive en el backend/WhatsApp Cloud API, esto es únicamente UI).
 */
export function WhatsAppButton({ locale }: { locale: SupportedLocale }) {
  const href = buildWhatsAppLink(MESSAGE[locale]);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label={LABEL[locale]}
    >
      <WhatsAppIcon className={styles.icon} aria-hidden="true" />
    </a>
  );
}
