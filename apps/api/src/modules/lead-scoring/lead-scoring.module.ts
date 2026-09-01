import { Module } from '@nestjs/common';
import { LeadScoringService } from './application/lead-scoring.service';

@Module({
  providers: [LeadScoringService],
  exports: [LeadScoringService],
})
export class LeadScoringModule {}
