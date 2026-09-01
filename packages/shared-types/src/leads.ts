import type { ScoreBreakdownItemDto, LeadActivityDto } from './lead-activities';
import type { AppointmentDto } from './appointments';
import type { ConversationTranscriptDto } from './ai-assistant';

export const PREFERRED_CHANNELS = ['WHATSAPP', 'PHONE', 'EMAIL'] as const;
export type PreferredChannel = (typeof PREFERRED_CHANNELS)[number];

export const LEAD_SOURCE_CHANNELS = [
  'ORGANIC',
  'GOOGLE',
  'GOOGLE_ADS',
  'FACEBOOK',
  'INSTAGRAM',
  'META_ADS',
  'TIKTOK',
  'WHATSAPP',
  'DIRECT',
  'REFERRAL',
  'WEBSITE',
  'AI_AGENT',
  'OTHER',
] as const;
export type LeadSourceChannel = (typeof LEAD_SOURCE_CHANNELS)[number];

export const LEAD_FUNNEL_STAGES = [
  'VISITOR',
  'ENGAGED',
  'CONTACT',
  'LEAD',
  'QUALIFIED',
  'APPOINTMENT',
  'VISIT',
  'NEGOTIATION',
  'OFFER',
  'WON',
  'LOST',
] as const;
export type LeadFunnelStage = (typeof LEAD_FUNNEL_STAGES)[number];

export const LEAD_LOST_REASONS = [
  'BUDGET',
  'NO_RESPONSE',
  'CHOSE_ANOTHER_PROPERTY',
  'FINANCING',
  'NOT_THE_RIGHT_TIME',
  'PROPERTY_SOLD',
  'OTHER',
] as const;
export type LeadLostReason = (typeof LEAD_LOST_REASONS)[number];

export const INQUIRY_TYPES = [
  'GENERAL_INFO',
  'WHATSAPP_CONTACT',
  'ADVISOR_REQUEST',
  'VISIT_REQUEST',
] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INTEREST_LEVELS = ['HIGH', 'MEDIUM', 'DISCARDED'] as const;
export type InterestLevel = (typeof INTEREST_LEVELS)[number];

/**
 * Lo que entrega el formulario público (ficha de propiedad o página de contacto).
 * Deliberadamente mínimo: nombre + un canal de contacto — v1 corrección sección 7.
 */
export interface CreateInquiryRequestDto {
  name: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  preferredChannel: PreferredChannel;
  inquiryType: InquiryType;
  propertyId?: string;
  note?: string;
  sessionId: string;
}

export interface MarketingTouchInputDto {
  sessionId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landingPage: string;
}

export interface PropertyInquirySummaryDto {
  id: string;
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  inquiryType: InquiryType;
  interestLevel: InterestLevel;
  note: string | null;
  createdAt: string;
}

export interface MarketingTouchDto {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  gclid: string | null;
  fbclid: string | null;
  referrer: string | null;
  landingPage: string | null;
  createdAt: string;
}

export interface LeadSummaryDto {
  id: string;
  contactName: string;
  preferredChannel: PreferredChannel;
  source: LeadSourceChannel;
  funnelStage: LeadFunnelStage;
  assignedAgentName: string | null;
  createdAt: string;
}

export interface LeadDetailDto extends LeadSummaryDto {
  contact: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
  };
  budget: number | null;
  notes: string | null;
  lostReason: LeadLostReason | null;
  lostAt: string | null;
  firstTouch: MarketingTouchDto | null;
  lastTouch: MarketingTouchDto | null;
  inquiries: PropertyInquirySummaryDto[];
  /** Fase 2 — CRM enriquecido: score explicable, historial, conversación de origen, citas. */
  score: number;
  scoreBreakdown: ScoreBreakdownItemDto[];
  activities: LeadActivityDto[];
  appointments: AppointmentDto[];
  conversation: ConversationTranscriptDto | null;
}

export interface UpdateLeadDto {
  funnelStage?: LeadFunnelStage;
  assignedAgentId?: string;
  notes?: string;
  budget?: number;
}

export interface MarkLeadLostDto {
  reason: LeadLostReason;
}
