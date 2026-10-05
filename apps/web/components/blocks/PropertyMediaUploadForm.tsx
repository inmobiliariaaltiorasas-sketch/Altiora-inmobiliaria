'use client';

import { useRef, useState, type FormEvent } from 'react';
import { shrinkImage } from '@/lib/shrink-image';

/** Debe quedar por debajo de `serverActions.bodySizeLimit` en next.config.ts. */
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_FILE_LABEL = '15 MB';

class FileTooBigError extends Error {}

interface PropertyMediaUploadFormProps {
  action: (formData: FormData) => Promise<void>;
  remaining: number;
}

/**
 * Sube los archivos de a uno, una Server Action por archivo. Mandarlos todos en un solo submit
 * supera el límite de tamaño de body de las Server Actions apenas se eligen varias fotos, y el
 * navegador solo muestra "Failed to fetch" sin decir cuál falló.
 */
export function PropertyMediaUploadForm({ action, remaining }: PropertyMediaUploadFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const data = new FormData(event.currentTarget);
    const type = data.get('type') ?? 'PHOTO';
    const files = data.getAll('file').filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) return;
    if (files.length > remaining) {
      setError(`Elegiste ${files.length} archivos y solo quedan ${remaining} lugares.`);
      return;
    }
    let uploaded = 0;
    try {
      for (const file of files) {
        setProgress({ current: uploaded + 1, total: files.length });
        // El tope se valida después de reducir: una foto de celular de 20 MB queda muy por debajo.
        const prepared = await shrinkImage(file);
        if (prepared.size > MAX_FILE_BYTES) throw new FileTooBigError();
        const single = new FormData();
        single.set('type', type);
        single.set('file', prepared);
        await action(single);
        uploaded += 1;
      }
      formRef.current?.reset();
    } catch (cause) {
      const name = files[uploaded]?.name ?? 'el archivo';
      const reason =
        cause instanceof FileTooBigError
          ? `"${name}" pesa más de ${MAX_FILE_LABEL}.`
          : `No se pudo subir "${name}".`;
      setError(`${reason} Se subieron ${uploaded} de ${files.length}.`);
    } finally {
      setProgress(null);
    }
  }

  const uploading = progress !== null;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.6rem',
        marginTop: '1.25rem',
        alignItems: 'flex-end',
      }}
    >
      <div className="field">
        <label htmlFor="media-type">Tipo</label>
        <select id="media-type" name="type" defaultValue="PHOTO" disabled={uploading}>
          <option value="PHOTO">Foto</option>
          <option value="VIDEO">Video</option>
          <option value="TOUR">Tour virtual</option>
          <option value="FLOORPLAN">Plano</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="media-file">
          Archivos (hasta {remaining} más; las fotos se reducen solas al subir)
        </label>
        <input id="media-file" name="file" type="file" multiple required disabled={uploading} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={uploading}>
        {uploading ? `Subiendo ${progress.current} de ${progress.total}…` : 'Subir'}
      </button>
      {error ? (
        <p role="alert" style={{ flexBasis: '100%', color: '#b3261e', fontSize: '0.9rem' }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
