-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('trigger', 'action');

-- CreateTable
CREATE TABLE "public"."ActionCatalog" (
    "id" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "type" "public"."ActionType" NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "schemaJson" JSONB NOT NULL,
    "examples" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActionCatalog_key_key" ON "public"."ActionCatalog"("key");

-- AddForeignKey
ALTER TABLE "public"."ActionCatalog" ADD CONSTRAINT "ActionCatalog_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "public"."Connector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
