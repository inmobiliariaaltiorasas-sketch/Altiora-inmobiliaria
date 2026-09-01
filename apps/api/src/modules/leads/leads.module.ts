import { Module } from '@nestjs/common';
import { LeadsService } from './application/leads.service';
import { LeadsController } from './infrastructure/leads.controller';
import { ContactsModule } from '../contacts/contacts.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LeadActivitiesModule } from '../lead-activities/lead-activities.module';
import { LeadScoringModule } from '../lead-scoring/lead-scoring.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [
    ContactsModule,
    AnalyticsModule,
    LeadActivitiesModule,
    LeadScoringModule,
    AppointmentsModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
