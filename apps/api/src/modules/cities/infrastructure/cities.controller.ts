import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { CityDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { CitiesService } from '../application/cities.service';
import { CreateCityDto } from '../application/dto/create-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  /** Público — usado por el buscador, el sitemap y la exploración por ubicación de la Home. */
  @Get()
  findAllActive(): Promise<CityDto[]> {
    return this.citiesService.findAllActive();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  create(@Body() dto: CreateCityDto): Promise<CityDto> {
    return this.citiesService.create(dto);
  }
}
