import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuditLogDto } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { AuditLogsRepository, RecordAuditLogInput } from '../domain/audit-logs.repository';

@Injectable()
export class PrismaAuditLogsRepository implements AuditLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        entity: input.entity,
        entityId: input.entityId,
        action: input.action,
        diff: input.diff as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditLogDto[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { entity, entityId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map(this.toDto);
  }

  async findRecent(limit: number): Promise<AuditLogDto[]> {
    const logs = await this.prisma.auditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return logs.map(this.toDto);
  }

  private toDto(log: {
    id: string;
    userId: string;
    entity: string;
    entityId: string;
    action: string;
    diff: unknown;
    createdAt: Date;
    user: { name: string };
  }): AuditLogDto {
    return {
      id: log.id,
      userId: log.userId,
      userName: log.user.name,
      entity: log.entity,
      entityId: log.entityId,
      action: log.action as AuditLogDto['action'],
      diff: (log.diff as Record<string, unknown> | null) ?? null,
      createdAt: log.createdAt.toISOString(),
    };
  }
}
