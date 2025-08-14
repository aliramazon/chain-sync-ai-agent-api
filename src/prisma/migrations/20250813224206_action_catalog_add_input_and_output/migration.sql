/*
  Warnings:

  - You are about to drop the column `schemaJson` on the `ActionCatalog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ActionCatalog" DROP COLUMN "schemaJson",
ADD COLUMN     "schemaInput" JSONB,
ADD COLUMN     "schemaOutput" JSONB;
