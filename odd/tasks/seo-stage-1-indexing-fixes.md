# seo-stage-1-indexing-fixes

## Objective
Fix the technical defects that stop Google and answer engines from indexing the public site
correctly, without changing the visual design or the URL structure. Stage 1 of the SEO / AEO /
GEO programme requested on 2026-10-05.

## Problem / why
The 2026-10-05 audit (live crawl plus code map) found that the base is sound (server-rendered
property pages, slug URLs, sitemap, JSON-LD) but several defects send contradictory or fragile
signals:
- Every `/en-US/` page declares its canonical as `/es-CO/` while also listing itself in
  hreflang and in the sitemap.
- No `metadataBase`; the sitemap falls back to `http://localhost:3000` when an env var is missing.
- An API failure on a property or blog detail page becomes a 404, so a transient outage can
  deindex listings.
- `/admin/login` is indexable; the revalidation secret has a hardcoded default.
- Placeholder pages (`/proyectos`, `/calculadora-credito`) are indexable.
- Property and listing titles carry no brand; the brand is spelled several ways.
- A listing titled "Casa" is emitted as schema.org `Apartment`; the property JSON-LD lacks
  bedrooms, bathrooms and floor size; visible and structured breadcrumbs differ.
- Mixed voseo / tuteo in Spanish copy on a Colombian site.

## Scope
- `apps/web`: `lib/seo/*`, `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`,
  `next.config.ts`, `middleware.ts`, `lib/api/properties.ts`, `lib/api/blog.ts`,
  `app/api/revalidate/route.ts`, public pages' metadata and JSON-LD, admin layout metadata.
- `apps/api`: `sitemap-entries` endpoints for properties and blog (add available locales).
- `packages/shared-types`: the sitemap entry DTO.
- `.github/workflows/ci.yml`: run typecheck and tests.

## Out of scope (later stages or user decisions)
- Sold / paused / archived property strategy (today they return 404). Needs a product decision.
- `www` host (522) and `http` to `https` redirect: DNS / Cloudflare dashboard, not code.
- Analytics (stage 2), type and city landing pages (stage 3), images and caching (stage 4),
  admin SEO fields (stage 5), blog and AEO content (stage 6).

## Constraints
- Keep the visual identity and every existing behaviour, route and URL.
- No invented business data (no social links, hours, ratings, prices, neighbourhoods).
- Brand name in titles, `og:site_name`, breadcrumbs and JSON-LD `name`: `ALTiora Inmobiliaria`.
  Legal name stays `Altiora Construcciones e Inmobiliaria S.A.S.` as `legalName`.
- Spanish UI copy: neutral Colombian tuteo, no voseo.
- Commits are work units on this feature branch. Push, PR, merge and deploy stay with the user.

## TDD
- Mode: strict (source: user global instructions, "Strict TDD Mode: enabled").
- Runner: none existed in `apps/web`. T1 introduces Vitest for `apps/web`
  (`npm run test --workspace=apps/web`). `apps/api` has Jest as a dependency but no config or
  spec files; T1 adds the minimal config (`npm test --workspace=apps/api`).
- RED must be observed before GREEN for every new behaviour in pure logic (SEO helpers,
  mappers, fetch error handling). Page wiring is covered by typecheck, lint and build.

## Tasks
- [x] T1 Canonical, hreflang and site URL. Route: delegated writer (4+ non-trivial files).
  - Vitest in `apps/web`; Jest config in `apps/api`; CI runs typecheck and tests.
  - One site-URL source; `metadataBase` in the root layout; sitemap and robots use it, with no
    localhost fallback in production builds.
  - `buildAlternates`: self-referencing canonical per locale, `x-default` pointing to es-CO.
  - Property and blog detail: when the requested locale has no translation, canonical points to
    the es-CO URL and hreflang lists only the locales that exist.
  - API `sitemap-entries` (properties, blog) return the available locales; the sitemap lists a
    locale URL only when that translation exists and emits `alternates.languages`.
  - `/en` and `/es` redirect permanently to `/en-US` and `/es-CO`.
- [x] T2 Crawl resilience and hygiene. Route: delegated writer.
  - Detail fetchers return "not found" only on HTTP 404; any other failure throws so the page
    answers 5xx instead of 404.
  - Admin: `noindex, nofollow` metadata plus `X-Robots-Tag` header on `/admin` and `/api`.
  - Revalidation route: no default secret outside development.
  - `/proyectos` and `/calculadora-credito`: `noindex, follow`, removed from the sitemap.
- [x] T3 Titles, entity and property schema. Route: delegated writer.
  - Single brand constant; title template so every public page ends with the brand once.
  - Property JSON-LD: correct type mapping, bedrooms, bathrooms, floor size, `url`; breadcrumb
    JSON-LD matches the visible breadcrumb.
  - Twitter card and Open Graph on the public pages that lack them.
  - Spanish copy normalised to tuteo.

## Acceptance criteria
- `/en-US/...` pages with an English translation canonicalise to themselves; pages without one
  canonicalise to es-CO and are absent from the en-US sitemap entries.
