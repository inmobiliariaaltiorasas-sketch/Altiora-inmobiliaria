export const FAQ_RELATED_ENTITIES = ['GENERAL', 'CITY'] as const;
export type FaqRelatedEntity = (typeof FAQ_RELATED_ENTITIES)[number];

/**
 * `answer` siempre viene resuelta por el backend — para las preguntas dinámicas
 * (`isDynamic: true`) se calculó en el momento desde datos reales del catálogo,
 * nunca hardcodeada en el cliente (v1 sección 10 de correcciones).
 */
export interface FaqDto {
  id: string;
  question: string;
  answer: string;
  isDynamic: boolean;
  order: number;
}
