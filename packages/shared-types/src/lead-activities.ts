export const LEAD_ACTIVITY_TYPES = [
  'CONVERSATION_STARTED',
  'PROPERTY_VIEWED',
  'CONTACT_OFFERED',
  'CONTACT_ACCEPTED',
  'CONTACT_DECLINED',
  'HANDOFF_TO_HUMAN',
  'LEAD_CREATED',
  'STAGE_CHANGED',
  'APPOINTMENT_PROPOSED',
  'APPOINTMENT_CONFIRMED',
  'NOTE',
] as const;
export type LeadActivityType = (typeof LEAD_ACTIVITY_TYPES)[number];

export interface LeadActivityDto {
  id: string;
  type: LeadActivityType;
  description: string;
  occurredAt: string;
}

export interface ScoreBreakdownItemDto {
  signal: string;
  points: number;
  detail: string;
}

export interface LeadScoreDto {
  score: number;
  breakdown: ScoreBreakdownItemDto[];
}
