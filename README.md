# OpsFlow ERP Backend (API)

NestJS API service for OpsFlow ERP.  
**Database:** Supabase Postgres (set via `DATABASE_URL`)  
**Hosting:** Render (recommended)

## Local setup

```bash
pnpm install
# Create .env.local with your vars (see Environment variables below)
pnpm prisma:generate
pnpm dev
```

API runs on `http://localhost:3001` (or `PORT`).

## API docs (Swagger / OpenAPI)

- Swagger UI: `http://localhost:3001/api/docs`
- OpenAPI JSON: `http://localhost:3001/api/docs-json`

## Environment variables

Use `.env.local` for local development (the app loads `.env.local` then `.env`). On Render, set the same vars in the service **Environment** tab (see `render.yaml` for the list).

| Variable | Required | Where to get it |
|----------|----------|-----------------|
| `DATABASE_URL` | Yes | Supabase → Project Settings → Database → Connection string (Session mode pooler, port 5432) |
| `SUPABASE_PROJECT_URL` | Yes | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase → Project Settings → API → `service_role` secret |
| `SUPABASE_JWT_SECRET` | Optional | Supabase → Project Settings → API → JWT Secret (for legacy HS256 tokens) |
| `WEB_APP_URLS` | Recommended | Comma-separated CORS origins (e.g. `https://opsflow-erp-web.onrender.com`) |
| `PORT` | No | Render sets this automatically |

## Deploy to Render (quick)

`render.yaml` defines build, release, and start. No need to copy commands manually.

- **Build:** `pnpm install --frozen-lockfile && pnpm prisma:generate && pnpm build`
- **Start:** `pnpm start`

Set all env vars in Render dashboard (Environment) so they match your `.env.local` keys.

## Keeping code, Supabase, and Render aligned

1. **Supabase (one project)**  
   - **Database:** Use the same Postgres as `DATABASE_URL` (Supabase provides it).  
   - **Auth:** Same project → Project URL and Service Role Key are used by this API for JWT verification.

2. **Render**  
   - Env vars must match what the code expects (see table above).  
   - `DATABASE_URL` = Supabase session pooler.  
   - `SUPABASE_PROJECT_URL` + `SUPABASE_SERVICE_ROLE_KEY` = same Supabase project as DB.

3. **Local**  
   - `.env.local` should mirror Render (different values OK, same keys).

4. **Quick check**  
   - Health: `GET https://opsflow-erp-api.onrender.com/api/health` (or your Render URL).  
   - Swagger: `https://opsflow-erp-api.onrender.com/api/docs`.  
   - If auth fails, verify Supabase project URL and keys on Render match the project that owns the DB.

## Prisma and schema

- **Client generation:** `pnpm prisma:generate` (runs in build; uses `DATABASE_URL`).
- **Migrations:** Prisma migrations are **not** run via CLI against Supabase. Schema changes are applied via **Supabase SQL Editor** or by generating a SQL diff (e.g. `prisma migrate diff`) and running it in Supabase. The app uses `DATABASE_URL` (session pooler) only.
