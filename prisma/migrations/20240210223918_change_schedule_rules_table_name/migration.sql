/*
  Warnings:

  - You are about to drop the `Schedule_rules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schedule_rules" DROP CONSTRAINT "Schedule_rules_user_company_user_id_user_company_company_i_fkey";

-- DropTable
DROP TABLE "Schedule_rules";

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "recurrency_type" "Recurrency_type" NOT NULL,
    "dates" TEXT NOT NULL,
    "recurrency_intervals" TEXT NOT NULL,
    "start_of_shift" TEXT NOT NULL,
    "end_of_shift" TEXT NOT NULL,
    "duration_per_appointment" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "user_company_user_id" TEXT NOT NULL,
    "user_company_company_id" TEXT NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_user_company_user_id_user_company_company_id_fkey" FOREIGN KEY ("user_company_user_id", "user_company_company_id") REFERENCES "User_company"("user_id", "company_id") ON DELETE RESTRICT ON UPDATE CASCADE;
