import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import type {
  JwtPayload,
  PropertyDetailDto,
  PropertySearchResultDto,
  PropertySitemapEntryDto,
  SupportedLocale,
} from '@altiora/shared-types';
import { DEFAULT_LOCALE } from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PropertiesService } from '../application/properties.service';
import { PropertyFiltersQueryDto } from '../application/dto/property-filters-query.dto';
import { CreatePropertyDto } from '../application/dto/create-property.dto';
import { UpdatePropertyDto } from '../application/dto/update-property.dto';
import { UpdatePropertyPriceDto } from '../application/dto/update-property-price.dto';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  // --- Público — nunca detrás de auth (v1 corrección secciones 2 y 3) ---

  @Get()
  search(@Query() query: PropertyFiltersQueryDto): Promise<PropertySearchResultDto> {
    return this.propertiesService.search(query, false);
  }

  @Get('sitemap-entries')
  sitemapEntries(): Promise<PropertySitemapEntryDto[]> {
    return this.propertiesService.listSitemapEntries();
  }

  // --- Admin — deben ir antes de ':slug' para no ser interpretadas como un slug ---

  @Get('admin')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  searchAdmin(@Query() query: PropertyFiltersQueryDto): Promise<PropertySearchResultDto> {
    return this.propertiesService.search(query, true);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  findAdminById(
    @Param('id') id: string,
    @Query('locale') locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PropertyDetailDto> {
    return this.propertiesService.findAdminByIdOrThrow(id, locale);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PropertyDetailDto> {
    return this.propertiesService.create(dto, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PropertyDetailDto> {
    return this.propertiesService.update(id, dto, user.sub);
  }

  @Patch(':id/price')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  updatePrice(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyPriceDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PropertyDetailDto> {
    return this.propertiesService.updatePrice(id, dto, user.sub);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  publish(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<PropertyDetailDto> {
    return this.propertiesService.publish(id, user.sub);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  pause(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<PropertyDetailDto> {
    return this.propertiesService.pause(id, user.sub);
  }

  @Post(':id/mark-sold')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  markSold(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<PropertyDetailDto> {
    return this.propertiesService.markSold(id, user.sub);
  }

  @Post(':id/archive')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  archive(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<PropertyDetailDto> {
    return this.propertiesService.archive(id, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<void> {
    return this.propertiesService.remove(id, user.sub);
  }

  @Post(':id/feature')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  feature(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<PropertyDetailDto> {
    return this.propertiesService.setFeatured(id, true, user.sub);
  }

  @Post(':id/unfeature')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  unfeature(@Param('id') id: string, @CurrentUser() user: JwtPayload): Promise<PropertyDetailDto> {
    return this.propertiesService.setFeatured(id, false, user.sub);
  }

  // --- Público — SIEMPRE al final: cualquier slug que no matchee las rutas de arriba ---

  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PropertyDetailDto> {
    return this.propertiesService.findPublicBySlugOrThrow(slug, locale);
  }
}
