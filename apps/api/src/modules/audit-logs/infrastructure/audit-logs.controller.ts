import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuditLogDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { AuditLogsService } from '../application/audit-logs.service';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('audit-logs', 'view')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findRecent(
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
  ): Promise<AuditLogDto[]> {
    if (entity && entityId) {
      return this.auditLogsService.findByEntity(entity, entityId);
    }
    return this.auditLogsService.findRecent();
  }
}
