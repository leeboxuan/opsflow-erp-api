-- CreateTable
CREATE TABLE "driver_location_latest" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "driverUserId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "driver_location_latest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_location_latest_tenantId_updatedAt_idx" ON "driver_location_latest"("tenantId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "driver_location_latest_tenantId_driverUserId_key" ON "driver_location_latest"("tenantId", "driverUserId");

-- AddForeignKey
ALTER TABLE "driver_location_latest" ADD CONSTRAINT "driver_location_latest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
