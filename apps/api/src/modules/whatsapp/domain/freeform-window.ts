const FREEFORM_WINDOW_HOURS = 24;

/**
 * Meta solo permite mensajes de texto libre dentro de las 24h desde el último mensaje entrante
 * del usuario; fuera de esa ventana hay que usar una plantilla aprobada. Un click en el botón de
 * WhatsApp del sitio NO abre esta ventana por sí solo — solo un mensaje entrante real la abre
 * (v1 corrección sección 14).
 */
export function isWithinFreeformWindow(
  lastInboundAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!lastInboundAt) return false;
  const hoursSinceLastInbound = (now.getTime() - lastInboundAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastInbound < FREEFORM_WINDOW_HOURS;
}
