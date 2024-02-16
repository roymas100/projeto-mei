import { PrismaScheduleRepository } from "../../repositories/prisma/schedule.prisma";
import { DeleteSchedule } from "../schedule/delete-schedule";

export function makeDeleteSchedule() {
    const scheduleRepository = new PrismaScheduleRepository()
    const sut = new DeleteSchedule({
        scheduleRepository,
    })

    return sut;
}