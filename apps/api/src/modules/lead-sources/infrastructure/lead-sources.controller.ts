import { Controller, Get, UseGuards } from '@nestjs/common';
import { LEAD_SOURCE_CHANNELS, type LeadSourceChannel } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';

/** Vocabulario fijo del v1 (enum de Prisma) — este endpoint solo alimenta filtros del CRM. */
@Controller('lead-sources')
export class LeadSourcesController {
  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('leads', 'manage')
  findAll(): LeadSourceChannel[] {
    return [...LEAD_SOURCE_CHANNELS];
  }
}
