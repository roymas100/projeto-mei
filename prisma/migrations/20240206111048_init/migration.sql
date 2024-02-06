-- CreateEnum
CREATE TYPE "COMPANY_ROLE" AS ENUM ('ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "Recurrency_type" AS ENUM ('DAY_OF_THE_WEEK', 'DATE', 'INTERVAL_OF_DATES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "has_confirmed_phone" BOOLEAN NOT NULL DEFAULT false,
    "confirmation_token" INTEGER,
    "token_expiration" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "service_rules" TEXT,
    "cancellation_grace_time" TEXT NOT NULL DEFAULT '00:60:00',

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_company" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" "COMPANY_ROLE" NOT NULL DEFAULT 'EMPLOYEE',

    CONSTRAINT "User_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointments" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "cancellation_url" TEXT,
    "user_company_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule_rules" (
    "id" TEXT NOT NULL,
    "user_companyId" TEXT NOT NULL,
    "recurrency_type" "Recurrency_type" NOT NULL,
    "dates" TEXT NOT NULL,
    "recurrency_intervals" TEXT NOT NULL,
    "start_of_shift" TEXT NOT NULL,
    "end_of_shift" TEXT NOT NULL,
    "duration_per_appointment" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,

    CONSTRAINT "Schedule_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- AddForeignKey
ALTER TABLE "User_company" ADD CONSTRAINT "User_company_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_company" ADD CONSTRAINT "User_company_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_user_company_id_fkey" FOREIGN KEY ("user_company_id") REFERENCES "User_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_rules" ADD CONSTRAINT "Schedule_rules_user_companyId_fkey" FOREIGN KEY ("user_companyId") REFERENCES "User_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
