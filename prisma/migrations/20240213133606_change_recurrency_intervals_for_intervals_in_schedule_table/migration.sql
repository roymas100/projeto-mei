/*
  Warnings:

  - You are about to drop the column `recurrency_intervals` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `intervals` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "recurrency_intervals",
ADD COLUMN     "intervals" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
