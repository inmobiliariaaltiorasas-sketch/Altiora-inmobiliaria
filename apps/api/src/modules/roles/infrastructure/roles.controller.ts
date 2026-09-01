import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { RolesService } from '../application/roles.service';
import type { RoleRecord } from '../domain/role-record';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermission('users', 'manage')
  findAll(): Promise<RoleRecord[]> {
    return this.rolesService.findAll();
  }
}
