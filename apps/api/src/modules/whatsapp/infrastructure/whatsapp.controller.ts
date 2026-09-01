import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  NotFoundException,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import type { ConversationTurnDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { WhatsappService } from '../application/whatsapp.service';
import { SimulateInboundDto } from '../application/dto/simulate-inbound.dto';

interface MetaWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{ from: string; text?: { body: string } }>;
      };
    }>;
  }>;
}

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly configService: ConfigService,
  ) {}

  /** Meta llama a esto una vez, al configurar el webhook en Business Manager. */
  @Get('webhook')
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    const expected = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN', 'dev-verify-token');
    if (mode === 'subscribe' && token === expected) {
      res.status(200).send(challenge);
      return;
    }
    res.status(403).send('Verificación fallida');
  }

  /** Webhook real de mensajes entrantes de Meta Cloud API. */
  @Post('webhook')
  async receive(
    @Body() payload: MetaWebhookPayload,
    @Headers('x-hub-signature-256') signature: string | undefined,
  ): Promise<{ status: string }> {
    this.verifySignature(payload, signature);

    const message = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message?.text?.body) return { status: 'ignored' };

    await this.whatsappService.handleInbound(message.from, message.text.body);
    return { status: 'ok' };
  }

  /**
   * Sin credenciales reales de Meta no se puede probar el webhook real de punta a punta —
   * este endpoint ejercita exactamente el mismo flujo (`WhatsappService.handleInbound`) para
   * poder validar la conversación completa en desarrollo.
   */
  @Post('dev/simulate-inbound')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  simulateInbound(@Body() dto: SimulateInboundDto): Promise<ConversationTurnDto> {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      // No debe existir en producción, ni para un admin con el permiso: 404, no 403.
      throw new NotFoundException();
    }
    return this.whatsappService.handleInbound(dto.phoneNumber, dto.text);
  }

  private verifySignature(payload: unknown, signature: string | undefined): void {
    const appSecret = this.configService.get<string>('WHATSAPP_APP_SECRET');
    if (!appSecret) {
      // Fallar cerrado: sin secret configurado no hay forma de autenticar al remitente.
      this.logger.error('WHATSAPP_APP_SECRET no configurado — rechazando webhook entrante');
      throw new UnauthorizedException('Webhook no configurado');
    }
    if (!signature) throw new BadRequestException('Falta la firma del webhook');

    const expected =
      'sha256=' + createHmac('sha256', appSecret).update(JSON.stringify(payload)).digest('hex');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new BadRequestException('Firma de webhook inválida');
    }
  }
}
