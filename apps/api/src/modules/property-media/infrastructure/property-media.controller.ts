import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type {
  PropertyDocumentDto,
  PropertyDocumentType,
  PropertyMediaDto,
  PropertyMediaType,
} from '@altiora/shared-types';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@altiora/shared-types';
import { PropertyMediaService } from '../application/property-media.service';
import { PropertyDocumentsService } from '../application/property-documents.service';

const MEDIA_MAX_BYTES = 50 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;

@Controller()
export class PropertyMediaController {
  constructor(
    private readonly mediaService: PropertyMediaService,
    private readonly documentsService: PropertyDocumentsService,
  ) {}

  // --- Multimedia pública — v1 corrección 13 ---

  @Get('properties/:propertyId/media')
  listMedia(@Param('propertyId') propertyId: string): Promise<PropertyMediaDto[]> {
    return this.mediaService.listByProperty(propertyId);
  }

  @Post('properties/:propertyId/media')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MEDIA_MAX_BYTES } }))
  addMedia(
    @Param('propertyId') propertyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: PropertyMediaType,
  ): Promise<PropertyMediaDto> {
    return this.mediaService.add(propertyId, file, type);
  }

  @Patch('properties/:propertyId/media/:mediaId/cover')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  setCoverMedia(
    @Param('propertyId') propertyId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<void> {
    return this.mediaService.setCover(propertyId, mediaId);
  }

  @Delete('properties/:propertyId/media/:mediaId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  removeMedia(
    @Param('propertyId') propertyId: string,
    @Param('mediaId') mediaId: string,
  ): Promise<void> {
    return this.mediaService.remove(propertyId, mediaId);
  }

  /** Sin auth — es la URL que consume la ficha pública de propiedad. */
  @Get('property-media/file/:propertyId/:fileName')
  async serveMediaFile(
    @Param('propertyId') propertyId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.mediaService.getFile(propertyId, fileName);
    res.type(fileName).send(buffer);
  }

  // --- Documentos internos — jamás públicos (v1 corrección 13) ---

  @Get('properties/:propertyId/documents')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  listDocuments(@Param('propertyId') propertyId: string): Promise<PropertyDocumentDto[]> {
    return this.documentsService.listByProperty(propertyId);
  }

  @Post('properties/:propertyId/documents')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: DOCUMENT_MAX_BYTES } }))
  addDocument(
    @Param('propertyId') propertyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: PropertyDocumentType,
    @CurrentUser() user: JwtPayload,
  ): Promise<PropertyDocumentDto> {
    return this.documentsService.add(propertyId, file, type, user.sub);
  }

  @Delete('properties/:propertyId/documents/:documentId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  removeDocument(
    @Param('propertyId') propertyId: string,
    @Param('documentId') documentId: string,
  ): Promise<void> {
    return this.documentsService.remove(propertyId, documentId);
  }

  @Get('property-media/document-file/:documentId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  async serveDocumentFile(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, fileName } = await this.documentsService.getFile(documentId);
    res.set('Content-Disposition', `attachment; filename="${fileName}"`);
    res.type(fileName).send(buffer);
  }
}
