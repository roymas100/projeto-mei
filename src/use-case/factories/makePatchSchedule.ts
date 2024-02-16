import { PrismaScheduleRepository } from "../../repositories/prisma/schedule.prisma";
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { PatchSchedule } from "../schedule/patch-schedule";

export function makePatchSchedule() {
    const userCompanyRepository = new PrismaUserCompanyRepository()
    const scheduleRepository = new PrismaScheduleRepository()
    const sut = new PatchSchedule({
        scheduleRepository,
        userCompanyRepository
    })

    return sut;
}