import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  ConversationTranscriptDto,
  LeadDetailDto,
  LeadSourceChannel,
  LeadSummaryDto,
  MarketingTouchDto as MarketingTouchOutputDto,
} from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ContactsService } from '../../contacts/application/contacts.service';
import { AnalyticsService } from '../../analytics/application/analytics.service';
import { LeadActivitiesService } from '../../lead-activities/application/lead-activities.service';
import { LeadScoringService } from '../../lead-scoring/application/lead-scoring.service';
import { AppointmentsService } from '../../appointments/application/appointments.service';
import type { CreateInquiryDto } from './dto/create-inquiry.dto';
import type { MarketingTouchDto } from './dto/marketing-touch.dto';
import type { ProposeAppointmentDto } from './dto/propose-appointment.dto';
import type { UpdateLeadDto } from './dto/update-lead.dto';
import type { MarkLeadLostDto } from './dto/mark-lead-lost.dto';
import type { LeadFiltersQueryDto } from './dto/lead-filters-query.dto';

const summaryInclude = {
  contact: true,
  assignedAgent: true,
} satisfies Prisma.LeadInclude;

const detailInclude = {
  contact: {
    include: {
      inquiries: {
        include: {
          property: {
            select: { slug: true, translations: { select: { locale: true, title: true } } },
          },
        },
      },
    },
  },
  assignedAgent: true,
  firstTouch: true,
  lastTouch: true,
  conversations: { include: { messages: { orderBy: { createdAt: 'asc' as const } } } },
} satisfies Prisma.LeadInclude;

