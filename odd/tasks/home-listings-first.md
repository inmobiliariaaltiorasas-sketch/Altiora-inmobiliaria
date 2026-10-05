# home-listings-first

## Objective
Recompose the public home so real listings show in the first screen: header → compact hero →
overlapping horizontal search bar → featured properties → property grid.

## Problem / why
Hero and search form used most of the first viewport; listings sat far below. Commercial
priority is that a visitor sees real properties (photo, location, features, price) without
filtering or long scrolling.

## Scope
- `apps/web/components/sections/Hero.tsx`, `Hero.module.css`
- `apps/web/components/blocks/PropertySearchForm.tsx`, `.module.css` (hero variant only)
- `apps/web/components/blocks/PropertyCard.tsx`, `.module.css`
- `apps/web/app/(public)/[locale]/page.tsx`, `page.module.css`

## Constraints
- Keep Altiora identity (navy, gold, ivory, serif titles). Sizes and layout only.
- Keep every existing behavior: routes, filters, operation, price range, bedrooms, favorites,
  ES/EN copy, API data. No mock or hardcoded properties.
- No commit, push or deploy without explicit user authorization per step.
- TDD: no test runner exists in `apps/web`; checks are prettier, eslint, tsc and the user's
  visual review in the browser.

## Tasks
- [x] T1 Hero compact (320–380px desktop, lower on mobile) + requested copy. Route: inline.
- [x] T2 Search bar: one horizontal row (location, type, price range, search); operation and
      bedrooms move into a "More filters" popover. Route: inline.
- [x] T3 Featured section copy and spacing right under the search bar. Route: inline.
- [x] T4 Property grid: fixed 3 / 2 / 1 columns, empty slots stay blank (user rejected the
      single wide card on 2026-10-05). Home cards use a `compact` variant; card footer puts
      price and "Ver detalles" on one row. Route: inline.
- [x] T4b Second pass after user feedback: hero lowered to clamp(12rem, 27vh, 16rem), trust
      line moved below the listings, tighter featured header, so the first card row fits in
      the first screen. Route: inline.
- [ ] T5 User visual review on desktop, tablet and mobile (localhost:3000).
- [ ] T6 Commit, push and deploy — pending user authorization.

## Route declaration
All tasks inline in the parent session: the files were already read and understood in this
session and the user asked for direct implementation.

## Verification evidence
- prettier / eslint / tsc: see session report.
- Local home renders with the new section order and classes.
- Headless Chrome screenshots at 1440x900, 1650x820, 1320x725, 820 and 500 px wide reviewed:
  at 1440x900 the whole first card (photo, title, location, features, price, button) is
  visible without scrolling; no horizontal overflow at 500 px.

## Delivery
Strategy: single-pr not applicable; repository works directly on `main`. Uncommitted.
