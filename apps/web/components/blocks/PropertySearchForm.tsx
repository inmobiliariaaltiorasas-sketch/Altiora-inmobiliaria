import Link from 'next/link';
import type { CityDto, PropertyTypeDto, SupportedLocale } from '@altiora/shared-types';
import { SearchIcon } from '@/components/ui/icons';
import styles from './PropertySearchForm.module.css';

const COPY: Record<
  SupportedLocale,
  {
    city: string;
    type: string;
    sale: string;
    rent: string;
    any: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    submit: string;
    quickLabel: string;
  }
> = {
  'es-CO': {
    city: 'Ubicación',
    type: 'Tipo de propiedad',
    sale: 'Comprar',
    rent: 'Arrendar',
    any: 'Cualquiera',
    minPrice: 'Precio mínimo',
    maxPrice: 'Precio máximo',
    bedrooms: 'Habitaciones',
    submit: 'Buscar',
    quickLabel: 'Búsquedas frecuentes:',
  },
  'en-US': {
    city: 'Location',
    type: 'Property type',
    sale: 'Buy',
    rent: 'Rent',
    any: 'Any',
    minPrice: 'Min. price',
    maxPrice: 'Max. price',
    bedrooms: 'Bedrooms',
    submit: 'Search',
    quickLabel: 'Popular searches:',
  },
};

export interface QuickSearchLink {
  label: string;
  href: string;
}

export function PropertySearchForm({
  locale,
  cities,
  propertyTypes,
  defaults,
  variant = 'default',
  quickSearches,
}: {
  locale: SupportedLocale;
  cities: CityDto[];
  propertyTypes: PropertyTypeDto[];
  defaults?: Record<string, string>;
  /** `hero` = tabs Comprar/Arrendar + pills, calcado de la referencia visual de la Home. */
  variant?: 'default' | 'hero';
  quickSearches?: QuickSearchLink[];
}) {
  const copy = COPY[locale];
  const d = defaults ?? {};
  const isHero = variant === 'hero';

  return (
    <div className={isHero ? styles.heroWrapper : undefined}>
      <form
        method="get"
        action={`/${locale}/propiedades`}
        className={`card ${styles.form} ${isHero ? styles.formHero : ''}`}
      >
        {isHero ? (
          <div className={styles.tabs} role="radiogroup" aria-label={`${copy.sale} / ${copy.rent}`}>
            <label className={styles.tab}>
              <input
                type="radio"
                name="operation"
                value="SALE"
                defaultChecked={(d.operation ?? 'SALE') === 'SALE'}
                className={styles.tabInput}
              />
              <span className={styles.tabLabel}>{copy.sale}</span>
            </label>
            <label className={styles.tab}>
              <input
                type="radio"
                name="operation"
                value="RENT"
                defaultChecked={d.operation === 'RENT'}
                className={styles.tabInput}
              />
              <span className={styles.tabLabel}>{copy.rent}</span>
            </label>
          </div>
        ) : null}

        <div className={`field ${styles.field}`}>
          <label htmlFor="search-city">{copy.city}</label>
          <select id="search-city" name="city" defaultValue={d.city ?? ''}>
            <option value="">{copy.any}</option>
            {cities.map((city) => (
              <option key={city.id} value={city.slug}>
                {city.name}
                {city.department ? `, ${city.department}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className={`field ${styles.field}`}>
          <label htmlFor="search-type">{copy.type}</label>
          <select id="search-type" name="type" defaultValue={d.type ?? ''}>
            <option value="">{copy.any}</option>
            {propertyTypes.map((type) => (
              <option key={type.id} value={type.slug}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {!isHero ? (
          <div className={`field ${styles.field}`}>
            <label htmlFor="search-operation">{copy.sale}</label>
            <select id="search-operation" name="operation" defaultValue={d.operation ?? ''}>
              <option value="">{copy.any}</option>
              <option value="SALE">{copy.sale}</option>
              <option value="RENT">{copy.rent}</option>
            </select>
          </div>
        ) : null}

        <div className={`field ${styles.field}`}>
          <label htmlFor="search-min-price">{copy.minPrice}</label>
          <input
            id="search-min-price"
            type="number"
            name="minPrice"
            min={0}
            defaultValue={d.minPrice ?? ''}
          />
        </div>

        <div className={`field ${styles.field}`}>
          <label htmlFor="search-max-price">{copy.maxPrice}</label>
          <input
            id="search-max-price"
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={d.maxPrice ?? ''}
          />
        </div>

        <div className={`field ${styles.field}`}>
          <label htmlFor="search-min-bedrooms">{copy.bedrooms}</label>
          <select id="search-min-bedrooms" name="minBedrooms" defaultValue={d.minBedrooms ?? ''}>
            <option value="">{copy.any}</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>

        <div className={styles.submitCell}>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            <SearchIcon className={styles.submitIcon} aria-hidden="true" />
            {copy.submit}
          </button>
        </div>

        {isHero && quickSearches && quickSearches.length > 0 ? (
          <div className={styles.quick}>
            <span className={styles.quickLabel}>{copy.quickLabel}</span>
            <div className={styles.quickList}>
              {quickSearches.map((item) => (
                <Link key={item.href} href={item.href} className={styles.quickPill}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}
