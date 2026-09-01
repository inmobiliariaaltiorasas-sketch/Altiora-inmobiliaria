import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import type { NeighborhoodDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { NeighborhoodsService } from '../application/neighborhoods.service';
import { CreateNeighborhoodDto } from '../application/dto/create-neighborhood.dto';

@Controller('neighborhoods')
export class NeighborhoodsController {
  constructor(private readonly neighborhoodsService: NeighborhoodsService) {}

  @Get('by-city/:cityId')
  findByCity(@Param('cityId') cityId: string): Promise<NeighborhoodDto[]> {
    return this.neighborhoodsService.findByCityId(cityId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  create(@Body() dto: CreateNeighborhoodDto): Promise<NeighborhoodDto> {
    return this.neighborhoodsService.create(dto);
  }
}
