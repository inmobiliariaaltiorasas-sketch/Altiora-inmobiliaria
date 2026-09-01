import { Module } from '@nestjs/common';
import { LeadSourcesController } from './infrastructure/lead-sources.controller';

@Module({
  controllers: [LeadSourcesController],
})
export class LeadSourcesModule {}
