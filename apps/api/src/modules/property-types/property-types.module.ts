import { Module } from '@nestjs/common';
import { PropertyTypesService } from './application/property-types.service';
import { PropertyTypesController } from './infrastructure/property-types.controller';
import { PrismaPropertyTypesRepository } from './infrastructure/prisma-property-types.repository';
import { PROPERTY_TYPES_REPOSITORY } from './domain/property-types.repository';

@Module({
  controllers: [PropertyTypesController],
  providers: [
    PropertyTypesService,
    { provide: PROPERTY_TYPES_REPOSITORY, useClass: PrismaPropertyTypesRepository },
  ],
  exports: [PropertyTypesService],
})
export class PropertyTypesModule {}
