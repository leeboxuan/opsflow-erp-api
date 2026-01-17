-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Draft', 'Confirmed', 'Planned', 'Dispatched', 'InTransit', 'Delivered', 'Closed', 'Cancelled');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('Draft', 'Planned', 'Dispatched', 'InTransit', 'Delivered', 'Closed', 'Cancelled');

-- CreateEnum
CREATE TYPE "StopType" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "PodStatus" AS ENUM ('Pending', 'Completed', 'Failed');

-- CreateTable
CREATE TABLE "transport_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerRef" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'Draft',
    "pickupWindowStart" TIMESTAMP(3),
    "pickupWindowEnd" TIMESTAMP(3),
    "deliveryWindowStart" TIMESTAMP(3),
    "deliveryWindowEnd" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'Draft',
    "plannedStartAt" TIMESTAMP(3),
    "plannedEndAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "StopType" NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "plannedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transportOrderId" TEXT,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pods" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stopId" TEXT NOT NULL,
    "status" "PodStatus" NOT NULL DEFAULT 'Pending',
    "signedBy" TEXT,
    "signedAt" TIMESTAMP(3),
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transport_orders_tenantId_status_idx" ON "transport_orders"("tenantId", "status");

-- CreateIndex
CREATE INDEX "transport_orders_tenantId_createdAt_idx" ON "transport_orders"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "trips_tenantId_status_idx" ON "trips"("tenantId", "status");

-- CreateIndex
CREATE INDEX "trips_tenantId_plannedStartAt_idx" ON "trips"("tenantId", "plannedStartAt");

-- CreateIndex
CREATE INDEX "stops_tenantId_tripId_idx" ON "stops"("tenantId", "tripId");

-- CreateIndex
CREATE INDEX "stops_tenantId_transportOrderId_idx" ON "stops"("tenantId", "transportOrderId");

-- CreateIndex
CREATE INDEX "pods_tenantId_stopId_idx" ON "pods"("tenantId", "stopId");

-- CreateIndex
CREATE INDEX "pods_tenantId_status_idx" ON "pods"("tenantId", "status");

-- CreateIndex
CREATE INDEX "event_logs_tenantId_entityType_entityId_idx" ON "event_logs"("tenantId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "event_logs_tenantId_createdAt_idx" ON "event_logs"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "transport_orders" ADD CONSTRAINT "transport_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_transportOrderId_fkey" FOREIGN KEY ("transportOrderId") REFERENCES "transport_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pods" ADD CONSTRAINT "pods_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pods" ADD CONSTRAINT "pods_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "stops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
