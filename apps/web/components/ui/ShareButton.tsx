'use client';

import { useState } from 'react';
import { ShareIcon } from './icons';
import styles from './ShareButton.module.css';

/**
 * Web Share API con fallback a copiar el link — sin backend, no requiere infraestructura de
 * "compartir" que el proyecto no tiene todavía.
 */
export function ShareButton({ url, title, label, copiedLabel }: { url: string; title: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin Web Share API ni Clipboard API disponible — no hay más fallback razonable acá.
    }
  }

  return (
    <button type="button" className={styles.button} aria-label={copied ? copiedLabel : label} onClick={handleShare}>
      <ShareIcon className={styles.icon} />
    </button>
  );
}
