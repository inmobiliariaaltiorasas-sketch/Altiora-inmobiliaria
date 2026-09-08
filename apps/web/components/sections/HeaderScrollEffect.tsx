'use client';

import { useEffect } from 'react';

/**
 * El Header es un Server Component (usa getTranslations), así que el estado de scroll
 * se maneja acá aparte y se aplica como atributo `data-scrolled` sobre el <header> real
 * vía DOM, en vez de convertir todo el Header en Client Component.
 */
export function HeaderScrollEffect() {
  useEffect(() => {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = () => {
      header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
