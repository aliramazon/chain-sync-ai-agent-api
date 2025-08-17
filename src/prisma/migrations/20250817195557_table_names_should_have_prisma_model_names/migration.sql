/*
  Warnings:

  - You are about to drop the `workflow_steps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `workflows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."workflow_steps" DROP CONSTRAINT "workflow_steps_actionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."workflow_steps" DROP CONSTRAINT "workflow_steps_connectorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."workflow_steps" DROP CONSTRAINT "workflow_steps_workflowId_fkey";

-- DropTable
DROP TABLE "public"."workflow_steps";

-- DropTable
DROP TABLE "public"."workflows";

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "externalId" TEXT,
    "configuration" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStep_workflowId_stepOrder_key" ON "public"."WorkflowStep"("workflowId", "stepOrder");

-- AddForeignKey
ALTER TABLE "public"."WorkflowStep" ADD CONSTRAINT "WorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowStep" ADD CONSTRAINT "WorkflowStep_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "public"."ActionCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowStep" ADD CONSTRAINT "WorkflowStep_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "public"."Connector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
