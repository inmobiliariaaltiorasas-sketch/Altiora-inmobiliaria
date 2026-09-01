import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalFileStorageService } from './local-file-storage.service';
import { R2FileStorageService } from './r2-file-storage.service';
import { FILE_STORAGE } from './file-storage.interface';

/**
 * Único lugar donde se decide Local vs R2 — cualquier módulo que necesite guardar/leer archivos
 * importa este módulo e inyecta `FILE_STORAGE`, nunca las clases concretas.
 */
@Module({
  providers: [
    LocalFileStorageService,
    R2FileStorageService,
    {
      provide: FILE_STORAGE,
      /**
       * Sin `R2_ACCOUNT_ID` en el entorno, el disco local es el default — mismo patrón que
       * `WHATSAPP_PROVIDER`: automático, sin un flag manual que alguien pueda olvidar prender.
       */
      useFactory: (
        config: ConfigService,
        local: LocalFileStorageService,
        r2: R2FileStorageService,
      ) => (config.get<string>('R2_ACCOUNT_ID') ? r2 : local),
      inject: [ConfigService, LocalFileStorageService, R2FileStorageService],
    },
  ],
  exports: [FILE_STORAGE],
})
export class FileStorageModule {}
