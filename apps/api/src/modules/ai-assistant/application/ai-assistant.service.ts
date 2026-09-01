import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, LeadActivityType } from '@prisma/client';
import type { ConversationChannel, ConversationTurnDto } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { LeadActivitiesService } from '../../lead-activities/application/lead-activities.service';
import { LeadScoringService } from '../../lead-scoring/application/lead-scoring.service';
import { AnalyticsService } from '../../analytics/application/analytics.service';
import { AI_TOOLS, type AiTools } from '../domain/ai-tools';
import { LLM_PROVIDER, type LlmProvider, type LlmConversationState } from '../domain/llm-provider';

const MILESTONE_DESCRIPTIONS = {
  CONVERSATION_STARTED: 'Inició la conversación con el agente IA',
  PROPERTY_VIEWED: 'Consultó el detalle de una propiedad',
  CONTACT_OFFERED: 'El agente ofreció contacto con un asesor',
  CONTACT_ACCEPTED: 'Aceptó ser contactado por un asesor',
  CONTACT_DECLINED: 'Rechazó ser contactado',
  HANDOFF_TO_HUMAN: 'La conversación se escaló a un asesor humano',
};

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LLM_PROVIDER) private readonly llmProvider: LlmProvider,
    @Inject(AI_TOOLS) private readonly tools: AiTools,
    private readonly leadActivitiesService: LeadActivitiesService,
    private readonly leadScoringService: LeadScoringService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async handleTurn(
    conversationId: string,
    channel: ConversationChannel,
    incomingText: string,
  ): Promise<ConversationTurnDto> {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!conversation) throw new NotFoundException(`Conversación no encontrada: ${conversationId}`);

    const isFirstMessage = conversation.messages.length === 0;
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        direction: 'IN',
        content: incomingText,
        milestone: isFirstMessage ? 'CONVERSATION_STARTED' : null,
      },
    });

    if (isFirstMessage) {
      await this.analyticsService.recordServerEvent(
        'ai_conversation_started',
        conversation.sessionKey,
      );
    }

    const decision = await this.llmProvider.converse({
      history: conversation.messages.map((m) => ({ direction: m.direction, content: m.content })),
      state: stateFromConversation(conversation),
      incomingText,
    });

    const justDeclined =
      !conversation.contactOfferDeclined && decision.updatedState.contactOfferDeclined;
    const outMilestone = resolveOutMilestone(decision, justDeclined);
    await this.prisma.aiMessage.create({
      data: {
        conversationId,
        direction: 'OUT',
        content: decision.replyText,
        milestone: outMilestone,
      },
    });

    let leadId = conversation.leadId;
    let leadCreated = false;

    if (decision.contactAccepted) {
      // Si el canal de transporte es WhatsApp, `sessionKey` ya es el número real. Si eligió
      // "teléfono" o "correo" sin habernos dado ese dato todavía, usamos el mismo número como
      // mejor dato disponible — pedir el dato específico es una mejora de Fase 3 (widget web).
      const created = await this.tools.createOrUpdateLead({
        sessionKey: conversation.sessionKey,
        channel,
        name: 'Prospecto vía agente IA',
        contactChannel: decision.contactAccepted.choice,
        contactValue: conversation.sessionKey,
        propertyId: await this.resolvePropertyId(decision.contactAccepted.propertySlug),
      });
      leadId = created.leadId;
      leadCreated = true;
    }

    if (decision.appointmentRequested && leadId) {
      const propertyId = await this.resolvePropertyId(decision.appointmentRequested.propertySlug);
      if (propertyId) {
        const proposedAt = new Date();
        proposedAt.setDate(proposedAt.getDate() + 1);
        proposedAt.setHours(10, 0, 0, 0);
        await this.tools.proposeAppointmentSlot({ leadId, propertyId, proposedAt });
      }
    }

    const updateData: Prisma.AiConversationUncheckedUpdateInput = {
      ...stateToUpdateData(decision.updatedState),
      status: decision.escalateToHuman ? 'HUMAN' : conversation.status,
      consentToContact: decision.contactAccepted ? true : conversation.consentToContact,
    };
    if (leadId) updateData.leadId = leadId;

    await this.prisma.aiConversation.update({ where: { id: conversationId }, data: updateData });

    const justQualifiedHigh =
      conversation.qualification !== 'HIGH' && decision.updatedState.qualification === 'HIGH';
    if (justQualifiedHigh) {
      await this.analyticsService.recordServerEvent('ai_lead_qualified', conversation.sessionKey, {
        leadId: leadId ?? undefined,
      });
    }

    if (leadCreated && leadId) {
      await this.backfillLeadActivities(conversationId, leadId);
      await this.leadScoringService.rescoreLead(leadId);
    }

    return {
      replyText: decision.replyText,
      offerOptionsShown: decision.offerOptionsShown,
      escalatedToHuman: decision.escalateToHuman,
      leadCreated,
      leadId: leadId ?? null,
      conversationId,
    };
  }

  private async resolvePropertyId(slug: string | null): Promise<string | undefined> {
    if (!slug) return undefined;
    const property = await this.prisma.property.findUnique({
      where: { slug },
      select: { id: true },
    });
    return property?.id;
  }

  /** Backfillea los hitos marcados en la conversación como LeadActivity — no cada mensaje individual. */
  private async backfillLeadActivities(conversationId: string, leadId: string): Promise<void> {
    const milestoneMessages = await this.prisma.aiMessage.findMany({
      where: { conversationId, milestone: { not: null } },
      orderBy: { createdAt: 'asc' },
    });

    for (const message of milestoneMessages) {
      const [rawType] = (message.milestone ?? '').split(':');
      if (!rawType || !(rawType in MILESTONE_DESCRIPTIONS)) continue;
      const type = rawType as keyof typeof MILESTONE_DESCRIPTIONS;

      await this.leadActivitiesService.record({
        leadId,
        type: type as LeadActivityType,
        description: MILESTONE_DESCRIPTIONS[type],
        occurredAt: message.createdAt,
      });
    }
  }
}

