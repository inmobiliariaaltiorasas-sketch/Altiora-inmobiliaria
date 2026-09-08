'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { PropertyMediaDto, SupportedLocale } from '@altiora/shared-types';
import { resolveMediaUrl } from '@/lib/api-client';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import styles from './PropertyGallery.module.css';

const COPY: Record<SupportedLocale, { viewAll: string; close: string; prev: string; next: string }> = {
  'es-CO': { viewAll: 'Ver todas las fotos', close: 'Cerrar', prev: 'Foto anterior', next: 'Foto siguiente' },
  'en-US': { viewAll: 'View all photos', close: 'Close', prev: 'Previous photo', next: 'Next photo' },
};

/**
 * Lightbox casero con <dialog> nativo — el proyecto no trae ninguna librería de galería y el
 * prompt maestro pide explícitamente no instalar una solo para esto.
 */
export function PropertyGallery({
  media,
  title,
  locale,
}: {
  media: PropertyMediaDto[];
  title: string;
  locale: SupportedLocale;
}) {
  const copy = COPY[locale];
  const photos = media.filter((item) => item.type === 'PHOTO');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return null;
  }

  const main = photos[0]!;
  const secondary = photos.slice(1, 5);
  const extraCount = photos.length - secondary.length - 1;

  function openAt(index: number) {
    setActiveIndex(index);
    dialogRef.current?.showModal();
  }

  function go(delta: number) {
    setActiveIndex((current) => (current + delta + photos.length) % photos.length);
  }

  return (
    <>
      <div className={styles.grid}>
        <button type="button" className={styles.mainTile} onClick={() => openAt(0)}>
          <Image
            src={resolveMediaUrl(main.url)}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className={styles.image}
            priority
          />
        </button>

        {secondary.length > 0 ? (
          <div className={styles.secondaryGrid}>
            {secondary.map((photo, index) => {
              const isLast = index === secondary.length - 1;
              return (
                <button
                  key={photo.id}
                  type="button"
                  className={styles.secondaryTile}
                  onClick={() => openAt(index + 1)}
                >
                  <Image
                    src={resolveMediaUrl(photo.url)}
                    alt={`${title} — ${index + 2}`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className={styles.image}
                  />
                  {isLast && extraCount > 0 ? (
                    <span className={styles.moreOverlay}>+{extraCount}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {photos.length > 1 ? (
        <button type="button" className={`btn btn-outline ${styles.viewAllBtn}`} onClick={() => openAt(0)}>
          {copy.viewAll}
        </button>
      ) : null}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={() => dialogRef.current?.close()}
          aria-label={copy.close}
        >
          ×
        </button>

        <div className={styles.stage}>
          {photos.length > 1 ? (
            <button type="button" className={styles.navBtn} onClick={() => go(-1)} aria-label={copy.prev}>
              <ChevronLeftIcon className={styles.navIcon} />
            </button>
          ) : null}

          <div className={styles.stageImage}>
            <Image
              src={resolveMediaUrl(photos[activeIndex]!.url)}
              alt={`${title} — ${activeIndex + 1}`}
              fill
              sizes="90vw"
              className={styles.imageContain}
            />
          </div>

          {photos.length > 1 ? (
            <button type="button" className={styles.navBtn} onClick={() => go(1)} aria-label={copy.next}>
              <ChevronRightIcon className={styles.navIcon} />
            </button>
          ) : null}
        </div>

        {photos.length > 1 ? (
          <p className={styles.counter}>
            {activeIndex + 1} / {photos.length}
          </p>
        ) : null}
      </dialog>
    </>
  );
}
