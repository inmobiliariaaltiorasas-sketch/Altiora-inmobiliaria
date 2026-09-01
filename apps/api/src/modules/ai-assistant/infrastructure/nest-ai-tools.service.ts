import { Injectable } from '@nestjs/common';
import type { PropertyDetailDto, PropertySummaryDto } from '@altiora/shared-types';
import { DEFAULT_LOCALE } from '@altiora/shared-types';
import { PropertiesService } from '../../properties/application/properties.service';
import { PropertyFiltersQueryDto } from '../../properties/application/dto/property-filters-query.dto';
import { LeadsService } from '../../leads/application/leads.service';
import { CreateInquiryDto } from '../../leads/application/dto/create-inquiry.dto';
import { AppointmentsService } from '../../appointments/application/appointments.service';
import type { AiTools, CreateOrUpdateLeadArgs, SearchPropertiesArgs } from '../domain/ai-tools';

/** Implementación real de las tools — la misma sin importar si el LlmProvider activo es el mock o uno real. */
@Injectable()
export class NestAiToolsService implements AiTools {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly leadsService: LeadsService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async searchProperties(args: SearchPropertiesArgs): Promise<PropertySummaryDto[]> {
    const query: PropertyFiltersQueryDto = {
      city: args.citySlug,
      type: args.propertyTypeSlug,
      operation: args.operationType,
      minBedrooms: args.minBedrooms,
      maxPrice: args.maxPrice,
      locale: DEFAULT_LOCALE,
      pageSize: 5,
    } as PropertyFiltersQueryDto;

    const result = await this.propertiesService.search(query, false);
    return result.items;
  }

  async getPropertyDetail(slug: string): Promise<PropertyDetailDto | null> {
    try {
      return await this.propertiesService.findPublicBySlugOrThrow(slug, DEFAULT_LOCALE);
    } catch {
      return null;
    }
  }

  async createOrUpdateLead(args: CreateOrUpdateLeadArgs): Promise<{ leadId: string }> {
    const dto = new CreateInquiryDto();
    dto.name = args.name;
    dto.preferredChannel = args.contactChannel;
    dto.inquiryType = 'ADVISOR_REQUEST';
    dto.propertyId = args.propertyId;
    dto.sessionId = args.sessionKey;
    dto.note = 'Generado por el agente IA';
    if (args.contactChannel === 'WHATSAPP') dto.whatsapp = args.contactValue;
    if (args.contactChannel === 'PHONE') dto.phone = args.contactValue;
    if (args.contactChannel === 'EMAIL') dto.email = args.contactValue;

    const sourceOverride = args.channel === 'WHATSAPP' ? 'WHATSAPP' : 'AI_AGENT';
    return this.leadsService.createInquiry(dto, sourceOverride);
  }

  async proposeAppointmentSlot(input: {
    leadId: string;
    propertyId: string;
    proposedAt: Date;
  }): Promise<{ appointmentId: string }> {
    const appointment = await this.appointmentsService.propose({
      leadId: input.leadId,
      propertyId: input.propertyId,
      proposedAt: input.proposedAt,
      type: 'VISIT',
      proposedBySystem: true,
    });
    return { appointmentId: appointment.id };
  }
}