function stateFromConversation(conversation: {
  qualification: string | null;
  lastSearchResults: Prisma.JsonValue;
  propertyInterestCounts: Prisma.JsonValue;
  lastDiscussedPropertySlug: string | null;
  contactOfferMade: boolean;
  contactOfferDeclined: boolean;
  awaitingContactChoice: boolean;
  lowConfidenceStreak: number;
}): LlmConversationState {
  return {
    qualification: (conversation.qualification as LlmConversationState['qualification']) ?? null,
    lastSearchResults: Array.isArray(conversation.lastSearchResults)
      ? (conversation.lastSearchResults as unknown as LlmConversationState['lastSearchResults'])
      : [],
    propertyInterestCounts:
      (conversation.propertyInterestCounts as unknown as Record<string, number>) ?? {},
    lastDiscussedPropertySlug: conversation.lastDiscussedPropertySlug,
    contactOfferMade: conversation.contactOfferMade,
    contactOfferDeclined: conversation.contactOfferDeclined,
    awaitingContactChoice: conversation.awaitingContactChoice,
    lowConfidenceStreak: conversation.lowConfidenceStreak,
  };
}

function stateToUpdateData(state: LlmConversationState): Prisma.AiConversationUncheckedUpdateInput {
  return {
    qualification: state.qualification ?? undefined,
    lastSearchResults: state.lastSearchResults as unknown as Prisma.InputJsonValue,
    suggestedPropertyIds: state.lastSearchResults.map((r) => r.slug),
    propertyInterestCounts: state.propertyInterestCounts as unknown as Prisma.InputJsonValue,
    lastDiscussedPropertySlug: state.lastDiscussedPropertySlug,
    contactOfferMade: state.contactOfferMade,
    contactOfferDeclined: state.contactOfferDeclined,
    awaitingContactChoice: state.awaitingContactChoice,
    lowConfidenceStreak: state.lowConfidenceStreak,
  };
}

function resolveOutMilestone(
  decision: {
    offerOptionsShown: boolean;
    contactAccepted: { choice: string } | null;
    escalateToHuman: boolean;
    propertyViewedSlug: string | null;
  },
  justDeclined: boolean,
): string | null {
  if (decision.escalateToHuman) return 'HANDOFF_TO_HUMAN';
  if (decision.contactAccepted) return 'CONTACT_ACCEPTED';
  if (justDeclined) return 'CONTACT_DECLINED';
  if (decision.offerOptionsShown) return 'CONTACT_OFFERED';
  if (decision.propertyViewedSlug) return `PROPERTY_VIEWED:${decision.propertyViewedSlug}`;
  return null;
}
