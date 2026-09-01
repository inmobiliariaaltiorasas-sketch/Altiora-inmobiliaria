import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import type { AdminAnalyticsSummaryDto, AnalyticsCampaignsSummaryDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { AnalyticsService } from '../application/analytics.service';
import { TrackEventDto } from '../application/dto/track-event.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** Público — eventos de comportamiento sin PII (v1 sección 15). */
  @Post('events')
  @HttpCode(HttpStatus.ACCEPTED)
  track(@Body() dto: TrackEventDto): Promise<void> {
    return this.analyticsService.trackClientEvent(dto);
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('metrics', 'view')
  campaigns(): Promise<AnalyticsCampaignsSummaryDto> {
    return this.analyticsService.getCampaignsSummary();
  }

  @Get('admin-summary')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('metrics', 'view')
  adminSummary(): Promise<AdminAnalyticsSummaryDto> {
    return this.analyticsService.getAdminSummary();
  }
}
