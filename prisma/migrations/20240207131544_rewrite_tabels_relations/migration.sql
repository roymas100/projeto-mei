/*
  Warnings:

  - You are about to drop the column `user_company_id` on the `Appointments` table. All the data in the column will be lost.
  - You are about to drop the column `user_companyId` on the `Schedule_rules` table. All the data in the column will be lost.
  - The primary key for the `User_company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User_company` table. All the data in the column will be lost.
  - Added the required column `user_company_company_id` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_company_user_id` to the `Appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_company_company_id` to the `Schedule_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_company_user_id` to the `Schedule_rules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointments" DROP CONSTRAINT "Appointments_user_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Schedule_rules" DROP CONSTRAINT "Schedule_rules_user_companyId_fkey";

-- AlterTable
ALTER TABLE "Appointments" DROP COLUMN "user_company_id",
ADD COLUMN     "user_company_company_id" TEXT NOT NULL,
ADD COLUMN     "user_company_user_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "cancellation_grace_time" SET DEFAULT '01:00:00',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Schedule_rules" DROP COLUMN "user_companyId",
ADD COLUMN     "user_company_company_id" TEXT NOT NULL,
ADD COLUMN     "user_company_user_id" TEXT NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User_company" DROP CONSTRAINT "User_company_pkey",
DROP COLUMN "id",
ALTER COLUMN "updated_at" DROP DEFAULT,
ADD CONSTRAINT "User_company_pkey" PRIMARY KEY ("user_id", "company_id");

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_user_company_user_id_user_company_company_id_fkey" FOREIGN KEY ("user_company_user_id", "user_company_company_id") REFERENCES "User_company"("user_id", "company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_rules" ADD CONSTRAINT "Schedule_rules_user_company_user_id_user_company_company_i_fkey" FOREIGN KEY ("user_company_user_id", "user_company_company_id") REFERENCES "User_company"("user_id", "company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
