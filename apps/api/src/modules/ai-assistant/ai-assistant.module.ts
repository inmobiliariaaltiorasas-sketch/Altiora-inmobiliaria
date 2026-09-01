import { Module } from '@nestjs/common';
import { AiAssistantService } from './application/ai-assistant.service';
import { NestAiToolsService } from './infrastructure/nest-ai-tools.service';
import { MockLlmProvider } from './infrastructure/mock-llm-provider';
import { AI_TOOLS } from './domain/ai-tools';
import { LLM_PROVIDER } from './domain/llm-provider';
import { PropertiesModule } from '../properties/properties.module';
import { LeadsModule } from '../leads/leads.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { LeadActivitiesModule } from '../lead-activities/lead-activities.module';
import { LeadScoringModule } from '../lead-scoring/lead-scoring.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    PropertiesModule,
    LeadsModule,
    AppointmentsModule,
    LeadActivitiesModule,
    LeadScoringModule,
    AnalyticsModule,
  ],
  providers: [
    AiAssistantService,
    NestAiToolsService,
    MockLlmProvider,
    { provide: AI_TOOLS, useExisting: NestAiToolsService },
    // Sin proveedor de LLM real elegido todavía (v1 sección 13): único binding hoy. Cuando se
    // elija uno, se agrega su clase y este binding pasa a un factory por variable de entorno,
    // igual que WHATSAPP_PROVIDER en whatsapp.module.ts.
    { provide: LLM_PROVIDER, useExisting: MockLlmProvider },
  ],
  exports: [AiAssistantService],
})
export class AiAssistantModule {}
