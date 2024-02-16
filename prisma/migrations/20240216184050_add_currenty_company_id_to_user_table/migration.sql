/*
  Warnings:

  - Changed the type of `recurrency_type` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RECURRENCY_TYPE" AS ENUM ('DATE', 'INTERVAL_OF_DATES');

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "recurrency_type",
ADD COLUMN     "recurrency_type" "RECURRENCY_TYPE" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "current_company_id" TEXT;

-- DropEnum
DROP TYPE "Recurrency_type";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_current_company_id_fkey" FOREIGN KEY ("current_company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
