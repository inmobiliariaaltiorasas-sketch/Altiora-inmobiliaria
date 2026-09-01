/**
 * Roles base del v1. Viven como dato seedeado en la tabla `Role` (ver apps/api/prisma/seed.ts),
 * no como enum de base de datos: agregar un rol nuevo es una fila, no un deploy.
 * Este union type es solo para autocompletado/validación en código, no la fuente de verdad.
 */
export const BASE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'AGENT',
  'CONTENT_MANAGER',
  'MARKETING',
  'VIEWER',
] as const;

export type BaseRoleName = (typeof BASE_ROLES)[number];