type LeadSummaryRow = Prisma.LeadGetPayload<{ include: typeof summaryInclude }>;
type LeadDetailRow = Prisma.LeadGetPayload<{ include: typeof detailInclude }>;
type TouchRow = NonNullable<LeadDetailRow['firstTouch']>;

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contactsService: ContactsService,
    private readonly analyticsService: AnalyticsService,
    private readonly leadActivitiesService: LeadActivitiesService,
    private readonly leadScoringService: LeadScoringService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async recordMarketingTouch(dto: MarketingTouchDto): Promise<void> {
    await this.prisma.marketingTouch.create({ data: dto });
  }

  /**
   * `sourceOverride` es un parámetro interno, nunca deserializado desde el body HTTP público —
   * solo lo pasan callers de confianza dentro del proceso (ej. el agente IA/WhatsApp), que ya
   * saben por qué canal real llegó la conversación. El endpoint público (`leads.controller.ts`)
   * nunca lo pasa.
   */
  async createInquiry(
    dto: CreateInquiryDto,
    sourceOverride?: LeadSourceChannel,
  ): Promise<{ leadId: string }> {
    if (!dto.whatsapp && !dto.phone && !dto.email) {
      throw new BadRequestException(
        'Se necesita al menos un canal de contacto (WhatsApp, teléfono o email)',
      );
    }

    const contact = await this.contactsService.create({
      name: dto.name,
      phone: dto.phone,
      whatsapp: dto.whatsapp,
      email: dto.email,
      preferredChannel: dto.preferredChannel,
      sessionId: dto.sessionId,
    });

    if (dto.propertyId) {
      await this.prisma.propertyInquiry.create({
        data: {
          contactId: contact.id,
          propertyId: dto.propertyId,
          inquiryType: dto.inquiryType,
          interestLevel: 'HIGH',
          note: dto.note,
        },
      });
    }

    const touches = await this.prisma.marketingTouch.findMany({
      where: { sessionId: dto.sessionId },
      orderBy: { createdAt: 'asc' },
    });
    const firstTouch = touches[0] ?? null;
    const lastTouch = touches.at(-1) ?? null;

    const lead = await this.prisma.lead.create({
      data: {
        contactId: contact.id,
        source: sourceOverride ?? this.inferSource(lastTouch ?? firstTouch),
        funnelStage: 'LEAD',
        firstTouchId: firstTouch?.id,
        lastTouchId: lastTouch?.id,
      },
    });

    await this.leadActivitiesService.record({
      leadId: lead.id,
      type: 'LEAD_CREATED',
      description: `Lead creado desde ${sourceOverride ?? 'formulario web'} (${dto.inquiryType})`,
    });
    await this.leadScoringService.rescoreLead(lead.id);

    await this.analyticsService.recordServerEvent('lead_started', dto.sessionId, {
      propertyId: dto.propertyId,
      leadId: lead.id,
    });
    await this.analyticsService.recordServerEvent('lead_submitted', dto.sessionId, {
      propertyId: dto.propertyId,
      leadId: lead.id,
    });
    if (dto.inquiryType === 'ADVISOR_REQUEST') {
      await this.analyticsService.recordServerEvent('advisor_contact_requested', dto.sessionId, {
        propertyId: dto.propertyId,
        leadId: lead.id,
      });
    }

    return { leadId: lead.id };
  }

  async findAdminList(filters: LeadFiltersQueryDto): Promise<LeadSummaryDto[]> {
    const leads = await this.prisma.lead.findMany({
      where: {
        funnelStage: filters.stage,
        source: filters.source,
        assignedAgentId: filters.agentId,
      },
      include: summaryInclude,
      orderBy: { createdAt: 'desc' },
    });
    return leads.map((lead) => this.toSummary(lead));
  }

  async findAdminDetailOrThrow(id: string): Promise<LeadDetailDto> {
    const lead = await this.prisma.lead.findUnique({ where: { id }, include: detailInclude });
    if (!lead) throw new NotFoundException(`Lead no encontrado: ${id}`);

    const [activities, appointments] = await Promise.all([
      this.leadActivitiesService.findByLead(id),
      this.appointmentsService.findByLead(id),
    ]);

    return this.toDetail(lead, activities, appointments);
  }

  /** Un asesor propone una cita manualmente desde el admin — cierra el gap de Fase 2/3, donde
   * la única vía era el agente IA (nunca se pudo probar `appointment_booked` de punta a punta). */
  async proposeAppointment(id: string, dto: ProposeAppointmentDto): Promise<LeadDetailDto> {
    await this.appointmentsService.propose({
      leadId: id,
      propertyId: dto.propertyId,
      proposedAt: new Date(dto.proposedAt),
      type: dto.type,
      proposedBySystem: false,
    });
    return this.findAdminDetailOrThrow(id);
  }

  /** Handoff manual — además del automático que dispara el agente IA por baja confianza. */
  async handoffConversationToHuman(id: string): Promise<LeadDetailDto> {
    await this.prisma.aiConversation.updateMany({
      where: { leadId: id },
      data: { status: 'HUMAN' },
    });
    await this.leadActivitiesService.record({
      leadId: id,
      type: 'HANDOFF_TO_HUMAN',
      description: 'Un asesor tomó la conversación manualmente',
    });
    return this.findAdminDetailOrThrow(id);
  }

  async update(id: string, dto: UpdateLeadDto): Promise<LeadDetailDto> {
    await this.prisma.lead.update({
      where: { id },
      data: {
        funnelStage: dto.funnelStage,
        assignedAgentId: dto.assignedAgentId,
        notes: dto.notes,
        budget: dto.budget,
      },
    });
    return this.findAdminDetailOrThrow(id);
  }

  async markLost(id: string, dto: MarkLeadLostDto): Promise<LeadDetailDto> {
    await this.prisma.lead.update({
      where: { id },
      data: { funnelStage: 'LOST', lostReason: dto.reason, lostAt: new Date() },
    });
    return this.findAdminDetailOrThrow(id);
  }

  /** Best-effort: mapea utm/gclid/fbclid/referrer al vocabulario fijo de LeadSourceChannel. */
  private inferSource(touch: TouchRow | null): LeadSourceChannel {
    if (!touch) return 'DIRECT';

    const source = touch.utmSource?.toLowerCase();
    const medium = touch.utmMedium?.toLowerCase();

    if (touch.gclid || (source === 'google' && medium?.includes('cpc'))) return 'GOOGLE_ADS';
    if (
      touch.fbclid ||
      (medium?.includes('paid') && (source === 'facebook' || source === 'instagram'))
    ) {
      return 'META_ADS';
    }
    if (source === 'google') return 'GOOGLE';
    if (source === 'facebook') return 'FACEBOOK';
    if (source === 'instagram') return 'INSTAGRAM';
    if (source === 'tiktok') return 'TIKTOK';
    if (source === 'whatsapp') return 'WHATSAPP';
    if (source === 'website') return 'WEBSITE';
    if (source === 'referral') return 'REFERRAL';
    if (touch.referrer) return 'ORGANIC';
    return 'DIRECT';
  }

  private toSummary(lead: LeadSummaryRow): LeadSummaryDto {
    return {
      id: lead.id,
      contactName: lead.contact.name,
      preferredChannel: lead.contact.preferredChannel,
      source: lead.source,
      funnelStage: lead.funnelStage,
      assignedAgentName: lead.assignedAgent?.name ?? null,
      createdAt: lead.createdAt.toISOString(),
    };
  }

  private mapTouch(touch: TouchRow | null): MarketingTouchOutputDto | null {
    if (!touch) return null;
    return {
      utmSource: touch.utmSource,
      utmMedium: touch.utmMedium,
      utmCampaign: touch.utmCampaign,
      gclid: touch.gclid,
      fbclid: touch.fbclid,
      referrer: touch.referrer,
      landingPage: touch.landingPage,
      createdAt: touch.createdAt.toISOString(),
    };
  }

  private toDetail(
    lead: LeadDetailRow,
    activities: LeadDetailDto['activities'],
    appointments: LeadDetailDto['appointments'],
  ): LeadDetailDto {
    return {
      ...this.toSummary(lead),
      contact: {
        id: lead.contact.id,
        name: lead.contact.name,
        phone: lead.contact.phone,
        whatsapp: lead.contact.whatsapp,
        email: lead.contact.email,
      },
      budget: lead.budget ? Number(lead.budget) : null,
      notes: lead.notes,
      lostReason: lead.lostReason,
      lostAt: lead.lostAt ? lead.lostAt.toISOString() : null,
      firstTouch: this.mapTouch(lead.firstTouch),
      lastTouch: this.mapTouch(lead.lastTouch),
      inquiries: lead.contact.inquiries.map((inquiry) => ({
        id: inquiry.id,
        propertyId: inquiry.propertyId,
        propertySlug: inquiry.property.slug,
        propertyTitle:
          inquiry.property.translations.find((t) => t.locale === 'es-CO')?.title ??
          inquiry.property.translations[0]?.title ??
          '(sin título)',
        inquiryType: inquiry.inquiryType,
        interestLevel: inquiry.interestLevel,
        note: inquiry.note,
        createdAt: inquiry.createdAt.toISOString(),
      })),
      score: lead.score,
      scoreBreakdown: (lead.scoreBreakdown as unknown as LeadDetailDto['scoreBreakdown']) ?? [],
      activities,
      appointments,
      conversation: this.mapConversation(lead.conversations[0]),
    };
  }

  private mapConversation(
    conversation: LeadDetailRow['conversations'][number] | undefined,
  ): ConversationTranscriptDto | null {
    if (!conversation) return null;
    return {
      id: conversation.id,
      channel: conversation.channel,
      status: conversation.status,
      qualification: conversation.qualification,
      summary: conversation.summary,
      messages: conversation.messages.map((message) => ({
        direction: message.direction,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
    };
  }
}