- No `localhost` URL can reach the sitemap, robots or metadata in a production build.
- An API 5xx on a detail page does not produce a 404.
- `/admin/login` responds with `X-Robots-Tag: noindex`.
- Every public page title ends with `ALTiora Inmobiliaria` exactly once.
- A house listing emits `House` (or the correct type for its property type), with bedrooms,
  bathrooms and floor size taken from the property data.

## Checks (run at each task closure)
- `npm run test --workspace=apps/web`
- `npm test --workspace=apps/api`
- `npm run typecheck --workspace=apps/web` and `--workspace=apps/api`
- `npm run lint`
- `npm run format:check`
- `npm run build`

## Delivery
- Forecast: about 650 authored changed lines across T1 to T3, above the 400-line review budget.
- Each task closes with its own work-unit commit, so each commit is a ready PR slice.
- Chain strategy (stacked to main or one feature branch) is not chosen yet: PR creation is the
  user's decision and is asked at close.
- Review: receipt-driven development is off globally (`gentle-ai review mode status`), so no
  native review is started.

## Progress
- 2026-10-05: feature document created; worktree branch `worktree-seo-stage-1-indexing` from
  `main` at `ada7ac1`.

## Verification evidence
### T1 (2026-10-05), commit fb3dd5e
- `npm run test --workspace=apps/web`: 4 files, 29 tests passed (RED observed first for each new module and for the legacy-entry fallback).
- `npm test --workspace=apps/api`: 1 suite, 4 tests passed.
- `npm run typecheck` in both apps: clean. `npm run lint`: clean.
- `npm run format:check`: fails on this Windows checkout because the working tree is CRLF (`autocrlf=true`) and Prettier expects LF; with `--end-of-line auto` the files created in T1 pass. Not caused by T1.
- `npm run build`: API build passed; web build compiled, linted and typechecked, then failed prerendering `/sitemap.xml` with ECONNREFUSED because no API was reachable. `main` makes the same build-time calls, so the production build is NOT confirmed end to end here.
- Not exercised against a running server: the `/en` and `/es` redirects (unit-tested rules only).
- Decisions: redirects live in `next.config.ts` (applied before the next-intl middleware); a canonical override applies only when it belongs to the requested locale; sitemap entries without `locales` (older API) list es-CO only, so web can deploy before the API.

### T2 (2026-10-05), commit e35965c
- `npm run test --workspace=apps/web`: 8 files, 52 tests passed (RED observed first for the typed API error, both detail fetchers, the revalidation-secret helper and the header rules).
- `npm test --workspace=apps/api`: 1 suite, 4 tests passed. Typecheck in both apps and `npm run lint`: clean. Prettier (`--end-of-line auto`) on the 15 touched files: clean.
- Not run: `npm run build` (needs a reachable API, see T1). Not exercised against a running server: the 5xx status on an API failure, the `X-Robots-Tag` header.
- No `error.tsx` or `global-error.tsx` exists under `apps/web/app`, so a thrown fetch error uses the default Next error response (500, unbranded).
- Deploy prerequisite: `REVALIDATE_SECRET` must be set in the web Worker. The API still defaults to `dev-revalidate-secret` (`web-revalidation.service.ts:27`); if production relied on that default on both sides, push revalidation is rejected after this change until the variable is set on both. Content still refreshes through the 60 s fetch revalidation.

### T3 (2026-10-05)
- `npm run test --workspace=apps/web`: 13 files, 83 tests passed (RED observed first for the brand/title helper, the schema-type mapping, the property JSON-LD builder, the breadcrumb builder and the social-metadata helper).
- `npm test --workspace=apps/api`: 1 suite, 4 tests passed. Typecheck in both apps and `npm run lint`: clean.
- Search for hand-written brand suffixes in `apps/web/app` and `apps/web/components`: only the intentional admin title template remains.
- Not run: `npm run build`. Not checked in a browser: the rendered titles, the JSON-LD output and the new breadcrumb levels.
- Finding: the type mapping in code was already correct (`casa` to `House`). The production listing titled "Casa" that emits `Apartment` is stored with the apartment property type: a data fix in the admin, not code.
- Parent follow-up on the writer output: the city and blog post breadcrumbs gained a home level, and the blog post breadcrumb gained the post title, both visibly and in JSON-LD (the brief asks for `Inicio > ...`; a one-item list is not eligible for the breadcrumb rich result). Blog breadcrumb CSS aligned with the city page.
- Land and other non-residential types map to schema.org `Place`, without bedrooms, bathrooms or floor size. No lot-size property was added.
- Prose that mentions "Altiora" inside descriptions and FAQ answers was left as written.

## Pending decisions for the user
- Sold / paused / archived properties: keep 404, or serve a "sold" page.
- Chain strategy for the pull request(s); push and deploy.
- `REVALIDATE_SECRET` in production (see T2).
- A branded error page for API outages.

## Next step
User review of stage 1; then stage 2 (analytics).
