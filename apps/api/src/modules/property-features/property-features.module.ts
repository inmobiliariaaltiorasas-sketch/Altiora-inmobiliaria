import { Module } from '@nestjs/common';
import { PropertyFeaturesService } from './application/property-features.service';
import { PropertyFeaturesController } from './infrastructure/property-features.controller';
import { PrismaPropertyFeaturesRepository } from './infrastructure/prisma-property-features.repository';
import { PROPERTY_FEATURES_REPOSITORY } from './domain/property-features.repository';

@Module({
  controllers: [PropertyFeaturesController],
  providers: [
    PropertyFeaturesService,
    { provide: PROPERTY_FEATURES_REPOSITORY, useClass: PrismaPropertyFeaturesRepository },
  ],
  exports: [PropertyFeaturesService],
})
export class PropertyFeaturesModule {}
