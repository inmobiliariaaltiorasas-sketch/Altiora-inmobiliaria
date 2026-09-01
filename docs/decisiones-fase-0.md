# Decisiones de Fase 0

Documento operativo, no arquitectónico — la arquitectura ya quedó cerrada en el v1. Esto registra
las decisiones puntuales necesarias para poder escribir código en este bloque.

## Monorepo con npm workspaces (no Turborepo/Nx/pnpm)

Con dos apps y dos paquetes, un orquestador de build trae más configuración que beneficio. npm
workspaces alcanza para instalar y linkear `@altiora/shared-types` y `@altiora/config` entre
`apps/web` y `apps/api` sin dependencia nueva. Se reevalúa si el tiempo de build se vuelve un
problema real (Fase 4-5, con más apps/paquetes).

## Prisma como ORM y sistema de migraciones

Ya estaba propuesto en el v1 como alternativa recomendada sobre TypeORM. Fase 0 necesita
migraciones reales (punto 18 del roadmap), así que se confirma ahora: tipado end-to-end con
TypeScript, migraciones declarativas versionadas en `apps/api/prisma/migrations/`.

## Redis fuera de Fase 0

Regla explícita del usuario: Redis no debe bloquear la primera versión. `apps/api` corre hoy
sin cache ni colas — se incorpora cuando el roadmap llegue a Fase 3/5 y haya carga real que lo
justifique (WhatsApp de alto volumen, cache de búsquedas).

## next-intl fuera de Fase 0

La internacionalización real es Fase 4. El segmento `[locale]` ya existe en la URL
(`app/(public)/[locale]/`) con `generateStaticParams` devolviendo `es-CO` / `en-US`, para que
Fase 4 no tenga que reestructurar rutas — pero no hay enrutamiento de contenido por idioma
todavía.

## RBAC: permisos embebidos en el JWT

El `PermissionsGuard` no consulta la base de datos en cada request: los permisos del rol
(`resource:action`) se resuelven una vez al emitir el token (login/refresh) y viajan en el
payload. Trade-off consciente: si se revoca un permiso a mitad de sesión, el usuario lo conserva
hasta que el access token expire (15 min por defecto) o se refresque. Aceptable para Fase 0;
si se vuelve un problema real se agrega invalidación activa (que sí necesitaría Redis).

## Módulos de dominio: solo carpetas hasta que tengan lógica

Los 23 módulos de negocio del v1 (properties, leads, whatsapp, ai-assistant...) existen como
`*.module.ts` vacíos con sus subcarpetas `domain/application/infrastructure` ya creadas, pero
sin controladores ni casos de uso. Se llenan módulo por módulo a medida que el roadmap los
necesita — evita boilerplate muerto y mantiene el diff de cada fase legible.

## Postgres en el puerto 5434, no 5432

El 5432 por defecto ya está ocupado en esta máquina por un contenedor de otro proyecto
(`lcj-postgres`). `docker-compose.yml` expone `POSTGRES_PORT` (default `5434`) para no chocar;
en una máquina limpia se puede volver a 5432 sin tocar nada más.

## Git inicializado, sin commit

El repositorio se inicializa (`git init` + `.gitignore`) porque el CI y el versionado desde
ahora lo necesitan, pero no se crea ningún commit — eso lo decide explícitamente el usuario.
