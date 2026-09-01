import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { PropertyFeatureDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { PropertyFeaturesService } from '../application/property-features.service';
import { CreatePropertyFeatureDto } from '../application/dto/create-property-feature.dto';

@Controller('property-features')
export class PropertyFeaturesController {
  constructor(private readonly propertyFeaturesService: PropertyFeaturesService) {}

  @Get()
  findAll(): Promise<PropertyFeatureDto[]> {
    return this.propertyFeaturesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  create(@Body() dto: CreatePropertyFeatureDto): Promise<PropertyFeatureDto> {
    return this.propertyFeaturesService.create(dto);
  }
}
