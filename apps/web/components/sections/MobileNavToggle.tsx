'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MenuIcon, CloseIcon, WhatsAppIcon } from '@/components/ui/icons';
import styles from './MobileNavToggle.module.css';

export function MobileNavToggle({
  links,
  whatsappHref,
  whatsappLabel,
}: {
  links: Array<{ href: string; label: string }>;
  whatsappHref: string | null;
  whatsappLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <CloseIcon className={styles.icon} /> : <MenuIcon className={styles.icon} />}
      </button>

      {open ? (
        <div id="mobile-nav-panel" className={styles.panel}>
          <nav className={styles.panelNav}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.panelLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.panelWhatsapp}
            >
              <WhatsAppIcon className={styles.whatsappIcon} aria-hidden="true" />
              {whatsappLabel}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
