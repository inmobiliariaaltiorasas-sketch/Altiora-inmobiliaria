'use client';

import { useState } from 'react';
import { HeartIcon } from './icons';
import styles from './FavoriteButton.module.css';

/**
 * Solo UI — sin persistencia todavía (no hay módulo de favoritos en el backend).
 * `stopPropagation` porque vive dentro de un <Link> de tarjeta.
 */
export function FavoriteButton({ label }: { label: string }) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      className={styles.button}
      aria-pressed={active}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setActive((value) => !value);
      }}
    >
      <HeartIcon className={styles.icon} data-active={active} />
    </button>
  );
}
