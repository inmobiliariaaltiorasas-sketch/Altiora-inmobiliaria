import { Module } from '@nestjs/common';
import { LeadActivitiesService } from './application/lead-activities.service';

@Module({
  providers: [LeadActivitiesService],
  exports: [LeadActivitiesService],
})
export class LeadActivitiesModule {}
