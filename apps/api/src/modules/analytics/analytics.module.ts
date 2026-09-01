import { Module } from '@nestjs/common';
import { AnalyticsService } from './application/analytics.service';
import { AnalyticsController } from './infrastructure/analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
