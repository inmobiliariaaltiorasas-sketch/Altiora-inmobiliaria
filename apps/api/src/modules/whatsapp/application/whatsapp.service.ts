import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConversationTurnDto } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { AiAssistantService } from '../../ai-assistant/application/ai-assistant.service';
import { WHATSAPP_PROVIDER, type WhatsAppProvider } from '../domain/whatsapp-provider';
import { isWithinFreeformWindow } from '../domain/freeform-window';

const GENERIC_FOLLOW_UP_TEMPLATE = 'altiora_follow_up';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiAssistantService: AiAssistantService,
    @Inject(WHATSAPP_PROVIDER) private readonly provider: WhatsAppProvider,
  ) {}

  /** Punto de entrada único: webhook real de Meta y el endpoint de desarrollo lo comparten. */
  async handleInbound(phoneNumber: string, text: string): Promise<ConversationTurnDto> {
    const { aiConversationId, whatsappConversationId } =
      await this.findOrCreateConversation(phoneNumber);

    const now = new Date();
    await this.prisma.whatsAppConversation.updateMany({
      where: { id: whatsappConversationId, optInAt: null },
      data: { optInAt: now },
    });
    await this.prisma.whatsAppConversation.update({
      where: { id: whatsappConversationId },
      data: { lastInboundAt: now },
    });

    const turn = await this.aiAssistantService.handleTurn(aiConversationId, 'WHATSAPP', text);

    await this.sendOutboundReply(phoneNumber, turn.replyText, now);

    return turn;
  }

  /**
   * Fuera de la ventana de 24h desde el último mensaje entrante, Meta exige una plantilla
   * aprobada — un texto libre sería rechazado. Un reply inmediato dentro del mismo turno
   * siempre cae dentro de la ventana; esto importa para mensajes disparados más tarde
   * (ej. seguimiento manual desde el admin).
   */
  private async sendOutboundReply(
    phoneNumber: string,
    text: string,
    lastInboundAt: Date,
  ): Promise<void> {
    try {
      if (isWithinFreeformWindow(lastInboundAt)) {
        await this.provider.sendMessage(phoneNumber, text);
      } else {
        await this.provider.sendTemplate(phoneNumber, GENERIC_FOLLOW_UP_TEMPLATE, [text]);
      }
    } catch (error) {
      this.logger.warn(
        `No se pudo enviar el mensaje a ${phoneNumber}: ${(error as Error).message}`,
      );
    }
  }

  private async findOrCreateConversation(
    phoneNumber: string,
  ): Promise<{ aiConversationId: string; whatsappConversationId: string }> {
    const existing = await this.prisma.whatsAppConversation.findUnique({ where: { phoneNumber } });
    if (existing) {
      return { aiConversationId: existing.aiConversationId, whatsappConversationId: existing.id };
    }

    const aiConversation = await this.prisma.aiConversation.create({
      data: { channel: 'WHATSAPP', sessionKey: phoneNumber },
    });
    const whatsappConversation = await this.prisma.whatsAppConversation.create({
      data: { phoneNumber, aiConversationId: aiConversation.id },
    });

    return { aiConversationId: aiConversation.id, whatsappConversationId: whatsappConversation.id };
  }
}
