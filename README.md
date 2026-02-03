# OpsFlow ERP API

Standalone NestJS REST API for the Transport Management System. It **consumes** an existing database and uses Supabase only for authentication and JWT verification.

**Constraints:**
- This repo does **not** own database schema or migrations (those live in **cargo-erp**).
- Prisma client is used only to read/write data. Do not run `prisma migrate` or create new migrations here.
- All tenant-scoped access uses `tenantId` from the authenticated user context (`X-Tenant-Id` header + membership check).
- **Superadmin** (JWT `app_metadata.global_role === 'SUPERADMIN'`) is not tenant-bound: `X-Tenant-Id` is optional; when provided, the superadmin acts in that tenant’s context.

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Generate Prisma Client** (schema is kept in sync with cargo-erp; no migrations run here):
   ```bash
   pnpm prisma:generate
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3001` (or the port in `.env`).

## API Endpoints

All routes are prefixed with `/api`:

- `GET /api/health` - Health check
- `GET /api/tenants` - List user's tenants (requires auth)
- `GET /api/auth/me` - Get current user/tenant (requires auth + X-Tenant-Id header)
- `GET /api/transport/orders` - List transport orders
- `POST /api/transport/orders` - Create transport order
- `GET /api/transport/trips` - List trips
- `POST /api/transport/trips` - Create trip
- And more...

## Environment Variables

See `.env.example` for required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_PROJECT_URL` or `SUPABASE_PROJECT_REF` - Supabase project reference
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

**Optional:**
- `PORT` - Server port (default: 3001)
- `WEB_APP_URL` - Frontend URL for CORS (default: http://localhost:3000)

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start:prod` - Run production build
- `pnpm prisma:generate` - Generate Prisma Client (run after schema changes from cargo-erp)
- `pnpm prisma:studio` - Open Prisma Studio
- `pnpm prisma:seed` - Seed database (requires SUPABASE_USER_EMAIL env var)

**Note:** Do not run `prisma migrate` in this repo; schema and migrations are owned by cargo-erp.

## Project Structure

```
├── prisma/           # Prisma schema (synced with cargo-erp); client only, no migrations from this repo
│   ├── schema.prisma
│   ├── migrations/   # Existing migration history (apply in cargo-erp)
│   └── seed.ts
├── src/              # NestJS application source
│   ├── auth/         # Authentication module
│   ├── health/       # Health check module
│   ├── tenants/      # Tenant management
│   ├── transport/    # Transport business logic
│   ├── prisma/       # Prisma service/module
│   ├── app.module.ts
│   └── main.ts       # Application entry point
├── .env.example      # Environment variables template
├── nest-cli.json     # NestJS CLI configuration
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## Migration from Monorepo

See `MIGRATION_INSTRUCTIONS.md` for detailed instructions on moving this code to a new repository.

## License

Private - Internal use only.
