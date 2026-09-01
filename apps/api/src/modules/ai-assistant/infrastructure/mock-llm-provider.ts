import { Inject, Injectable } from '@nestjs/common';
import { AI_TOOLS, type AiTools } from '../domain/ai-tools';
import type {
  LlmConverseContext,
  LlmConverseDecision,
  LlmConversationState,
  LlmProvider,
  SuggestedPropertyRef,
} from '../domain/llm-provider';

const PROPERTY_TYPE_KEYWORDS: Record<string, string> = {
  casa: 'casa',
  apartamento: 'apartamento',
  apto: 'apartamento',
  lote: 'lote',
  finca: 'finca',
  local: 'local-comercial',
};

const CITY_KEYWORDS: Record<string, string> = {
  cartago: 'cartago-valle-del-cauca',
};

const CONTACT_OFFER_TEXT =
  'Veo que estás interesado en esta propiedad. ¿Quieres que uno de nuestros asesores te ' +
  'contacte directamente para darte más información o ayudarte a agendar una visita?\n' +
  '1. WhatsApp\n2. Teléfono\n3. Correo electrónico\n4. No quiero que me contacten';

const CLARIFY_TEXT =
  '¿Buscás casa, apartamento, lote, finca o local comercial? Contame también en qué ' +
  'ciudad y con qué presupuesto aproximado, así te muestro opciones reales.';

const INTEREST_THRESHOLD = 2;
const LOW_CONFIDENCE_ESCALATION_THRESHOLD = 2;

/**
 * Máquina de estados determinística — no depende de ningún LLM real. Reproduce exactamente la
 * política de conversación del v1 (secciones 5 y 6 de correcciones): primero ayuda, recolecta
 * contexto comercial, y solo pide contacto cuando detecta interés real y explícito.
 */
@Injectable()
export class MockLlmProvider implements LlmProvider {
  constructor(@Inject(AI_TOOLS) private readonly tools: AiTools) {}

