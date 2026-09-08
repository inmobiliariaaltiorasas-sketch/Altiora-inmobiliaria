/**
 * El seed de desarrollo marca el contenido de ejemplo con estos patrones en el título. Varias
 * filas quedaron con status PUBLISHED en producción por error (auditoría 2026-09) y no hay
 * acceso a la base de datos de producción para pasarlas a DRAFT manualmente — se excluyen del
 * catálogo público a nivel de query hasta que un admin las despublique desde el panel.
 */
export const DEMO_TITLE_MARKERS = ['(EJEMPLO)', '(SAMPLE)', '[EJEMPLO]', '[SAMPLE]'] as const;

export function hasDemoMarker(title: string): boolean {
  const lower = title.toLowerCase();
  return DEMO_TITLE_MARKERS.some((marker) => lower.includes(marker.toLowerCase()));
}
