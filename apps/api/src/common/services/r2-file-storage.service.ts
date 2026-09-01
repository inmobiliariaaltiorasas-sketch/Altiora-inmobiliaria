import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { FileStorageService, StorageSaveResult } from './file-storage.interface';

/**
 * Cloudflare R2 vía el SDK de S3 (compatible por endpoint custom, no hace falta un SDK propio de
 * Cloudflare). Reemplaza a `LocalFileStorageService` en Render/producción, donde el filesystem es
 * efímero. La config se lee de forma perezosa (nunca en el constructor) para que Nest pueda
 * instanciar esta clase sin credenciales en desarrollo sin romper el bootstrap — mismo patrón que
 * `MetaWhatsAppProvider`.
 */
@Injectable()
export class R2FileStorageService implements FileStorageService {
  constructor(private readonly configService: ConfigService) {}

  private get bucket(): string {
    return this.configService.get<string>('R2_BUCKET_NAME', '');
  }

  private get publicBaseUrl(): string {
    return this.configService.get<string>('R2_PUBLIC_URL', '').replace(/\/$/, '');
  }

  private get client(): S3Client {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID', '');
    return new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID', ''),
        secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY', ''),
      },
    });
  }

  async save(subdir: string, originalName: string, buffer: Buffer): Promise<StorageSaveResult> {
    const fileName = `${randomUUID()}${extname(originalName)}`;
    const key = `${subdir}/${fileName}`;
    await this.client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: buffer }));
    return { storagePath: key, fileName };
  }

  async read(storagePath: string): Promise<Buffer> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: storagePath }),
    );
    const bytes = await result.Body?.transformToByteArray();
    if (!bytes) throw new Error(`No se pudo leer el objeto de R2: ${storagePath}`);
    return Buffer.from(bytes);
  }

  async removeDir(subdir: string): Promise<void> {
    const listed = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: `${subdir}/` }),
    );
    const keys = (listed.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => Boolean(key));
    if (keys.length === 0) return;

    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );
  }

  publicUrl(storagePath: string): string {
    return `${this.publicBaseUrl}/${storagePath}`;
  }
}
