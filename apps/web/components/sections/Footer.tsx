import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { SupportedLocale } from '@altiora/shared-types';
import {
  PinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from '@/components/ui/icons';
import styles from './Footer.module.css';

/**
 * Datos comerciales fijos, dados por el usuario — no se traducen ni se inventan variantes.
 * Redes sociales: LINK-FACEBOOK.txt sigue vacío, así que apuntan a "#" hasta que ALTiora
 * comparta las URLs reales (v1 corrección 15 — no inventar datos comerciales).
 */
const ADDRESS = 'Calle 20 # 11-18, Laureles, Cartago, Valle del Cauca';
const PHONE = '300 605 0811';
const EMAIL = 'info@altiora.com.co';
const SOCIAL_LINKS = { facebook: '#', instagram: '#', youtube: '#' };

export async function Footer({ locale }: { locale: SupportedLocale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Image
            src="/altiora-logo.jpg"
            alt="ALTiora Construcciones e Inmobiliaria S.A.S."
            width={34}
            height={34}
            className={styles.logo}
          />
          <div>
            <div className={styles.brandName}>ALTIORA</div>
            <div className={styles.note}>{t('note')}</div>
          </div>
        </div>

        <ul className={styles.contact}>
          <li>
            <PinIcon className={styles.icon} aria-hidden="true" />
            <span>{ADDRESS}</span>
          </li>
          <li>
            <PhoneIcon className={styles.icon} aria-hidden="true" />
            <a href={`tel:+57${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>
          </li>
          <li>
            <MailIcon className={styles.icon} aria-hidden="true" />
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </li>
        </ul>

        <div className={styles.social}>
          <a href={SOCIAL_LINKS.facebook} aria-label="Facebook" className={styles.socialLink}>
            <FacebookIcon className={styles.socialIcon} />
          </a>
          <a href={SOCIAL_LINKS.instagram} aria-label="Instagram" className={styles.socialLink}>
            <InstagramIcon className={styles.socialIcon} />
          </a>
          <a href={SOCIAL_LINKS.youtube} aria-label="YouTube" className={styles.socialLink}>
            <YoutubeIcon className={styles.socialIcon} />
          </a>
        </div>
      </div>

      <div className={styles.legal}>
        © {new Date().getFullYear()} ALTiora Construcciones e Inmobiliaria S.A.S. — {t('rights')}
      </div>
    </footer>
  );
}
