import type { LeadFunnelStage, LeadSourceChannel } from './leads';

/** Eventos de v1 sección 15 que puede disparar el cliente directamente (sin PII). */
export const CLIENT_ANALYTICS_EVENT_TYPES = [
  'page_view',
  'property_view',
  'property_search',
  'property_filter',
  'property_favorite',
  'whatsapp_click',
  'phone_click',
  'email_click',
  /** Fase 3: disparados por un futuro widget de chat web — el motor de ai-assistant ya es
   * channel-agnostic (ver ai-assistant.service.ts), falta solo la UI del widget. */
  'chat_opened',
  'chat_message',
] as const;
export type ClientAnalyticsEventType = (typeof CLIENT_ANALYTICS_EVENT_TYPES)[number];

/** Eventos de negocio críticos — el backend los emite al persistir, nunca el navegador. */
export const SERVER_ANALYTICS_EVENT_TYPES = [
  'lead_started',
  'lead_submitted',
  'advisor_contact_requested',
  'ai_conversation_started',
  'ai_lead_qualified',
  'appointment_started',
  'appointment_booked',
] as const;
export type ServerAnalyticsEventType = (typeof SERVER_ANALYTICS_EVENT_TYPES)[number];

export interface TrackEventRequestDto {
  type: ClientAnalyticsEventType;
  sessionId: string;
  propertyId?: string;
  payload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Fase 3 — reporting para /admin/analytics
// ---------------------------------------------------------------------------

export interface FunnelStageCountDto {
  stage: LeadFunnelStage;
  count: number;
}

/** Una fila por combinación fuente+campaña realmente vista en MarketingTouch/Lead — nada inventado. */
export interface CampaignAttributionRowDto {
  source: LeadSourceChannel;
  utmCampaign: string | null;
  leadsCount: number;
  wonCount: number;
  convertedPropertyTitles: string[];
}

export interface AnalyticsCampaignsSummaryDto {
  rows: CampaignAttributionRowDto[];
  totalLeads: number;
  totalWon: number;
}

export interface TopPropertyStatDto {
  propertyId: string;
  slug: string;
  title: string;
  viewCount: number;
  inquiryCount: number;
}

export interface AdminAnalyticsSummaryDto {
  funnel: FunnelStageCountDto[];
  topProperties: TopPropertyStatDto[];
}
