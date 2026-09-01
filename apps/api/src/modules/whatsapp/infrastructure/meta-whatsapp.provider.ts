import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WhatsAppProvider, WhatsAppSendResult } from '../domain/whatsapp-provider';

/**
 * Cliente real contra la Graph API de Meta (WhatsApp Cloud API). Correcto según la spec de
 * Meta, pero no se puede validar contra la API real sin credenciales — quedan pendientes de
 * las que el usuario pase después (v1 sección 14).
 */
@Injectable()
export class MetaWhatsAppProvider implements WhatsAppProvider {
  private readonly logger = new Logger(MetaWhatsAppProvider.name);

  constructor(private readonly configService: ConfigService) {}

  async sendMessage(to: string, text: string): Promise<WhatsAppSendResult> {
    return this.post({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } });
  }

  async sendTemplate(
    to: string,
    templateName: string,
    params: string[],
  ): Promise<WhatsAppSendResult> {
    return this.post({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'es_CO' },
        components: [
          {
            type: 'body',
            parameters: params.map((text) => ({ type: 'text', text })),
          },
        ],
      },
    });
  }

  private async post(body: Record<string, unknown>): Promise<WhatsAppSendResult> {
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN');
    const apiVersion = this.configService.get<string>('WHATSAPP_API_VERSION', 'v20.0');

    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      this.logger.error(`Meta Cloud API respondió ${response.status}: ${errorBody}`);
      throw new Error(`No se pudo enviar el mensaje de WhatsApp (${response.status})`);
    }

    const data = (await response.json()) as { messages?: Array<{ id: string }> };
    return { providerMessageId: data.messages?.[0]?.id ?? 'unknown' };
  }
}
