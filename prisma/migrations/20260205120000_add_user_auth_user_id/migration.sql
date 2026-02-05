-- Add authUserId to users: links Supabase Auth user (JWT sub, UUID) to internal user row (id is cuid).
-- Enables mapping after login without using email as primary identifier.
ALTER TABLE "users" ADD COLUMN     "authUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_authUserId_key" ON "users"("authUserId");

-- CreateIndex
CREATE INDEX "users_authUserId_idx" ON "users"("authUserId");
