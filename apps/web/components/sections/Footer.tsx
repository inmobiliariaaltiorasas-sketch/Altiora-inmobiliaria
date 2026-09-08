import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { SupportedLocale } from '@altiora/shared-types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import {
  PinIcon,
  PhoneIcon,
  MailIcon,
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
  WhatsAppIcon,
} from '@/components/ui/icons';
import styles from './Footer.module.css';

/**
 * Datos comerciales fijos, dados por el usuario — no se traducen ni se inventan variantes.
 * Redes sociales: LINK-FACEBOOK.txt sigue vacío, así que apuntan a "#" hasta que ALTiora
 * comparta las URLs reales (v1 corrección 15 — no inventar datos comerciales). El render de
 * cada ícono se condiciona a que la URL sea real: un ícono a un link muerto es peor que no
 * mostrarlo.
 */
const ADDRESS = 'Calle 20 # 11-18, Laureles, Cartago, Valle del Cauca';
const PHONE = '300 605 0811';
const EMAIL = 'info@altiora.com.co';
const SOCIAL_LINKS = { facebook: '#', instagram: '#', youtube: '#' };

function isRealLink(href: string): boolean {
  return Boolean(href) && href !== '#';
}

export async function Footer({ locale }: { locale: SupportedLocale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });

  const navLinks = [
    { href: `/${locale}/propiedades?operation=SALE`, label: t('buy') },
    { href: `/${locale}/propiedades?operation=RENT`, label: t('rent') },
    { href: `/${locale}/ciudades`, label: tNav('cities') },
    { href: `/${locale}/nosotros`, label: tNav('about') },
    { href: `/${locale}/blog`, label: tNav('blog') },
    { href: `/${locale}/contacto`, label: tNav('contact') },
  ];

  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? 'Hola, quiero conocer las propiedades de ALTiora'
      : 'Hi, I want to know ALTiora properties',
  );

  const socialIcons = [
    { href: SOCIAL_LINKS.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: SOCIAL_LINKS.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: SOCIAL_LINKS.youtube, label: 'YouTube', Icon: YoutubeIcon },
  ].filter((item) => isRealLink(item.href));

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link href={`/${locale}`} className={styles.brandLink} aria-label="ALTiora — Inicio">
            <Image
              src="/altiora-logo.jpg"
              alt="ALTiora Construcciones e Inmobiliaria S.A.S."
              width={38}
              height={38}
              className={styles.logo}
            />
            <span className={styles.brandName}>ALTIORA</span>
          </Link>
          <p className={styles.description}>{t('description')}</p>

          {socialIcons.length > 0 ? (
            <div className={styles.social}>
              {socialIcons.map(({ href, label, Icon }) => (
                <a key={label} href={href} aria-label={label} className={styles.socialLink}>
                  <Icon className={styles.socialIcon} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.column}>
          <span className={`eyebrow ${styles.columnTitle}`}>{t('linksTitle')}</span>
          <ul className={styles.linkList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.column}>
          <span className={`eyebrow ${styles.columnTitle}`}>{t('contactTitle')}</span>
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
            {whatsappLink ? (
              <li>
                <WhatsAppIcon className={styles.icon} aria-hidden="true" />
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  {t('whatsapp')}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className={styles.legal}>
        © {new Date().getFullYear()} ALTiora Construcciones e Inmobiliaria S.A.S. — {t('rights')}
      </div>
    </footer>
  );
}
