# seo-category-pages

## Objective
Give each real search intent ("casas en venta en Cartago", "apartamentos en arriendo en
Cartago", "lotes en venta en Cartago") its own indexable landing page, generated from the live
inventory, with internal links and structured data. Stage 3 of the SEO / AEO / GEO programme.

## Problem / why
Filters on `/propiedades` are query parameters that all canonicalise to the unfiltered listing,
so no URL can rank for a type-plus-operation-plus-city query. The only local landing page is the
city page. Answer engines also have no page that states, from real data, how many listings of a
kind exist in a city and in which price range.

## Scope
- New public route `apps/web/app/(public)/[locale]/ciudades/[ciudad]/[categoria]/page.tsx`,
  for example `/es-CO/ciudades/cartago-valle-del-cauca/casas-en-venta`.
- `apps/api`: a public facets endpoint with counts and price range per city, property type and
  operation, over public properties only.
- `packages/shared-types`: the facet DTO.
- `apps/web`: category slug helpers, sitemap entries, internal links from the city page, the
  property detail page and the listing page; `llms.txt`.

## Design decisions
- Category pages hang under the city (`/ciudades/{city}/{category}`), not under `/propiedades`,
  because `/propiedades/[slug]` is already the property detail route and because the query is
  local. With one city, a city-less category page would duplicate the city one.
- A category slug is `{type-plural}-en-{venta|arriendo}`. Plurals come from a fixed map keyed by
  the property-type slug (casa, apartamento, lote, finca, local-comercial). A type that is not in
  the map gets no category page.
- A category page exists only when it has at least one public property. Otherwise it answers 404
  and is absent from the sitemap and from every link. The threshold is one named constant.
- Every number shown (count, lowest and highest price) comes from the live inventory. No market
  statistics, neighbourhood claims or prose that the data does not support.
- URL slugs stay in Spanish for both locales, like the existing routes. Copy is localised.

## Constraints
- Keep the visual identity: reuse the city page layout, the property card and existing styles.
- No invented data. Brand name `ALTiora Inmobiliaria`; Spanish copy in Colombian tuteo.
- The web app must keep working if it is deployed before the API has the facets endpoint.
- Commits are work units on this branch. Push, PR, merge and deploy stay with the user.

## TDD
- Mode: strict (source: user global instructions).
- Runners: `npm run test --workspace=apps/web` (Vitest), `npm test --workspace=apps/api` (Jest).

## Tasks
- [x] T1 Facets endpoint and category helpers. Route: delegated writer.
  - API `GET /properties/facets`: per city, type and operation, the count and min/max price of
    public properties, with currency.
  - Web: pure helpers to build and parse a category slug, and to pick the categories that exist
    for a city from the facets.
- [x] T2 Category landing page. Route: delegated writer.
  - Server-rendered page with H1, a short factual summary built from the facets, the property
    grid, breadcrumb (Inicio > Zonas > city > category), contact call to action.
  - Metadata through the shared helpers; `ItemList` and `BreadcrumbList` JSON-LD; a short FAQ
    with `FAQPage` JSON-LD whose answers are computed from the inventory.
- [x] T3 Internal linking, sitemap and llms.txt. Route: delegated writer.
  - City page links to its categories; property detail links to its category; the listing page
    links to the categories.
  - Sitemap lists existing categories for both locales with alternates.
  - `/llms.txt` describing the business and its key URLs from existing, real data.

## Acceptance criteria
- `/es-CO/ciudades/cartago-valle-del-cauca/casas-en-venta` renders the houses for sale in
  Cartago, with a self-referencing canonical, hreflang and a title that states type, operation
  and city.
- A category with no public property answers 404 and is not in the sitemap.
- Counts and prices on the page equal the ones returned by the API.
- No existing URL changes.

## Checks (run at each task closure)
- `npm run test --workspace=apps/web`, `npm test --workspace=apps/api`
- `npm run typecheck` in both apps, `npm run lint`
- `npx prettier --check --end-of-line auto` on touched files
- Web build against the public API (`NEXT_PUBLIC_API_URL=https://altiora-api.onrender.com`)

## Delivery
- Forecast: about 700 authored changed lines including tests, above the 400-line budget. One
  work-unit commit per task; chain strategy asked at close.
- Review: receipt-driven development is off globally, so no native review is started.

## Progress
- 2026-10-05: document created on branch `feat/seo-category-pages` from `main` at `350ea4b`.

## Verification evidence
### T1 8f7c395, T2 5d217f3, T3 a2e0a7d (2026-10-05)
- `npm run test --workspace=apps/web`: 17 files, 148 tests passed. `npm test --workspace=apps/api`: 2 suites, 10 tests passed. RED was observed first for every new pure module.
- Typecheck in both apps and `npm run lint`: clean. Prettier (`--end-of-line auto`) on touched files: clean.
- Web build against the public API: passed. Production had no facets endpoint at that time, so the build also exercised the no-categories path.
- NOT verified: the category page rendered against a live facets endpoint. It needs the API deployed with the endpoint first.
- Decisions: one facet per city, type, operation and currency, so prices in different currencies are never merged; the facets fetcher returns an empty list on any failure, so a brief API error removes category links and sitemap entries until the next revalidation; the category page lists at most 48 properties with no pagination; `llms.txt` is in Spanish with es-CO URLs.
- Authored size: 27 files, +1670 / -9 including tests.

## Next step
User: open and merge the PR (the API deploys from main), then deploy the web app and verify the category pages live.
