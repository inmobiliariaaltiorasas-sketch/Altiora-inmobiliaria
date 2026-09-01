# ALTiora — Plataforma digital

Monorepo de la plataforma de ALTiora Construcciones e Inmobiliaria S.A.S. El contrato de
arquitectura completo (módulos, entidades, flujos, SEO/GEO/AEO, seguridad, roadmap) vive en el
documento de arquitectura v1 aprobado — este README es solo el quickstart operativo.
Decisiones puntuales de este bloque: [`docs/decisiones-fase-0.md`](./docs/decisiones-fase-0.md).

## Estructura

```
apps/web              Next.js — sitio público + panel admin
apps/api              NestJS — API REST
packages/shared-types  DTOs y enums compartidos entre apps/web y apps/api
packages/config        tsconfig, ESLint y Prettier base compartidos
```

## Requisitos

- Node.js 20+
- Docker (para PostgreSQL en desarrollo)

## Puesta en marcha

```bash
# 1. Variables de entorno
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 2. Base de datos
docker compose up -d

# 3. Dependencias (raíz — workspaces)
npm install

# 4. Cliente de Prisma, migración inicial y seed (roles + usuario SUPER_ADMIN de desarrollo)
npm run db:migrate
npm run db:seed

# 5. Levantar ambas apps (en dos terminales)
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:3000
```

El usuario de desarrollo creado por el seed queda impreso en consola
(`DEV_SUPER_ADMIN_EMAIL` / `DEV_SUPER_ADMIN_PASSWORD` en `apps/api/.env`).

## Scripts útiles (raíz)

| Script | Qué hace |
| --- | --- |
| `npm run lint` | Lint de `apps/api` y `apps/web` |
| `npm run format` / `format:check` | Prettier sobre todo el monorepo |
| `npm run build` | Build de producción de ambas apps |
| `npm run db:migrate` | `prisma migrate dev` sobre `apps/api` |
| `npm run db:seed` | Corre `apps/api/prisma/seed.ts` |

## Verificar que todo funciona

```bash
curl http://localhost:4000/health
# { "status": "ok", "database": "up", "timestamp": "..." }

curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<DEV_SUPER_ADMIN_EMAIL>","password":"<DEV_SUPER_ADMIN_PASSWORD>"}'
```

## Estado

**Fase 0 — Fundación técnica.** Catálogo de propiedades, panel admin real, leads y SEO llegan en
Fase 1. Ver roadmap completo en el documento de arquitectura v1.
