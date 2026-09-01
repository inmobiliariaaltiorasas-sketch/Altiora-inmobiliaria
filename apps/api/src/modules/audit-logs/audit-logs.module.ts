import { Module } from '@nestjs/common';
import { AuditLogsService } from './application/audit-logs.service';
import { AuditLogsController } from './infrastructure/audit-logs.controller';
import { PrismaAuditLogsRepository } from './infrastructure/prisma-audit-logs.repository';
import { AUDIT_LOGS_REPOSITORY } from './domain/audit-logs.repository';

@Module({
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    { provide: AUDIT_LOGS_REPOSITORY, useClass: PrismaAuditLogsRepository },
  ],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
