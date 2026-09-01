const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * `PropertyMedia.url`/`PropertyDocument` vienen como ruta relativa a la API
 * (`/property-media/file/...`) — sin este prefijo, Next.js las trata como asset local
 * propio y nunca llegan al backend en el puerto 4000, dando 404 siempre.
 */
export function resolveMediaUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${API_URL}${url}`;
}

interface ApiClientOptions extends RequestInit {
  accessToken?: string;
}

/**
 * Wrapper server-side sobre la API de NestJS. Server Components y Route Handlers lo usan
 * para no reimplementar fetch/headers/manejo de errores en cada página — ver v1 sección 06.
 */
export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { accessToken, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API ${path} respondió ${response.status}`);
  }

  return response.json() as Promise<T>;
}
