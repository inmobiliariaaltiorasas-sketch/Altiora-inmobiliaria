export const CONVERSATION_CHANNELS = ['WHATSAPP', 'WEB'] as const;
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

export const CONVERSATION_STATUSES = ['BOT', 'HUMAN'] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const MESSAGE_DIRECTIONS = ['IN', 'OUT'] as const;
export type MessageDirection = (typeof MESSAGE_DIRECTIONS)[number];

export const AI_QUALIFICATIONS = ['LOW', 'MEDIUM', 'HIGH'] as const;
export type AiQualification = (typeof AI_QUALIFICATIONS)[number];

/** Opciones que el bot ofrece una vez que detecta interés real — v1 corrección sección 6. */
export const CONTACT_OFFER_CHOICES = ['WHATSAPP', 'PHONE', 'EMAIL', 'DECLINE'] as const;
export type ContactOfferChoice = (typeof CONTACT_OFFER_CHOICES)[number];

export interface SimulateInboundMessageDto {
  phoneNumber: string;
  text: string;
}

export interface ConversationTurnDto {
  replyText: string;
  offerOptionsShown: boolean;
  escalatedToHuman: boolean;
  leadCreated: boolean;
  leadId: string | null;
  conversationId: string;
}

export interface AiMessageDto {
  direction: MessageDirection;
  content: string;
  createdAt: string;
}

/** Transcripción que ve el asesor en el CRM al abrir un lead que vino de WhatsApp/IA. */
export interface ConversationTranscriptDto {
  id: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  qualification: AiQualification | null;
  summary: string | null;
  messages: AiMessageDto[];
}
