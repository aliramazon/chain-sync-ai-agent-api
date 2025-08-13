-- CreateEnum
CREATE TYPE "public"."ConnectorStatus" AS ENUM ('not_connected', 'connected', 'error');

-- CreateTable
CREATE TABLE "public"."Connector" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "public"."ConnectorStatus" NOT NULL DEFAULT 'not_connected',
    "credentials" JSONB,
    "lastError" TEXT,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Connector_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connector_key_key" ON "public"."Connector"("key");
