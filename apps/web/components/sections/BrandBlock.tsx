import Image from 'next/image';
import styles from './BrandBlock.module.css';

/**
 * Textos fijos, no se traducen ni se cambian (indicación explícita del usuario).
 * La foto es un paisaje real de una ciudad colombiana de valle (Medellín, Unsplash, licencia
 * libre) — no es literalmente Cartago (no hay fotografía propia de Cartago en los assets
 * todavía), por eso el alt no lo afirma. ALTiora puede reemplazar el archivo por una foto
 * propia de Cartago sin tocar el componente.
 */
export function BrandBlock() {
  return (
    <div className={styles.block}>
      <div className={styles.photo}>
        <Image
          src="/brand-landscape.jpg"
          alt="Ciudad colombiana rodeada de montañas, en un valle"
          fill
          sizes="(max-width: 720px) 100vw, 45vw"
          className={styles.photoImg}
        />
        <div className={styles.photoWash} aria-hidden="true" />
      </div>
      <div className={styles.panel}>
        <Image
          src="/altiora-logo.jpg"
          alt="ALTiora Construcciones e Inmobiliaria S.A.S."
          width={44}
          height={44}
          className={styles.logo}
        />
        <p className={styles.headline}>Tu patrimonio, nuestra prioridad.</p>
        <p className={styles.subline}>Construimos confianza, conectamos sueños.</p>
      </div>
    </div>
  );
}
