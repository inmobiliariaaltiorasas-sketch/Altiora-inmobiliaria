import { Controller, Get } from '@nestjs/common';
import {
  PROPERTY_PUBLICATION_STATUSES,
  type PropertyPublicationStatus,
} from '@altiora/shared-types';

/**
 * Los 5 estados son un flujo de trabajo fijo (v1), no un catálogo editable por el admin —
 * por eso viven como enum de Prisma, no como tabla. Este endpoint solo expone la lista
 * para poblar selects del panel administrativo.
 */
@Controller('property-status')
export class PropertyStatusController {
  @Get()
  findAll(): PropertyPublicationStatus[] {
    return [...PROPERTY_PUBLICATION_STATUSES];
  }
}
