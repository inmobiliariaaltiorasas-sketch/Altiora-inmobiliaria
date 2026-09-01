import type { ClientAnalyticsEventType } from '@altiora/shared-types';
import { getOrCreateSessionId } from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Eventos de comportamiento (v1 sección 15). Los eventos de negocio críticos
 * (lead_started, lead_submitted, advisor_contact_requested) los emite el backend, no el cliente.
 */
export function trackEvent(
  type: ClientAnalyticsEventType,
  options: { propertyId?: string; payload?: Record<string, unknown> } = {},
): void {
  const sessionId = getOrCreateSessionId();

  fetch(`${API_URL}/analytics/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      type,
      sessionId,
      propertyId: options.propertyId,
      payload: options.payload,
    }),
  }).catch(() => {
    /* best-effort: un bloqueador de ads no debe romper la navegación */
  });
}
