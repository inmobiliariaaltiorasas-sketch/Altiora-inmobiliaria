import type { Currency, SupportedLocale } from '@altiora/shared-types';

const INTL_LOCALE: Record<SupportedLocale, string> = { 'es-CO': 'es-CO', 'en-US': 'en-US' };

export function formatPrice(price: number, currency: Currency, locale: SupportedLocale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatArea(areaM2: number, locale: SupportedLocale): string {
  const value = new Intl.NumberFormat(INTL_LOCALE[locale]).format(areaM2);
  return `${value} m²`;
}

/**
 * Estimado informativo, nunca el precio real (que queda en COP en `Property.price`) — v1
 * corrección sección 3. `null` si la propiedad ya está en USD, no hace falta convertir nada.
 */
export function formatUsdEstimate(
  price: number,
  currency: Currency,
  fxRateUsdCop: number,
): string | null {
  if (currency !== 'COP') return null;
  const estimate = price / fxRateUsdCop;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(estimate);
}
