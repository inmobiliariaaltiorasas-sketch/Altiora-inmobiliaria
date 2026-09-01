import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import type { FileStorageService, StorageSaveResult } from './file-storage.interface';

/**
 * Disco local — default cuando no hay credenciales de R2 en el entorno (desarrollo). En
 * Vercel/Render el filesystem es efímero, así que producción siempre corre con
 * `R2FileStorageService` en su lugar (ver `PropertyMediaModule`).
 */
@Injectable()
export class LocalFileStorageService implements FileStorageService {
  constructor(private readonly configService: ConfigService) {}

  private get rootDir(): string {
    return this.configService.get<string>(
      'PROPERTY_MEDIA_UPLOAD_DIR',
      join(process.cwd(), 'uploads'),
    );
  }

  async save(subdir: string, originalName: string, buffer: Buffer): Promise<StorageSaveResult> {
    const dir = join(this.rootDir, subdir);
    mkdirSync(dir, { recursive: true });

    const fileName = `${randomUUID()}${extname(originalName)}`;
    writeFileSync(join(dir, fileName), buffer);

    return { storagePath: `${subdir}/${fileName}`, fileName };
  }

  async read(storagePath: string): Promise<Buffer> {
    return readFileSync(join(this.rootDir, storagePath));
  }

  /** Borra un subdirectorio completo (ej. todas las fotos/documentos de una propiedad eliminada). */
  async removeDir(subdir: string): Promise<void> {
    rmSync(join(this.rootDir, subdir), { recursive: true, force: true });
  }

  publicUrl(): null {
    return null;
  }
}
