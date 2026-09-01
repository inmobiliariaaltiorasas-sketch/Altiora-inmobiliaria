import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  DEFAULT_LOCALE,
  LEAD_FUNNEL_STAGES,
  type AdminAnalyticsSummaryDto,
  type AnalyticsCampaignsSummaryDto,
  type CampaignAttributionRowDto,
  type ClientAnalyticsEventType,
  type FunnelStageCountDto,
  type ServerAnalyticsEventType,
  type TopPropertyStatDto,
} from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  trackClientEvent(input: {
    type: ClientAnalyticsEventType;
    sessionId: string;
    propertyId?: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    return this.persist(input.type, input.sessionId, {
      propertyId: input.propertyId,
      payload: input.payload,
    });
  }

  /** Eventos de negocio críticos — el backend los emite al persistir, nunca el navegador (v1 sección 15). */
  recordServerEvent(
    type: ServerAnalyticsEventType,
    sessionId: string,
    options: { propertyId?: string; leadId?: string; payload?: Record<string, unknown> } = {},
  ): Promise<void> {
    return this.persist(type, sessionId, options);
  }

  /** Fase 3 — v1 sección 12 de correcciones: qué campaña originó/convirtió cada lead, con datos reales. */
  async getCampaignsSummary(): Promise<AnalyticsCampaignsSummaryDto> {
    const leads = await this.prisma.lead.findMany({
      include: {
        lastTouch: { select: { utmCampaign: true } },
        contact: {
          include: {
            inquiries: {
              include: {
                property: { select: { translations: { select: { locale: true, title: true } } } },
              },
            },
          },
        },
      },
    });

    const buckets = new Map<string, CampaignAttributionRowDto>();
    for (const lead of leads) {
      const key = `${lead.source}::${lead.lastTouch?.utmCampaign ?? ''}`;
      const bucket = buckets.get(key) ?? {
        source: lead.source,
        utmCampaign: lead.lastTouch?.utmCampaign ?? null,
        leadsCount: 0,
        wonCount: 0,
        convertedPropertyTitles: [],
      };
      bucket.leadsCount += 1;
      if (lead.funnelStage === 'WON') {
        bucket.wonCount += 1;
        for (const inquiry of lead.contact.inquiries) {
          const title =
            inquiry.property.translations.find((t) => t.locale === DEFAULT_LOCALE)?.title ??
            inquiry.property.translations[0]?.title;
          if (title && !bucket.convertedPropertyTitles.includes(title)) {
            bucket.convertedPropertyTitles.push(title);
          }
        }
      }
      buckets.set(key, bucket);
    }

    const rows = [...buckets.values()].sort((a, b) => b.leadsCount - a.leadsCount);
    return {
      rows,
      totalLeads: leads.length,
      totalWon: leads.filter((l) => l.funnelStage === 'WON').length,
    };
  }

  /** Fase 3 — funnel real por etapa (zero-filled) + propiedades más consultadas. */
  async getAdminSummary(): Promise<AdminAnalyticsSummaryDto> {
    const [grouped, inquiryGroups, viewGroups] = await Promise.all([
      this.prisma.lead.groupBy({ by: ['funnelStage'], _count: { _all: true } }),
      this.prisma.propertyInquiry.groupBy({ by: ['propertyId'], _count: { _all: true } }),
      this.prisma.analyticsEvent.groupBy({
        by: ['propertyId'],
        where: { type: 'property_view', propertyId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const countByStage = new Map(grouped.map((g) => [g.funnelStage, g._count._all]));
    const funnel: FunnelStageCountDto[] = LEAD_FUNNEL_STAGES.map((stage) => ({
      stage,
      count: countByStage.get(stage) ?? 0,
    }));

    const propertyIds = new Set<string>([
      ...inquiryGroups.map((g) => g.propertyId),
      ...viewGroups.map((g) => g.propertyId).filter((id): id is string => Boolean(id)),
    ]);
    const properties = await this.prisma.property.findMany({
      where: { id: { in: [...propertyIds] } },
      select: { id: true, slug: true, translations: { select: { locale: true, title: true } } },
    });

    const inquiryByProperty = new Map(inquiryGroups.map((g) => [g.propertyId, g._count._all]));
    const viewByProperty = new Map(viewGroups.map((g) => [g.propertyId, g._count._all]));

    const topProperties: TopPropertyStatDto[] = properties
      .map((property) => ({
        propertyId: property.id,
        slug: property.slug,
        title:
          property.translations.find((t) => t.locale === DEFAULT_LOCALE)?.title ??
          property.translations[0]?.title ??
          property.slug,
        viewCount: viewByProperty.get(property.id) ?? 0,
        inquiryCount: inquiryByProperty.get(property.id) ?? 0,
      }))
      .sort((a, b) => b.inquiryCount + b.viewCount - (a.inquiryCount + a.viewCount));

    return { funnel, topProperties };
  }

  private async persist(
    type: string,
    sessionId: string,
    options: { propertyId?: string; leadId?: string; payload?: Record<string, unknown> },
  ): Promise<void> {
    await this.prisma.analyticsEvent.create({
      data: {
        type,
        sessionId,
        propertyId: options.propertyId,
        leadId: options.leadId,
        payload: options.payload as Prisma.InputJsonValue | undefined,
      },
    });
  }
}
