import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { NeighborhoodsModule } from '../neighborhoods/neighborhoods.module';
import { LocationsController } from './infrastructure/locations.controller';

@Module({
  imports: [CitiesModule, NeighborhoodsModule],
  controllers: [LocationsController],
})
export class LocationsModule {}
