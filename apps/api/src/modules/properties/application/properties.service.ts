import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  DEFAULT_LOCALE,
  type AuditAction,
  type PropertyDetailDto,
  type PropertyPublicationStatus,
  type PropertySearchResultDto,
  type PropertySitemapEntryDto,
  type SupportedLocale,
} from '@altiora/shared-types';
import { slugify } from '../../../common/utils/slugify';
import { WebRevalidationService } from '../../../common/services/web-revalidation.service';
import { FILE_STORAGE, type FileStorageService } from '../../../common/services/file-storage.interface';
import { CitiesService } from '../../cities/application/cities.service';
import { AuditLogsService } from '../../audit-logs/application/audit-logs.service';
import { PROPERTIES_REPOSITORY, type PropertiesRepository } from '../domain/properties.repository';
import type { CreatePropertyDto } from './dto/create-property.dto';
import type { UpdatePropertyDto } from './dto/update-property.dto';
import type { UpdatePropertyPriceDto } from './dto/update-property-price.dto';
import type { PropertyFiltersQueryDto } from './dto/property-filters-query.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @Inject(PROPERTIES_REPOSITORY) private readonly repository: PropertiesRepository,
    private readonly citiesService: CitiesService,
    private readonly auditLogsService: AuditLogsService,
    private readonly revalidationService: WebRevalidationService,
    @Inject(FILE_STORAGE) private readonly storage: FileStorageService,
  ) {}

  search(
    query: PropertyFiltersQueryDto,
    includeUnpublished = false,
  ): Promise<PropertySearchResultDto> {
    return this.repository.search({
      citySlug: query.city,
      neighborhoodSlug: query.neighborhood,
      propertyTypeSlug: query.type,
      operationType: query.operation,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minBedrooms: query.minBedrooms,
      minBathrooms: query.minBathrooms,
      minBuiltAreaM2: query.minBuiltAreaM2,
      page: query.page ?? 1,
      pageSize: Math.min(query.pageSize ?? 12, 48),
      locale: query.locale ?? DEFAULT_LOCALE,
      includeUnpublished,
    });
  }

  async findPublicBySlugOrThrow(slug: string, locale: SupportedLocale): Promise<PropertyDetailDto> {
    const property = await this.repository.findPublicBySlug(slug, locale);
    if (!property) throw new NotFoundException(`Propiedad no encontrada: ${slug}`);
    return property;
  }

  async findAdminByIdOrThrow(
    id: string,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Promise<PropertyDetailDto> {
    const property = await this.repository.findAdminById(id, locale);
    if (!property) throw new NotFoundException(`Propiedad no encontrada: ${id}`);
    return property;
  }

  async create(dto: CreatePropertyDto, actorUserId: string): Promise<PropertyDetailDto> {
    const city = await this.citiesService.findByIdOrThrow(dto.cityId);
    const baseTranslation =
      dto.translations.find((t) => t.locale === DEFAULT_LOCALE) ?? dto.translations[0];
    if (!baseTranslation) throw new BadRequestException('Se necesita al menos una traducción');
    const slug = await this.generateUniqueSlug(baseTranslation.title, city.name);

    const created = await this.repository.create({
      slug,
      operationType: dto.operationType,
      price: dto.price,
      currency: dto.currency ?? 'COP',
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      parkingSpots: dto.parkingSpots ?? 0,
      builtAreaM2: dto.builtAreaM2,
      landAreaM2: dto.landAreaM2,
      yearBuilt: dto.yearBuilt,
      addressLine: dto.addressLine,
      latitude: dto.latitude,
      longitude: dto.longitude,
      cityId: dto.cityId,
      neighborhoodId: dto.neighborhoodId,
      propertyTypeId: dto.propertyTypeId,
      agentId: dto.agentId,
      featureIds: dto.featureIds ?? [],
      translations: dto.translations,
    });

    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'Property',
      entityId: created.id,
      action: 'CREATE',
    });

    return this.findAdminByIdOrThrow(created.id);
  }

  async update(
    id: string,
    dto: UpdatePropertyDto,
    actorUserId: string,
  ): Promise<PropertyDetailDto> {
    await this.repository.update(id, dto);
    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'Property',
      entityId: id,
      action: 'UPDATE',
      diff: dto as unknown as Record<string, unknown>,
    });

    const updated = await this.findAdminByIdOrThrow(id);
    await this.revalidationService.revalidateProperty(updated.slug);
    return updated;
  }

  publish(id: string, actorUserId: string): Promise<PropertyDetailDto> {
    return this.changeStatus(id, 'PUBLISHED', 'PUBLISH', actorUserId);
  }

  pause(id: string, actorUserId: string): Promise<PropertyDetailDto> {
    return this.changeStatus(id, 'PAUSED', 'PAUSE', actorUserId);
  }

  markSold(id: string, actorUserId: string): Promise<PropertyDetailDto> {
    return this.changeStatus(id, 'SOLD', 'MARK_SOLD', actorUserId);
  }

  archive(id: string, actorUserId: string): Promise<PropertyDetailDto> {
    return this.changeStatus(id, 'ARCHIVED', 'ARCHIVE', actorUserId);
  }

  async setFeatured(
    id: string,
    isFeatured: boolean,
    actorUserId: string,
  ): Promise<PropertyDetailDto> {
    await this.repository.setFeatured(id, isFeatured);
    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'Property',
      entityId: id,
      action: isFeatured ? 'FEATURE' : 'UNFEATURE',
    });

    const updated = await this.findAdminByIdOrThrow(id);
    await this.revalidationService.revalidateProperty(updated.slug);
    return updated;
  }

  async updatePrice(
    id: string,
    dto: UpdatePropertyPriceDto,
    actorUserId: string,
  ): Promise<PropertyDetailDto> {
    const before = await this.repository.getSnapshot(id);
    if (!before) throw new NotFoundException(`Propiedad no encontrada: ${id}`);

    await this.repository.updatePrice(id, dto.price, dto.currency);
    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'Property',
      entityId: id,
      action: 'UPDATE',
      diff: {
        priceBefore: before.price,
        priceAfter: dto.price,
        currency: dto.currency ?? before.currency,
      },
    });

    const updated = await this.findAdminByIdOrThrow(id);
    await this.revalidationService.revalidateProperty(updated.slug);
    return updated;
  }

  /**
   * Borrado real (no ARCHIVED) — pedido explícito para poder eliminar propiedades ya
   * publicadas por error/duplicadas. Si tiene citas (`Appointment`) agendadas, el FK sin
   * cascade en el schema hace que Prisma rechace el delete (P2003) — se traduce a un error
   * claro en vez de dejar pasar el 500 crudo; archivar sigue siendo la opción si eso pasa.
   */
  async remove(id: string, actorUserId: string): Promise<void> {
    const property = await this.findAdminByIdOrThrow(id);

    try {
      await this.repository.remove(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          'No se puede eliminar: la propiedad tiene citas agendadas. Archivala en su lugar.',
        );
      }
      throw error;
    }

    await this.storage.removeDir(`properties/${id}`);

    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'Property',
      entityId: id,
      action: 'DELETE',
      diff: { slug: property.slug, statusAtDeletion: property.status },
    });

    await this.revalidationService.revalidateProperty(property.slug);
  }

  listSitemapEntries(): Promise<PropertySitemapEntryDto[]> {
    return this.repository.listSitemapEntries();
  }

  private async changeStatus(
    id: string,
    status: PropertyPublicationStatus,
    action: AuditAction,
    actorUserId: string,
  ): Promise<PropertyDetailDto> {
    const before = await this.repository.getSnapshot(id);
    if (!before) throw new NotFoundException(`Propiedad no encontrada: ${id}`);

    await this.repository.updateStatus(id, status);
    await this.auditLogsService.record({
      userId: actorUserId,
      entity: 'Property',
      entityId: id,
      action,
      diff: { statusBefore: before.status, statusAfter: status },
    });

    const updated = await this.findAdminByIdOrThrow(id);
    await this.revalidationService.revalidateProperty(updated.slug);
    return updated;
  }

  /** Se genera una sola vez al crear — nunca se regenera al editar el título (v1 sección 08). */
  private async generateUniqueSlug(title: string, cityName: string): Promise<string> {
    const base = slugify(`${title}-${cityName}`);
    let candidate = base;
    let suffix = 2;
    while (await this.repository.existsBySlug(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }
}
