/*
  Warnings:

  - The values [DAY_OF_THE_WEEK] on the enum `Recurrency_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Recurrency_type_new" AS ENUM ('DATE', 'INTERVAL_OF_DATES');
ALTER TABLE "Schedule" ALTER COLUMN "recurrency_type" TYPE "Recurrency_type_new" USING ("recurrency_type"::text::"Recurrency_type_new");
ALTER TYPE "Recurrency_type" RENAME TO "Recurrency_type_old";
ALTER TYPE "Recurrency_type_new" RENAME TO "Recurrency_type";
DROP TYPE "Recurrency_type_old";
COMMIT;
