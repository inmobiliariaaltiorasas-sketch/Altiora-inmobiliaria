import { Inject, Injectable } from '@nestjs/common';
import type { AuditLogDto } from '@altiora/shared-types';
import {
  AUDIT_LOGS_REPOSITORY,
  type AuditLogsRepository,
  type RecordAuditLogInput,
} from '../domain/audit-logs.repository';

@Injectable()
export class AuditLogsService {
  constructor(
    @Inject(AUDIT_LOGS_REPOSITORY) private readonly auditLogsRepository: AuditLogsRepository,
  ) {}

  record(input: RecordAuditLogInput): Promise<void> {
    return this.auditLogsRepository.record(input);
  }

  findByEntity(entity: string, entityId: string): Promise<AuditLogDto[]> {
    return this.auditLogsRepository.findByEntity(entity, entityId);
  }

  findRecent(limit = 50): Promise<AuditLogDto[]> {
    return this.auditLogsRepository.findRecent(limit);
  }
}
