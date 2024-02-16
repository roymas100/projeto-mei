import { PrismaScheduleRepository } from "../../repositories/prisma/schedule.prisma";
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { AddSchedule } from "../schedule/add-schedule";

export function makeAddSchedule() {
    const userCompanyRepository = new PrismaUserCompanyRepository()
    const scheduleRepository = new PrismaScheduleRepository()
    const sut = new AddSchedule({
        scheduleRepository,
        userCompanyRepository
    })

    return sut;
}