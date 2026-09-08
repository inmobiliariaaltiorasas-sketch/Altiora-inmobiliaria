import type { SupportedLocale } from '@altiora/shared-types';
import styles from './PropertyLocationMap.module.css';

const COPY: Record<SupportedLocale, { viewOnGoogleMaps: string; iframeTitle: string }> = {
  'es-CO': {
    viewOnGoogleMaps: 'Ver en Google Maps →',
    iframeTitle: 'Mapa de ubicación de la propiedad',
  },
  'en-US': {
    viewOnGoogleMaps: 'View on Google Maps →',
    iframeTitle: 'Property location map',
  },
};

/**
 * bbox pensado para un acercamiento de barrio (~600-700m de lado), suficiente para ubicar
 * la propiedad sin depender de una librería de mapas ni de una API key.
 */
const BBOX_DELTA = 0.006;
/** Delta más amplio para 'approximate' — junto con el redondeo de coordenadas, da un acercamiento a nivel de sector (~1-2km). */
const BBOX_DELTA_APPROXIMATE = 0.012;
/** ~1.1km de margen en el ecuador — suficiente para no señalar la vivienda exacta. */
const APPROXIMATE_DECIMALS = 2;

export type LocationPrecision = 'exact' | 'approximate' | 'hidden';

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function PropertyLocationMap({
  latitude,
  longitude,
  locale,
  /**
   * Hoy no existe ningún campo en el backend que controle esto — todas las fichas usan 'exact'.
   * Queda como prop explícita para que, cuando Altiora decida no revelar la ubicación exacta de
   * una vivienda (ej. ocupada), alcance con pasar 'approximate'/'hidden' sin tocar este componente.
   */
  precision = 'exact',
}: {
  latitude: number | null;
  longitude: number | null;
  locale: SupportedLocale;
  precision?: LocationPrecision;
}) {
  if (latitude == null || longitude == null || precision === 'hidden') {
    return null;
  }

  const isApproximate = precision === 'approximate';
  const lat = isApproximate ? roundTo(latitude, APPROXIMATE_DECIMALS) : latitude;
  const lng = isApproximate ? roundTo(longitude, APPROXIMATE_DECIMALS) : longitude;
  const delta = isApproximate ? BBOX_DELTA_APPROXIMATE : BBOX_DELTA;

  const copy = COPY[locale];
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join('%2C');
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat}%2C${lng}&layer=mapnik`;
  const googleMapsHref = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <div className={styles.wrapper}>
      <iframe
        src={embedSrc}
        title={copy.iframeTitle}
        loading="lazy"
        className={styles.frame}
      />
      <a href={googleMapsHref} target="_blank" rel="noopener noreferrer" className={styles.link}>
        {copy.viewOnGoogleMaps}
      </a>
    </div>
  );
}
