import { Module } from '@nestjs/common';
import { PropertiesService } from './application/properties.service';
import { PropertiesController } from './infrastructure/properties.controller';
import { PrismaPropertiesRepository } from './infrastructure/prisma-properties.repository';
import { PROPERTIES_REPOSITORY } from './domain/properties.repository';
import { CitiesModule } from '../cities/cities.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { WebRevalidationService } from '../../common/services/web-revalidation.service';
import { FileStorageModule } from '../../common/services/file-storage.module';

@Module({
  imports: [CitiesModule, AuditLogsModule, FileStorageModule],
  controllers: [PropertiesController],
  providers: [
    PropertiesService,
    WebRevalidationService,
    { provide: PROPERTIES_REPOSITORY, useClass: PrismaPropertiesRepository },
  ],
  exports: [PropertiesService],
})
export class PropertiesModule {}
