import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PropertyMediaDto, PropertyMediaType } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FILE_STORAGE, type FileStorageService } from '../../../common/services/file-storage.interface';

/** Límite de fotos por propiedad — pedido explícito del negocio, no una restricción técnica. */
const MAX_MEDIA_PER_PROPERTY = 10;

@Injectable()
export class PropertyMediaService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE) private readonly storage: FileStorageService,
  ) {}

  listByProperty(propertyId: string): Promise<PropertyMediaDto[]> {
    return this.prisma.propertyMedia.findMany({
      where: { propertyId },
      orderBy: { order: 'asc' },
    });
  }

  async add(
    propertyId: string,
    file: Express.Multer.File,
    type: PropertyMediaType,
  ): Promise<PropertyMediaDto> {
    const order = await this.prisma.propertyMedia.count({ where: { propertyId } });
    if (order >= MAX_MEDIA_PER_PROPERTY) {
      throw new BadRequestException(`Máximo ${MAX_MEDIA_PER_PROPERTY} fotos por propiedad`);
    }

    const { storagePath, fileName } = await this.storage.save(
      `properties/${propertyId}/media`,
      file.originalname,
      file.buffer,
    );
    /** R2 sirve la foto directo desde su URL pública; en local se sigue proxyeando por la API. */
    const url = this.storage.publicUrl(storagePath) ?? `/property-media/file/${propertyId}/${fileName}`;

    return this.prisma.propertyMedia.create({
      data: {
        propertyId,
        type,
        url,
        order,
      },
    });
  }

  async remove(propertyId: string, mediaId: string): Promise<void> {
    const media = await this.prisma.propertyMedia.findFirst({ where: { id: mediaId, propertyId } });
    if (!media) throw new NotFoundException(`Media no encontrada: ${mediaId}`);
    await this.prisma.propertyMedia.delete({ where: { id: mediaId } });
  }

  /**
   * "Portada" no es un campo aparte — es, por convención, la foto con `order` más bajo
   * (ver `orderBy: { order: 'asc' }` en el include de Property). Marcar portada reordena.
   */
  async setCover(propertyId: string, mediaId: string): Promise<void> {
    const items = await this.prisma.propertyMedia.findMany({
      where: { propertyId, type: 'PHOTO' },
      orderBy: { order: 'asc' },
    });
    const cover = items.find((item) => item.id === mediaId);
    if (!cover) throw new NotFoundException(`Media no encontrada: ${mediaId}`);

    const rest = items.filter((item) => item.id !== mediaId);
    await this.prisma.$transaction([
      this.prisma.propertyMedia.update({ where: { id: cover.id }, data: { order: 0 } }),
      ...rest.map((item, index) =>
        this.prisma.propertyMedia.update({ where: { id: item.id }, data: { order: index + 1 } }),
      ),
    ]);
  }

  /** Solo se usa cuando el storage activo es local (R2 sirve la foto directo desde su URL pública). */
  async getFile(propertyId: string, fileName: string): Promise<Buffer> {
    const media = await this.prisma.propertyMedia.findFirst({
      where: { propertyId, url: `/property-media/file/${propertyId}/${fileName}` },
    });
    if (!media) throw new NotFoundException('Archivo no encontrado');
    return this.storage.read(`properties/${propertyId}/media/${fileName}`);
  }
}
