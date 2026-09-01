import { Injectable } from '@nestjs/common';
import type { Prisma, LeadActivityType } from '@prisma/client';
import type { LeadActivityDto } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class LeadActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    leadId: string;
    type: LeadActivityType;
    description: string;
    metadata?: Record<string, unknown>;
    /** Para backfillear hitos de una conversación previa a la creación del Lead. */
    occurredAt?: Date;
  }): Promise<void> {
    await this.prisma.leadActivity.create({
      data: {
        leadId: input.leadId,
        type: input.type,
        description: input.description,
        metadata: input.metadata as Prisma.InputJsonValue | undefined,
        occurredAt: input.occurredAt ?? new Date(),
      },
    });
  }

  async findByLead(leadId: string): Promise<LeadActivityDto[]> {
    const activities = await this.prisma.leadActivity.findMany({
      where: { leadId },
      orderBy: { occurredAt: 'asc' },
    });
    return activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      occurredAt: activity.occurredAt.toISOString(),
    }));
  }
}
