import type { FaqDto, SupportedLocale } from '@altiora/shared-types';
import { apiClient } from '@/lib/api-client';

export function getCityFaqs(citySlug: string, locale: SupportedLocale): Promise<FaqDto[]> {
  return apiClient(`/content/faqs?citySlug=${citySlug}&locale=${locale}`, {
    // Corto a propósito: las FAQ dinámicas dependen del catálogo real (v1 sección 10).
    next: { revalidate: 30 },
  });
}
