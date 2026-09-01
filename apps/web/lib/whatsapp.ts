/**
 * Número real de ALTiora — se configura vía NEXT_PUBLIC_WHATSAPP_NUMBER antes de lanzar.
 * Deliberadamente sin valor de ejemplo: un número inventado violaría la regla de no fabricar
 * datos comerciales (v1 corrección sección 26).
 */
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export function buildWhatsAppLink(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
