import type { AiQualification, ContactOfferChoice } from '@altiora/shared-types';

export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

export interface SuggestedPropertyRef {
  slug: string;
  title: string;
}

export interface LlmConversationState {
  qualification: AiQualification | null;
  /** Resultado de la última búsqueda — permite resolver "la primera"/"la casa campestre" en el turno siguiente. */
  lastSearchResults: SuggestedPropertyRef[];
  /** slug de propiedad → veces que el usuario mostró interés puntual en ella. */
  propertyInterestCounts: Record<string, number>;
  lastDiscussedPropertySlug: string | null;
  contactOfferMade: boolean;
  contactOfferDeclined: boolean;
  awaitingContactChoice: boolean;
  lowConfidenceStreak: number;
}

export function initialConversationState(): LlmConversationState {
  return {
    qualification: null,
    lastSearchResults: [],
    propertyInterestCounts: {},
    lastDiscussedPropertySlug: null,
    contactOfferMade: false,
    contactOfferDeclined: false,
    awaitingContactChoice: false,
    lowConfidenceStreak: 0,
  };
}

export interface LlmConverseContext {
  history: Array<{ direction: 'IN' | 'OUT'; content: string }>;
  state: LlmConversationState;
  incomingText: string;
}

export interface LlmConverseDecision {
  replyText: string;
  updatedState: LlmConversationState;
  /** true en el turno donde se muestran las 4 opciones de contacto. */
  offerOptionsShown: boolean;
  contactAccepted: {
    choice: Exclude<ContactOfferChoice, 'DECLINE'>;
    propertySlug: string | null;
  } | null;
  escalateToHuman: boolean;
  escalateReason: string | null;
  /** slug consultado en este turno, si corresponde — para registrar PROPERTY_VIEWED. */
  propertyViewedSlug: string | null;
  appointmentRequested: { propertySlug: string } | null;
}

/**
 * Intercambiable sin tocar el resto del sistema (v1 sección 13): `MockLlmProvider` hoy,
 * un proveedor real (ej. Claude) después, detrás de esta misma interfaz.
 */
export interface LlmProvider {
  converse(ctx: LlmConverseContext): Promise<LlmConverseDecision>;
}
