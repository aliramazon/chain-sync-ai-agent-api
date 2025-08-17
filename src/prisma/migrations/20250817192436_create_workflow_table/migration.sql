/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Connector` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Connector" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "public"."workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workflow_steps" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "externalId" TEXT,
    "configuration" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_steps_workflowId_stepOrder_key" ON "public"."workflow_steps"("workflowId", "stepOrder");

-- AddForeignKey
ALTER TABLE "public"."workflow_steps" ADD CONSTRAINT "workflow_steps_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_steps" ADD CONSTRAINT "workflow_steps_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "public"."ActionCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workflow_steps" ADD CONSTRAINT "workflow_steps_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "public"."Connector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
