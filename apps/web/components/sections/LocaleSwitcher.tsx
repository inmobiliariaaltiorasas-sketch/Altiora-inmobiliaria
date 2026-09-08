'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@altiora/shared-types';

const LABELS: Record<SupportedLocale, string> = { 'es-CO': 'ES', 'en-US': 'EN' };

/** Swapea el segmento [locale] de la ruta actual, preservando el resto del path. */
export function LocaleSwitcher({ locale, label }: { locale: SupportedLocale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.split('/').slice(2).join('/');

  return (
    <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }} aria-label={label}>
      {SUPPORTED_LOCALES.map((candidate, index) => (
        <span key={candidate} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          {index > 0 ? (
            <span
              aria-hidden="true"
              style={{ color: 'var(--border)', fontSize: '0.7rem' }}
            >
              /
            </span>
          ) : null}
          <Link
            href={`/${candidate}${rest ? `/${rest}` : ''}`}
            aria-current={candidate === locale ? 'true' : undefined}
            style={{
              fontSize: '0.7rem',
              fontFamily: 'var(--font-plex-mono), monospace',
              letterSpacing: '0.05em',
              textDecoration: 'none',
              color: candidate === locale ? 'var(--navy-900)' : 'var(--text-muted)',
              fontWeight: candidate === locale ? 600 : 400,
            }}
          >
            {LABELS[candidate]}
          </Link>
        </span>
      ))}
    </div>
  );
}
