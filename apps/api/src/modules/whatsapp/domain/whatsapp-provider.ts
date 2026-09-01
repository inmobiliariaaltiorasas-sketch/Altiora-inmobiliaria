export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');

export interface WhatsAppSendResult {
  providerMessageId: string;
}

/**
 * Swappable detrás de esta interfaz: `MockWhatsAppProvider` (default sin credenciales) o
 * `MetaWhatsAppProvider` (Cloud API real) — el resto del sistema nunca sabe cuál está activa.
 */
export interface WhatsAppProvider {
  sendMessage(to: string, text: string): Promise<WhatsAppSendResult>;
  sendTemplate(to: string, templateName: string, params: string[]): Promise<WhatsAppSendResult>;
}
