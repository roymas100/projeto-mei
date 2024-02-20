/*
  Warnings:

  - You are about to drop the `Appointments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointments" DROP CONSTRAINT "Appointments_user_company_user_id_user_company_company_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointments" DROP CONSTRAINT "Appointments_user_id_fkey";

-- DropTable
DROP TABLE "Appointments";

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "cancellation_url" TEXT,
    "user_id" TEXT NOT NULL,
    "user_company_user_id" TEXT NOT NULL,
    "user_company_company_id" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_user_company_user_id_user_company_company_id_fkey" FOREIGN KEY ("user_company_user_id", "user_company_company_id") REFERENCES "User_company"("user_id", "company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
