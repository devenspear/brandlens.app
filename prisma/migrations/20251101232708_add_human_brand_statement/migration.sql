-- AlterTable: Add humanBrandStatement column to Project table
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "humanBrandStatement" TEXT;
