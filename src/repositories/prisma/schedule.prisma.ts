import type { Prisma, $Enums, Schedule } from "@prisma/client";
import type { PatchMany, ScheduleRepository } from "../schedule.repository";
import { prisma } from "../../setups/prisma";

export class PrismaScheduleRepository implements ScheduleRepository {
    create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule> {
        throw new Error("Method not implemented.");
    }
    update(id: string, data: Partial<Schedule>): Promise<Schedule> {
        throw new Error("Method not implemented.");
    }
    patchMany(schedules: PatchMany[]): Promise<Schedule[]> {
        throw new Error("Method not implemented.");
    }
    findById(schedule_id: string): Promise<Schedule | null> {
        throw new Error("Method not implemented.");
    }
    findFirst(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule | null> {
        return prisma.schedule.findFirst(scheduleArgs)
    }

}