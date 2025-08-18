/*
  Warnings:

  - You are about to drop the column `configuration` on the `WorkflowStep` table. All the data in the column will be lost.
  - Made the column `externalId` on table `WorkflowStep` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."WorkflowStep" DROP COLUMN "configuration",
ADD COLUMN     "dependsOn" JSONB,
ADD COLUMN     "description" TEXT,
ALTER COLUMN "externalId" SET NOT NULL;
