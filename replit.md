# AnDiCare

AnDiCare is a responsive healthcare and diagnostics booking frontend for discovering lab tests, health packages, home collection, home ECG, reports, and personal health records.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/andicare/src/App.tsx` — page routes, local catalogue data, reusable shell, and product interactions.
- `artifacts/andicare/src/index.css` — AnDiCare design tokens and responsive visual system.
- `artifacts/andicare/public/manifest.webmanifest` — install metadata for the progressive web app.
- `artifacts/andicare/public/sw.js` and `offline.html` — safe static caching and offline fallback.
- `artifacts/api-server` — shared Express API service, available for future catalogue, booking, and account endpoints.

## Architecture decisions

- The first release keeps business data in typed local sample structures so the complete booking and discovery experience can be reviewed before connecting production APIs.
- Client-side routes mirror the planned SEO-friendly URL structure for tests, packages, service areas, and account surfaces.
- Offline support is intentionally limited to static app-shell experiences; booking, report, and availability actions still require a connection.

## Product

Users can browse and filter tests, compare packages and partner providers, book home collection or ECG services, step through a checkout prototype, view booking/report/diary surfaces, manage family members, contact a concierge, and explore service areas and future services.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server workflow is not required for the current frontend-only prototype.
- Keep accreditation claims attached to partner laboratory data; AnDiCare itself is not represented as NABL accredited.
- Future services remain informational and non-bookable until activated.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
