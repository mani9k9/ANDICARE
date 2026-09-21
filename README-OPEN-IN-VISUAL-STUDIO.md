# AnDiCare workspace

This folder contains the complete AnDiCare customer app, admin panel, API server, database schema, shared API contract, and generated API client.

## Open locally

1. Extract the ZIP.
2. Open the extracted folder in Visual Studio Code or Visual Studio.
3. Install Node.js 20+ and pnpm.
4. Install dependencies:

   ```bash
   pnpm install
   ```

5. Set `DATABASE_URL` to a PostgreSQL database before starting the API server.
6. Apply the database schema:

   ```bash
   pnpm --filter @workspace/db run push
   ```

## Run the services

Run the API server:

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

Run the web app in a second terminal:

```bash
PORT=26118 BASE_PATH=/ pnpm --filter @workspace/andicare run dev
```

The AnDiCare customer app is available at `http://localhost:26118`.

The admin panel is available at `/admin`.

For the development workspace, the demo admin access is:

- Email: `admin@andicare.local`
- Password: `andicare-admin`

Replace the demo admin credentials with `ADMIN_EMAIL` and `ADMIN_PASSWORD` before publishing.

## Folder map

- `artifacts/andicare` — React/Vite customer app and admin panel
- `artifacts/api-server` — Express API server
- `lib/db` — Drizzle/PostgreSQL schema
- `lib/api-spec` — OpenAPI source contract
- `lib/api-client-react` — generated React API client
- `lib/api-zod` — generated server validation schemas
- `scripts` — workspace utility scripts

The archive intentionally excludes `node_modules`, build output, TypeScript caches, Git metadata, platform skills, and secrets. Run `pnpm install` after extracting it.