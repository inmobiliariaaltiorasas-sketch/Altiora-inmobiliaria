import Link from 'next/link';
import Image from 'next/image';
import type { PropertySummaryDto, SupportedLocale } from '@altiora/shared-types';
import { formatPrice } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/api-client';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { BedIcon, BathIcon, CarIcon, RulerIcon, PinIcon } from '@/components/ui/icons';
import styles from './PropertyCard.module.css';

const OPERATION_LABEL: Record<SupportedLocale, Record<'SALE' | 'RENT', string>> = {
  'es-CO': { SALE: 'Venta', RENT: 'Arriendo' },
  'en-US': { SALE: 'For sale', RENT: 'For rent' },
};

const COPY: Record<SupportedLocale, { featured: string; details: string; favorite: string }> = {
  'es-CO': { featured: 'Destacada', details: 'Ver detalles', favorite: 'Guardar en favoritos' },
  'en-US': { featured: 'Featured', details: 'View details', favorite: 'Save to favorites' },
};

export function PropertyCard({
  property,
  locale,
  featured = false,
}: {
  property: PropertySummaryDto;
  locale: SupportedLocale;
  featured?: boolean;
}) {
  const copy = COPY[locale];
  const location = property.location.neighborhood
    ? `${property.location.neighborhood.name}, ${property.location.city.name}`
    : property.location.city.name;

  // Una propiedad como un lote puede tener 0 habitaciones/baños/parqueaderos de forma
  // legítima — mostrar "0" ahí se lee como un dato roto, así que solo se listan los datos
  // que aplican en vez de forzar las cuatro columnas siempre.
  const stats: Array<{ key: string; Icon: typeof BedIcon; value: string | number }> = [
    { key: 'bed', Icon: BedIcon, value: property.bedrooms },
    { key: 'bath', Icon: BathIcon, value: property.bathrooms },
    { key: 'parking', Icon: CarIcon, value: property.parkingSpots },
  ].filter((stat) => (stat.value as number) > 0);
  if (property.builtAreaM2 > 0) {
    stats.push({ key: 'area', Icon: RulerIcon, value: `${property.builtAreaM2} m²` });
  }

  return (
    <article className={`card ${styles.card}`}>
      <Link href={`/${locale}/propiedades/${property.slug}`} className={styles.mediaLink}>
        <div className={styles.media}>
          {property.coverImageUrl ? (
            <Image
              src={resolveMediaUrl(property.coverImageUrl)}
              alt={property.translation.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className={styles.mediaFallback} aria-hidden="true" />
          )}
          <span className={`badge ${styles.operationBadge}`}>
            {OPERATION_LABEL[locale][property.operationType]}
          </span>
          {featured ? <span className={styles.featuredBadge}>{copy.featured}</span> : null}
        </div>
      </Link>

      <div className={styles.favoriteSlot}>
        <FavoriteButton label={copy.favorite} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={`/${locale}/propiedades/${property.slug}`} className={styles.titleLink}>
            {property.translation.title}
          </Link>
        </h3>
        <p className={styles.location}>
          <PinIcon className={styles.locationIcon} aria-hidden="true" />
          {location}
        </p>

        {stats.length > 0 ? (
          <ul className={styles.stats}>
            {stats.map((stat) => (
              <li key={stat.key}>
                <stat.Icon className={styles.statIcon} aria-hidden="true" />
                {stat.value}
              </li>
            ))}
          </ul>
        ) : null}

        <div className={`price ${styles.price}`}>
          {formatPrice(property.price, property.currency, locale)}
        </div>

        <Link
          href={`/${locale}/propiedades/${property.slug}`}
          className={`btn btn-outline ${styles.cta}`}
        >
          {copy.details}
        </Link>
      </div>
    </article>
  );
}
