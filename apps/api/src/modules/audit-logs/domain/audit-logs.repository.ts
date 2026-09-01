import type { AuditAction, AuditLogDto } from '@altiora/shared-types';

export const AUDIT_LOGS_REPOSITORY = Symbol('AUDIT_LOGS_REPOSITORY');

export interface RecordAuditLogInput {
  userId: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  diff?: Record<string, unknown>;
}

export interface AuditLogsRepository {
  record(input: RecordAuditLogInput): Promise<void>;
  findByEntity(entity: string, entityId: string): Promise<AuditLogDto[]>;
  findRecent(limit: number): Promise<AuditLogDto[]>;
}
