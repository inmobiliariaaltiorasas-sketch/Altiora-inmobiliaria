import type { SupportedLocale } from '@altiora/shared-types';
import styles from './Testimonials.module.css';

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole?: string;
}

const TITLE: Record<SupportedLocale, string> = {
  'es-CO': 'Lo que dicen quienes ya confiaron en Altiora',
  'en-US': 'What people who trusted Altiora say',
};

/**
 * Oculto por diseño: no hay testimonios reales de clientes todavía (v1 regla 24 — no inventar
 * datos). Queda listo para recibir contenido real sin volver a tocar el layout de Home.
 */
export function Testimonials({
  locale,
  testimonials,
}: {
  locale: SupportedLocale;
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{TITLE[locale]}</h2>
      <div className={styles.grid}>
        {testimonials.map((testimonial) => (
          <blockquote key={testimonial.id} className={`card ${styles.card}`}>
            <p className={styles.quote}>&ldquo;{testimonial.quote}&rdquo;</p>
            <footer className={styles.author}>
              <span className={styles.authorName}>{testimonial.authorName}</span>
              {testimonial.authorRole ? (
                <span className={styles.authorRole}>{testimonial.authorRole}</span>
              ) : null}
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
