export const SUPPORTED_LOCALES = ['es-CO', 'en-US'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = 'es-CO';
