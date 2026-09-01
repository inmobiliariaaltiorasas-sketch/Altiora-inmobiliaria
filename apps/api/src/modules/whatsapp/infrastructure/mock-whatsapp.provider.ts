import { Injectable, Logger } from '@nestjs/common';
import type { WhatsAppProvider, WhatsAppSendResult } from '../domain/whatsapp-provider';

/**
 * Default cuando no hay `WHATSAPP_ACCESS_TOKEN` en el entorno (selección automática, ver
 * whatsapp.module.ts). Simula la entrega — no llama a ningún servicio real.
 */
@Injectable()
export class MockWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async sendMessage(to: string, text: string): Promise<WhatsAppSendResult> {
    this.logger.log(`[MOCK] → ${to}: ${text}`);
    return { providerMessageId: `mock-${Date.now()}` };
  }

  async sendTemplate(
    to: string,
    templateName: string,
    params: string[],
  ): Promise<WhatsAppSendResult> {
    this.logger.log(`[MOCK] → ${to} (plantilla "${templateName}", ${params.join(', ')})`);
    return { providerMessageId: `mock-template-${Date.now()}` };
  }
}
