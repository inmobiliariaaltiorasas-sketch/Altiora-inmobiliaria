import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from './application/whatsapp.service';
import { WhatsappController } from './infrastructure/whatsapp.controller';
import { MockWhatsAppProvider } from './infrastructure/mock-whatsapp.provider';
import { MetaWhatsAppProvider } from './infrastructure/meta-whatsapp.provider';
import { WHATSAPP_PROVIDER } from './domain/whatsapp-provider';
import { AiAssistantModule } from '../ai-assistant/ai-assistant.module';

@Module({
  imports: [AiAssistantModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    MockWhatsAppProvider,
    MetaWhatsAppProvider,
    {
      provide: WHATSAPP_PROVIDER,
      /**
       * Sin `WHATSAPP_ACCESS_TOKEN` en el entorno, el mock es el default — automático, sin un
       * flag manual que alguien pueda olvidar prender en producción.
       */
      useFactory: (
        config: ConfigService,
        mock: MockWhatsAppProvider,
        meta: MetaWhatsAppProvider,
      ) => (config.get<string>('WHATSAPP_ACCESS_TOKEN') ? meta : mock),
      inject: [ConfigService, MockWhatsAppProvider, MetaWhatsAppProvider],
    },
  ],
})
export class WhatsappModule {}
