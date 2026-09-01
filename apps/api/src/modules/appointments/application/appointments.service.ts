import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, AppointmentType } from '@prisma/client';
import { DEFAULT_LOCALE, type AppointmentDto } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { LeadActivitiesService } from '../../lead-activities/application/lead-activities.service';
import { AnalyticsService } from '../../analytics/application/analytics.service';

const appointmentInclude = {
  property: { select: { translations: { select: { locale: true, title: true } } } },
  agent: { select: { name: true } },
} satisfies Prisma.AppointmentInclude;

type AppointmentRow = Prisma.AppointmentGetPayload<{ include: typeof appointmentInclude }>;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadActivitiesService: LeadActivitiesService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * El agente IA (o un admin) puede *proponer* un horario, pero siempre queda en `PROPOSED` —
   * la confirmación real la hace un humano desde el admin, nunca automática (v1 sección 5).
   */
  async propose(input: {
    leadId: string;
    propertyId: string;
    proposedAt: Date;
    type: AppointmentType;
    proposedBySystem?: boolean;
  }): Promise<AppointmentDto> {
    const appointment = await this.prisma.appointment.create({
      data: {
        leadId: input.leadId,
        propertyId: input.propertyId,
        proposedAt: input.proposedAt,
        type: input.type,
        proposedBySystem: input.proposedBySystem ?? true,
      },
      include: appointmentInclude,
    });

    await this.leadActivitiesService.record({
      leadId: input.leadId,
      type: 'APPOINTMENT_PROPOSED',
      description: `Se propuso ${input.type === 'VISIT' ? 'una visita' : 'una llamada'} para ${input.proposedAt.toLocaleString('es-CO')}`,
    });
    // Sin sesión de navegador real acá (puede venir del agente IA o del admin) — se usa el lead
    // como clave de sesión estable para el evento, igual de trazable hacia el negocio.
    await this.analyticsService.recordServerEvent('appointment_started', `lead:${input.leadId}`, {
      propertyId: input.propertyId,
      leadId: input.leadId,
    });

    return this.toDto(appointment);
  }

  async confirm(id: string, agentId: string, confirmedAt: Date): Promise<AppointmentDto> {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Cita no encontrada: ${id}`);

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED', agentId, confirmedAt },
      include: appointmentInclude,
    });

    await this.leadActivitiesService.record({
      leadId: existing.leadId,
      type: 'APPOINTMENT_CONFIRMED',
      description: `Un asesor confirmó la cita para ${confirmedAt.toLocaleString('es-CO')}`,
    });
    // Crítico de negocio — confirmado por el backend al persistir, nunca por el cliente (v1 sección 17).
    await this.analyticsService.recordServerEvent('appointment_booked', `lead:${existing.leadId}`, {
      propertyId: existing.propertyId,
      leadId: existing.leadId,
    });

    return this.toDto(appointment);
  }

  async cancel(id: string): Promise<AppointmentDto> {
    const existing = await this.prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Cita no encontrada: ${id}`);

    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: appointmentInclude,
    });
    return this.toDto(appointment);
  }

  async findByLead(leadId: string): Promise<AppointmentDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: { leadId },
      include: appointmentInclude,
      orderBy: { proposedAt: 'desc' },
    });
    return appointments.map((appointment) => this.toDto(appointment));
  }

  private toDto(appointment: AppointmentRow): AppointmentDto {
    return {
      id: appointment.id,
      propertyId: appointment.propertyId,
      propertyTitle:
        appointment.property.translations.find((t) => t.locale === DEFAULT_LOCALE)?.title ??
        appointment.property.translations[0]?.title ??
        '(sin título)',
      type: appointment.type,
      status: appointment.status,
      proposedAt: appointment.proposedAt.toISOString(),
      confirmedAt: appointment.confirmedAt ? appointment.confirmedAt.toISOString() : null,
      proposedBySystem: appointment.proposedBySystem,
      agentName: appointment.agent?.name ?? null,
    };
  }
}
