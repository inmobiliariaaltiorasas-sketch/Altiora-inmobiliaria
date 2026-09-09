import type { Prisma } from '@prisma/client';
import { DEMO_TITLE_MARKERS } from './demo-content';

/** Excluye propiedades cuyo título (en cualquier idioma) tenga un marcador de contenido demo. */
export const excludeDemoPropertiesWhere: Prisma.PropertyWhereInput[] = DEMO_TITLE_MARKERS.map(
  (marker) => ({
    translations: { some: { title: { contains: marker, mode: 'insensitive' } } },
  }),
);

/**
 * Única definición de "propiedad pública" en todo el backend: PUBLISHED y sin marcador demo.
 * Reutilizar en cualquier query que alimente catálogo, destacadas, FAQ, JSON-LD, sitemap o stats
 * — nunca reimplementar el filtro localmente (eso fue lo que causó que el FAQ de una ciudad
 * mostrara rangos de precio calculados sobre propiedades demo que el listado ya ocultaba).
 */
export function publicPropertyWhere(): Prisma.PropertyWhereInput {
  return { status: 'PUBLISHED', NOT: excludeDemoPropertiesWhere };
}
