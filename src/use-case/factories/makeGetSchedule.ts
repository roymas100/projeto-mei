import { PrismaScheduleRepository } from "../../repositories/prisma/schedule.prisma";
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { GetSchedule } from "../schedule/get-schedule";

export function makeGetSchedule() {
    const userCompanyRepository = new PrismaUserCompanyRepository()
    const scheduleRepository = new PrismaScheduleRepository()
    const sut = new GetSchedule({
        scheduleRepository,
        userCompanyRepository
    })

    return sut;
}