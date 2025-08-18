/*
  Warnings:

  - Made the column `dependsOn` on table `WorkflowStep` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `WorkflowStep` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."WorkflowStep" ALTER COLUMN "dependsOn" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
