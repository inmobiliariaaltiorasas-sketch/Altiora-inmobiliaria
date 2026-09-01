import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { PropertyTypeDto } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { PropertyTypesService } from '../application/property-types.service';
import { CreatePropertyTypeDto } from '../application/dto/create-property-type.dto';

@Controller('property-types')
export class PropertyTypesController {
  constructor(private readonly propertyTypesService: PropertyTypesService) {}

  @Get()
  findAll(): Promise<PropertyTypeDto[]> {
    return this.propertyTypesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  create(@Body() dto: CreatePropertyTypeDto): Promise<PropertyTypeDto> {
    return this.propertyTypesService.create(dto);
  }
}
