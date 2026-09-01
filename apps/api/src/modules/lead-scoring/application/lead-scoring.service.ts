import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { LeadScoreDto, ScoreBreakdownItemDto } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

const scoringInclude = {
  contact: { include: { inquiries: true } },
  activities: { orderBy: { occurredAt: 'desc' as const }, take: 1 },
  conversations: true,
} satisfies Prisma.LeadInclude;

type ScoringLead = Prisma.LeadGetPayload<{ include: typeof scoringInclude }>;

/**
 * Scoring basado en reglas explicables, no ML — a este volumen un modelo entrenado no se
 * justifica, y el asesor necesita poder ver *por qué* un lead vale lo que vale, no un número
 * mágico (v1 sección 4 de correcciones). Cada señal queda registrada en `scoreBreakdown`.
 */
@Injectable()
export class LeadScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async rescoreLead(leadId: string): Promise<LeadScoreDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: scoringInclude,
    });
    if (!lead) throw new NotFoundException(`Lead no encontrado: ${leadId}`);

    const breakdown = this.computeBreakdown(lead);
    const score = Math.max(
      0,
      Math.min(
        100,
        breakdown.reduce((sum, item) => sum + item.points, 0),
      ),
    );

    await this.prisma.lead.update({
      where: { id: leadId },
      data: { score, scoreBreakdown: breakdown as unknown as Prisma.InputJsonValue },
    });

    return { score, breakdown };
  }

  private computeBreakdown(lead: ScoringLead): ScoreBreakdownItemDto[] {
    const breakdown: ScoreBreakdownItemDto[] = [];

    if (lead.budget) {
      breakdown.push({ signal: 'budget_declared', points: 10, detail: 'Declaró presupuesto' });
    }

    if (lead.propertyTypeInterestId) {
      breakdown.push({
        signal: 'property_type_clear',
        points: 5,
        detail: 'Tipo de propiedad de interés identificado',
      });
    }

    const highInterestCount = lead.contact.inquiries.filter(
      (i) => i.interestLevel === 'HIGH',
    ).length;
    if (highInterestCount > 0) {
      const points = Math.min(highInterestCount * 15, 30);
      breakdown.push({
        signal: 'high_interest_inquiries',
        points,
        detail: `${highInterestCount} propiedad(es) con interés alto`,
      });
    }

    const lastActivityAt = lead.activities[0]?.occurredAt ?? lead.updatedAt;
    const hoursSinceActivity = (Date.now() - lastActivityAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceActivity <= 24) {
      breakdown.push({
        signal: 'recent_activity',
        points: 15,
        detail: 'Actividad en las últimas 24h',
      });
    } else if (hoursSinceActivity <= 24 * 7) {
      breakdown.push({
        signal: 'recent_activity',
        points: 5,
        detail: 'Actividad en la última semana',
      });
    }

    const conversationCompleted = lead.conversations.some(
      (c) => c.qualification === 'HIGH' || c.contactOfferMade,
    );
    if (lead.source === 'WHATSAPP' || lead.source === 'AI_AGENT') {
      breakdown.push({
        signal: 'channel_quality',
        points: conversationCompleted ? 20 : 10,
        detail: conversationCompleted
          ? 'Vino de una conversación de WhatsApp/IA completa'
          : 'Vino de WhatsApp/IA',
      });
    } else {
      breakdown.push({ signal: 'channel_quality', points: 5, detail: 'Formulario web frío' });
    }

    const explicitConsent = lead.conversations.some((c) => c.consentToContact);
    if (explicitConsent) {
      breakdown.push({
        signal: 'explicit_consent',
        points: 25,
        detail: 'Aceptó explícitamente ser contactado',
      });
    }

    return breakdown;
  }
}