  async converse(ctx: LlmConverseContext): Promise<LlmConverseDecision> {
    const text = normalize(ctx.incomingText);
    const state = ctx.state;

    if (state.awaitingContactChoice) {
      return this.handleContactChoice(text, state);
    }

    if (wantsHuman(text)) {
      return {
        replyText: 'Listo, ya te conecto con un asesor humano. En un momento te escribe.',
        updatedState: { ...state, lowConfidenceStreak: 0 },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: true,
        escalateReason: 'user_requested_human',
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    const referencedSlug = resolveReferencedProperty(text, state);
    if (referencedSlug) {
      return this.handlePropertyDetail(referencedSlug, state);
    }

    if (hasSearchIntent(text)) {
      return this.handleSearch(text, state);
    }

    if (isGreetingOrHelp(text)) {
      return {
        replyText:
          'Hola, soy el asistente de ALTiora. Te puedo ayudar a buscar propiedades, comparar ' +
          'precios y ubicaciones, o resolver dudas. ' +
          CLARIFY_TEXT,
        updatedState: { ...state, lowConfidenceStreak: 0 },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: false,
        escalateReason: null,
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    // Nada matcheó — baja confianza.
    const lowConfidenceStreak = state.lowConfidenceStreak + 1;
    if (lowConfidenceStreak >= LOW_CONFIDENCE_ESCALATION_THRESHOLD) {
      return {
        replyText:
          'Perdón, no logro entender bien lo que necesitás. Te paso con un asesor humano para ' +
          'que te ayude mejor.',
        updatedState: { ...state, lowConfidenceStreak },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: true,
        escalateReason: 'low_confidence',
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    return {
      replyText: CLARIFY_TEXT,
      updatedState: { ...state, lowConfidenceStreak },
      offerOptionsShown: false,
      contactAccepted: null,
      escalateToHuman: false,
      escalateReason: null,
      propertyViewedSlug: null,
      appointmentRequested: null,
    };
  }

  private handleContactChoice(text: string, state: LlmConversationState): LlmConverseDecision {
    const propertySlug = state.lastDiscussedPropertySlug;

    if (/(^|\b)(4|no|no gracias|no quiero)(\b|$)/.test(text)) {
      return {
        replyText: 'Entendido, no vamos a insistir. Seguí preguntando lo que necesites.',
        updatedState: {
          ...state,
          awaitingContactChoice: false,
          contactOfferDeclined: true,
          lowConfidenceStreak: 0,
        },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: false,
        escalateReason: null,
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    const choice = parseContactChoice(text);
    if (choice) {
      return {
        replyText: `Perfecto, ya avisé a un asesor para que te contacte por ${choiceLabel(choice)}. Te va a escribir pronto.`,
        updatedState: {
          ...state,
          awaitingContactChoice: false,
          qualification: 'HIGH',
          lowConfidenceStreak: 0,
        },
        offerOptionsShown: false,
        contactAccepted: { choice, propertySlug },
        escalateToHuman: false,
        escalateReason: null,
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    const lowConfidenceStreak = state.lowConfidenceStreak + 1;
    if (lowConfidenceStreak >= LOW_CONFIDENCE_ESCALATION_THRESHOLD) {
      return {
        replyText: 'Te paso con un asesor humano para que te ayude con esto.',
        updatedState: { ...state, lowConfidenceStreak, awaitingContactChoice: false },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: true,
        escalateReason: 'low_confidence',
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    return {
      replyText:
        'No entendí tu elección. Respondé 1 (WhatsApp), 2 (Teléfono), 3 (Correo) o 4 (No, gracias).',
      updatedState: { ...state, lowConfidenceStreak },
      offerOptionsShown: false,
      contactAccepted: null,
      escalateToHuman: false,
      escalateReason: null,
      propertyViewedSlug: null,
      appointmentRequested: null,
    };
  }

  private async handleSearch(
    text: string,
    state: LlmConversationState,
  ): Promise<LlmConverseDecision> {
    const propertyTypeSlug = matchKeyword(text, PROPERTY_TYPE_KEYWORDS);
    const citySlug = matchKeyword(text, CITY_KEYWORDS);
    const operationType = /arriendo|alquiler|renta/.test(text)
      ? ('RENT' as const)
      : /venta|comprar/.test(text)
        ? ('SALE' as const)
        : undefined;
    const bedroomsMatch = text.match(/(\d+)\s*habitacion/);

    const results = await this.tools.searchProperties({
      propertyTypeSlug,
      citySlug,
      operationType,
      minBedrooms: bedroomsMatch ? Number(bedroomsMatch[1]) : undefined,
    });

    if (results.length === 0) {
      return {
        replyText:
          'No encontré propiedades publicadas que matcheen exactamente eso ahora mismo. ' +
          '¿Querés que te muestre otras opciones similares?',
        updatedState: { ...state, lowConfidenceStreak: 0, lastSearchResults: [] },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: false,
        escalateReason: null,
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    const refs: SuggestedPropertyRef[] = results.map((r) => ({
      slug: r.slug,
      title: r.translation.title,
    }));

    const lines = results
      .slice(0, 3)
      .map(
        (r, i) =>
          `${i + 1}. ${r.translation.title} — ${formatPrice(r.price, r.currency)} — ${r.bedrooms} hab.`,
      )
      .join('\n');

    return {
      replyText: `Encontré estas opciones:\n${lines}\n¿Querés que te cuente más sobre alguna?`,
      updatedState: { ...state, lowConfidenceStreak: 0, lastSearchResults: refs },
      offerOptionsShown: false,
      contactAccepted: null,
      escalateToHuman: false,
      escalateReason: null,
      propertyViewedSlug: null,
      appointmentRequested: null,
    };
  }

  private async handlePropertyDetail(
    slug: string,
    state: LlmConversationState,
  ): Promise<LlmConverseDecision> {
    const property = await this.tools.getPropertyDetail(slug);
    if (!property) {
      return {
        replyText: 'No encontré el detalle de esa propiedad. ¿Podés confirmarme cuál te interesa?',
        updatedState: { ...state, lowConfidenceStreak: 0 },
        offerOptionsShown: false,
        contactAccepted: null,
        escalateToHuman: false,
        escalateReason: null,
        propertyViewedSlug: null,
        appointmentRequested: null,
      };
    }

    const count = (state.propertyInterestCounts[slug] ?? 0) + 1;
    const interestCounts = { ...state.propertyInterestCounts, [slug]: count };

    const detailText =
      `${property.translation.title}: ${formatPrice(property.price, property.currency)}, ` +
      `${property.bedrooms} habitaciones, ${property.bathrooms} baños, ${property.builtAreaM2} m², ` +
      `en ${property.location.city.name}. Estado: ${property.status === 'PUBLISHED' ? 'disponible' : property.status}.`;

    const shouldOffer =
      count >= INTEREST_THRESHOLD && !state.contactOfferMade && !state.contactOfferDeclined;

    return {
      replyText: shouldOffer ? `${detailText}\n\n${CONTACT_OFFER_TEXT}` : detailText,
      updatedState: {
        ...state,
        lowConfidenceStreak: 0,
        propertyInterestCounts: interestCounts,
        lastDiscussedPropertySlug: slug,
        awaitingContactChoice: shouldOffer,
        contactOfferMade: shouldOffer || state.contactOfferMade,
        qualification: shouldOffer ? 'HIGH' : state.qualification,
      },
      offerOptionsShown: shouldOffer,
      contactAccepted: null,
      escalateToHuman: false,
      escalateReason: null,
      propertyViewedSlug: slug,
      appointmentRequested: null,
    };
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

function matchKeyword(text: string, dictionary: Record<string, string>): string | undefined {
  for (const [keyword, value] of Object.entries(dictionary)) {
    if (text.includes(keyword)) return value;
  }
  return undefined;
}

function hasSearchIntent(text: string): boolean {
  if (matchKeyword(text, PROPERTY_TYPE_KEYWORDS)) return true;
  if (matchKeyword(text, CITY_KEYWORDS)) return true;
  return /presupuesto|precio|busco|buscar|mostrar|opciones/.test(text);
}

function isGreetingOrHelp(text: string): boolean {
  return (
    /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hi)\b/.test(text) ||
    text.includes('ayuda')
  );
}

function wantsHuman(text: string): boolean {
  return /asesor humano|hablar con (un )?(humano|persona|alguien)|persona real/.test(text);
}

function resolveReferencedProperty(text: string, state: LlmConversationState): string | null {
  if (state.lastSearchResults.length === 0) return null;

  if (/\bla primera\b|^1\b/.test(text)) return state.lastSearchResults[0]?.slug ?? null;
  if (/\bla segunda\b|^2\b/.test(text)) return state.lastSearchResults[1]?.slug ?? null;
  if (/\bla tercera\b|^3\b/.test(text)) return state.lastSearchResults[2]?.slug ?? null;

  const wantsMoreDetail = /cuenta|conta|mas sobre|detalle|financiacion|disponib|esa\b/.test(text);
  if (!wantsMoreDetail && !state.lastDiscussedPropertySlug) return null;

  for (const ref of state.lastSearchResults) {
    const titleWords = normalize(ref.title)
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !['casa', 'apartamento'].includes(word));
    if (titleWords.some((word) => text.includes(word))) return ref.slug;
  }

  // "cuéntame más" / "¿tiene financiación?" sin nombrar la propiedad → sigue hablando de la última.
  if (wantsMoreDetail && state.lastDiscussedPropertySlug) return state.lastDiscussedPropertySlug;

  return null;
}

function parseContactChoice(text: string): 'WHATSAPP' | 'PHONE' | 'EMAIL' | null {
  if (/^1\b|whatsapp/.test(text)) return 'WHATSAPP';
  if (/^2\b|telefono|llamada/.test(text)) return 'PHONE';
  if (/^3\b|correo|email/.test(text)) return 'EMAIL';
  return null;
}

function choiceLabel(choice: 'WHATSAPP' | 'PHONE' | 'EMAIL'): string {
  if (choice === 'WHATSAPP') return 'WhatsApp';
  if (choice === 'PHONE') return 'teléfono';
  return 'correo electrónico';
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
