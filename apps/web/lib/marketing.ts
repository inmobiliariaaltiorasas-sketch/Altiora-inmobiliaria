import { getOrCreateSessionId } from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOUCH_SEEN_COOKIE = 'altiora_touch_seen';
const CAMPAIGN_PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

/**
 * v1 corrección sección 12: registra first-touch (una vez por sesión, sin campaña) y last-touch
 * (cada vez que llega una URL con parámetros de campaña) — no un touch por cada page view.
 */
export function captureMarketingTouch(): void {
  const params = new URLSearchParams(window.location.search);
  const hasCampaignParams = CAMPAIGN_PARAM_KEYS.some((key) => params.has(key));
  const alreadySeen = document.cookie.includes(`${TOUCH_SEEN_COOKIE}=1`);

  if (!hasCampaignParams && alreadySeen) return;

  const sessionId = getOrCreateSessionId();

  fetch(`${API_URL}/marketing-touches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      sessionId,
      utmSource: params.get('utm_source') ?? undefined,
      utmMedium: params.get('utm_medium') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
      utmContent: params.get('utm_content') ?? undefined,
      utmTerm: params.get('utm_term') ?? undefined,
      gclid: params.get('gclid') ?? undefined,
      fbclid: params.get('fbclid') ?? undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.pathname + window.location.search,
    }),
  }).catch(() => {});

  document.cookie = `${TOUCH_SEEN_COOKIE}=1; path=/; max-age=${180 * 86400}; samesite=lax`;
}
