'use client';

import { useEffect } from 'react';
import { captureMarketingTouch } from '@/lib/marketing';
import { trackEvent } from '@/lib/analytics';

/** Se monta una vez por página pública — captura atribución y el evento page_view (v1 sección 15). */
export function SessionTracker() {
  useEffect(() => {
    captureMarketingTouch();
    trackEvent('page_view');
  }, []);

  return null;
}
