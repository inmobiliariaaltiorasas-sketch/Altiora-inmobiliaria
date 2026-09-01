import { Module } from '@nestjs/common';
import { AppointmentsService } from './application/appointments.service';
import { AppointmentsController } from './infrastructure/appointments.controller';
import { LeadActivitiesModule } from '../lead-activities/lead-activities.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [LeadActivitiesModule, AnalyticsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
