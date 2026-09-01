export const FILE_STORAGE = Symbol('FILE_STORAGE');

export interface StorageSaveResult {
  storagePath: string;
  fileName: string;
}

/**
 * Swappable detrás de esta interfaz: `LocalFileStorageService` (default sin credenciales R2) o
 * `R2FileStorageService` (Cloudflare R2 real) — el resto del sistema nunca sabe cuál está activa.
 * `storagePath` es una clave relativa (`subdir/fileName`), no un path absoluto de filesystem: así
 * cada implementación decide cómo resolverla (prefijo de disco local vs. key de objeto en R2).
 */
export interface FileStorageService {
  save(subdir: string, originalName: string, buffer: Buffer): Promise<StorageSaveResult>;
  read(storagePath: string): Promise<Buffer>;
  removeDir(subdir: string): Promise<void>;
  /** URL pública directa si el backend la soporta (R2), o null si hay que servir vía proxy (local). */
  publicUrl(storagePath: string): string | null;
}
