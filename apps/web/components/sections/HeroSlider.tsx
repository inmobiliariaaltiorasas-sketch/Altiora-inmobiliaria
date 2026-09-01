'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PropertySummaryDto, SupportedLocale } from '@altiora/shared-types';
import { formatPrice } from '@/lib/format';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import styles from './HeroSlider.module.css';

/**
 * Controles + tarjeta flotante de la propiedad destacada, superpuestos sobre la textura del
 * Hero (no traen su propio fondo — el Hero ya lo provee). Client Component porque necesita
 * estado de índice; el resto del Hero (h1, subtítulo, beneficios) es Server Component y
 * siempre se renderiza server-side, así el contenido de SEO nunca depende de JS.
 */
export function HeroSlider({
  locale,
  slides,
  ctaLabel,
}: {
  locale: SupportedLocale;
  slides: PropertySummaryDto[];
  ctaLabel: string;
}) {
  const [index, setIndex] = useState(0);

  if (slides.length === 0) {
    return null;
  }

  // `slides.length === 0` ya retornó arriba, así que este índice siempre existe.
  const active = slides[index]!;
  const go = (next: number) => setIndex((next + slides.length) % slides.length);

  return (
    <div className={styles.stage}>
      {slides.length > 1 ? (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowPrev}`}
            aria-label={locale === 'es-CO' ? 'Propiedad anterior' : 'Previous property'}
            onClick={() => go(index - 1)}
          >
            <ChevronLeftIcon className={styles.arrowIcon} />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowNext}`}
            aria-label={locale === 'es-CO' ? 'Propiedad siguiente' : 'Next property'}
            onClick={() => go(index + 1)}
          >
            <ChevronRightIcon className={styles.arrowIcon} />
          </button>
        </>
      ) : null}

      <div className={styles.card}>
        <div className={styles.cardTitle}>{active.translation.title}</div>
        <div className={styles.cardPrice}>
          {formatPrice(active.price, active.currency, locale)}
          <span className={styles.cardCurrency}>{active.currency}</span>
        </div>
        <Link href={`/${locale}/propiedades/${active.slug}`} className="btn btn-gold">
          {ctaLabel} →
        </Link>
      </div>

      {slides.length > 1 ? (
        <div className={styles.dots} role="tablist" aria-label="Propiedades destacadas">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={`${slideIndex + 1}`}
              className={styles.dot}
              data-active={slideIndex === index}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
