import type {
  ConversationChannel,
  ContactOfferChoice,
  OperationType,
  PropertyDetailDto,
  PropertySummaryDto,
} from '@altiora/shared-types';

export const AI_TOOLS = Symbol('AI_TOOLS');

export interface SearchPropertiesArgs {
  citySlug?: string;
  propertyTypeSlug?: string;
  operationType?: OperationType;
  minBedrooms?: number;
  maxPrice?: number;
}

export interface CreateOrUpdateLeadArgs {
  sessionKey: string;
  channel: ConversationChannel;
  name: string;
  contactChannel: Exclude<ContactOfferChoice, 'DECLINE'>;
  contactValue: string;
  propertyId?: string;
}

/**
 * Mismo contrato que usaría un LLM real: nunca acceso directo a Prisma desde el `LlmProvider`,
 * siempre a través de datos reales de la API (v1 sección 5 de correcciones — nunca inventar
 * precios/disponibilidad).
 */
export interface AiTools {
  searchProperties(args: SearchPropertiesArgs): Promise<PropertySummaryDto[]>;
  getPropertyDetail(slug: string): Promise<PropertyDetailDto | null>;
  createOrUpdateLead(args: CreateOrUpdateLeadArgs): Promise<{ leadId: string }>;
  proposeAppointmentSlot(input: {
    leadId: string;
    propertyId: string;
    proposedAt: Date;
  }): Promise<{ appointmentId: string }>;
}
