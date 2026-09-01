import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PropertyDocumentDto, PropertyDocumentType } from '@altiora/shared-types';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { FILE_STORAGE, type FileStorageService } from '../../../common/services/file-storage.interface';

/**
 * Documentos internos — NUNCA se exponen en el endpoint público de propiedad (v1 corrección 13).
 * Cada lectura exige @RequirePermission('properties','manage') a nivel de controlador.
 */
@Injectable()
export class PropertyDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(FILE_STORAGE) private readonly storage: FileStorageService,
  ) {}

  async listByProperty(propertyId: string): Promise<PropertyDocumentDto[]> {
    const documents = await this.prisma.propertyDocument.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
    });
    return documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  async add(
    propertyId: string,
    file: Express.Multer.File,
    type: PropertyDocumentType,
    uploadedById: string,
  ): Promise<PropertyDocumentDto> {
    const { storagePath, fileName } = await this.storage.save(
      `properties/${propertyId}/documents`,
      file.originalname,
      file.buffer,
    );

    const document = await this.prisma.propertyDocument.create({
      data: { propertyId, type, fileName: file.originalname, storagePath, uploadedById },
    });

    return {
      id: document.id,
      type: document.type,
      fileName,
      createdAt: document.createdAt.toISOString(),
    };
  }

  async remove(propertyId: string, documentId: string): Promise<void> {
    const document = await this.prisma.propertyDocument.findFirst({
      where: { id: documentId, propertyId },
    });
    if (!document) throw new NotFoundException(`Documento no encontrado: ${documentId}`);
    await this.prisma.propertyDocument.delete({ where: { id: documentId } });
  }

  async getFile(documentId: string): Promise<{ buffer: Buffer; fileName: string }> {
    const document = await this.prisma.propertyDocument.findUnique({ where: { id: documentId } });
    if (!document) throw new NotFoundException(`Documento no encontrado: ${documentId}`);
    const buffer = await this.storage.read(document.storagePath);
    return { buffer, fileName: document.fileName };
  }
}
