import { Controller, Get } from '@nestjs/common';
import type { LocationsTreeEntryDto } from '@altiora/shared-types';
import { CitiesService } from '../../cities/application/cities.service';
import { NeighborhoodsService } from '../../neighborhoods/application/neighborhoods.service';

/**
 * Agregador de solo lectura sobre Cities + Neighborhoods — pensado para el selector de
 * ubicación del buscador y la "exploración por ubicación" de la Home (v1 sección 20).
 */
@Controller('locations')
export class LocationsController {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly neighborhoodsService: NeighborhoodsService,
  ) {}

  @Get('tree')
  async tree(): Promise<LocationsTreeEntryDto[]> {
    const cities = await this.citiesService.findAllActive();
    return Promise.all(
      cities.map(async (city) => ({
        ...city,
        neighborhoods: await this.neighborhoodsService.findByCityId(city.id),
      })),
    );
  }
}
