import { Module } from '@nestjs/common';
import { PropertyMediaService } from './application/property-media.service';
import { PropertyDocumentsService } from './application/property-documents.service';
import { PropertyMediaController } from './infrastructure/property-media.controller';
import { FileStorageModule } from '../../common/services/file-storage.module';

@Module({
  imports: [FileStorageModule],
  controllers: [PropertyMediaController],
  providers: [PropertyMediaService, PropertyDocumentsService],
  exports: [PropertyMediaService, PropertyDocumentsService],
})
export class PropertyMediaModule {}
