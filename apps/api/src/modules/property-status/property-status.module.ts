import { Module } from '@nestjs/common';
import { PropertyStatusController } from './infrastructure/property-status.controller';

@Module({
  controllers: [PropertyStatusController],
})
export class PropertyStatusModule {}
