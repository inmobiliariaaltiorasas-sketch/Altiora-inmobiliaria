/** Lado más largo máximo: coincide con el techo de `deviceSizes` en next.config.ts. */
const MAX_SIDE_PX = 1920;
const QUALITY = 0.85;
const KEEP_AS_IS_BELOW_BYTES = 1024 * 1024;

/** JPEG se queda en JPEG; PNG y WebP salen como WebP para no perder la transparencia. */
const OUTPUT_TYPE: Record<string, { type: string; extension: string }> = {
  'image/jpeg': { type: 'image/jpeg', extension: 'jpg' },
  'image/png': { type: 'image/webp', extension: 'webp' },
  'image/webp': { type: 'image/webp', extension: 'webp' },
};

/**
 * Reduce una foto en el navegador antes de subirla: las de celular llegan de 4 a 10 MB y el
 * sitio las sirve tal cual (no hay optimización de imágenes en el Worker). Solo corre en el
 * cliente. Ante cualquier formato no soportado o error devuelve el archivo original — nunca
 * bloquea una subida.
 */
export async function shrinkImage(file: File): Promise<File> {
  const output = OUTPUT_TYPE[file.type];
  if (!output || typeof createImageBitmap !== 'function') return file;

  try {
    // `from-image` aplica la rotación EXIF; sin esto las fotos verticales de celular salen acostadas.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
    // Ya entra en tamaño y es liviana (p. ej. fotos reenviadas por WhatsApp): recodificarla
    // solo le quitaría calidad.
    if (scale === 1 && file.size <= KEEP_AS_IS_BELOW_BYTES) {
      bitmap.close();
      return file;
    }
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, output.type, QUALITY),
    );
    // Una foto ya chica y bien comprimida puede crecer al recodificarla: en ese caso gana la original.
    if (!blob || blob.type !== output.type || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.${output.extension}`, { type: output.type });
  } catch {
    return file;
  }
}
