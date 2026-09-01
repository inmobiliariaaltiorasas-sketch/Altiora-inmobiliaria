import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { PermissionsService } from '../application/permissions.service';
import type { PermissionRecord } from '../domain/permission-record';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermission('users', 'manage')
  findAll(): Promise<PermissionRecord[]> {
    return this.permissionsService.findAll();
  }
}
