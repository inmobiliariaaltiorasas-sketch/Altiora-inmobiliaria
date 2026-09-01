import { Module } from '@nestjs/common';
import { CitiesService } from './application/cities.service';
import { CitiesController } from './infrastructure/cities.controller';
import { PrismaCitiesRepository } from './infrastructure/prisma-cities.repository';
import { CITIES_REPOSITORY } from './domain/cities.repository';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, { provide: CITIES_REPOSITORY, useClass: PrismaCitiesRepository }],
  exports: [CitiesService],
})
export class CitiesModule {}
