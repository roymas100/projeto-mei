import { PrismaScheduleRepository } from "../../repositories/prisma/schedule.prisma";
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { GetAvailableTimes } from "../get-available-times";

export function makeGetAvailableTimes() {
    const userCompanyRepository = new PrismaUserCompanyRepository()
    const scheduleRepository = new PrismaScheduleRepository()
    const sut = new GetAvailableTimes({
        scheduleRepository,
        userCompanyRepository
    })

    return sut;
}