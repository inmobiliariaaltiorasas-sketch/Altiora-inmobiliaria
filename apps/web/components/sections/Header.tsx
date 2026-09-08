import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { SupportedLocale } from '@altiora/shared-types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { HeaderScrollEffect } from './HeaderScrollEffect';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileNavToggle } from './MobileNavToggle';
import { WhatsAppIcon } from '@/components/ui/icons';
import styles from './Header.module.css';

export async function Header({ locale }: { locale: SupportedLocale }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const tSwitcher = await getTranslations({ locale, namespace: 'localeSwitcher' });

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/propiedades`, label: t('properties'), hasChevron: true },
    { href: `/${locale}/ciudades`, label: t('cities'), hasChevron: true },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/nosotros`, label: t('about') },
    { href: `/${locale}/contacto`, label: t('contact') },
  ];

  const whatsappLink = buildWhatsAppLink(
    locale === 'es-CO'
      ? 'Hola, quiero conocer las propiedades de ALTiora'
      : 'Hi, I want to know ALTiora properties',
  );

  return (
    <header id="site-header" className={styles.header} data-scrolled="false">
      <HeaderScrollEffect />
      <div className={`container ${styles.bar}`}>
        <Link href={`/${locale}`} className={styles.brand} aria-label="ALTiora — Inicio">
          <Image
            src="/altiora-logo-full.png"
            alt="ALTiora Construcciones e Inmobiliaria S.A.S."
            width={777}
            height={181}
            className={styles.logoMark}
            priority
          />
        </Link>

        <nav className={styles.nav} aria-label={t('mainNav')}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
              {link.hasChevron ? (
                <svg
                  className={styles.navChevron}
                  viewBox="0 0 10 6"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M1 1l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <LocaleSwitcher locale={locale} label={tSwitcher('label')} />
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappCta}
            >
              <WhatsAppIcon className={styles.whatsappIcon} aria-hidden="true" />
              {t('whatsappCta')}
            </a>
          ) : null}
          <MobileNavToggle
            links={links}
            whatsappHref={whatsappLink}
            whatsappLabel={t('whatsappCta')}
          />
        </div>
      </div>
    </header>
  );
}
