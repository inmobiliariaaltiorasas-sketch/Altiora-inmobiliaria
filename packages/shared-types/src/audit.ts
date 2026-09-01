export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'PUBLISH',
  'PAUSE',
  'MARK_SOLD',
  'ARCHIVE',
  'DELETE',
  'FEATURE',
  'UNFEATURE',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLogDto {
  id: string;
  userId: string;
  userName: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  diff: Record<string, unknown> | null;
  createdAt: string;
}
