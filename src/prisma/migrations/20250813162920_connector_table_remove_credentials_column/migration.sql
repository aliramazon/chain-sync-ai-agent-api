/*
  Warnings:

  - You are about to drop the column `credentials` on the `Connector` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Connector" DROP COLUMN "credentials";
