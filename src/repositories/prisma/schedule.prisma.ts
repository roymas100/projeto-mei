import type { Prisma, $Enums, Schedule } from "@prisma/client";
import type { PatchMany, ScheduleRepository } from "../schedule.repository";
import { prisma } from "../../setups/prisma";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class PrismaScheduleRepository implements ScheduleRepository {
    find(scheduleArgs: Prisma.ScheduleFindFirstArgs<DefaultArgs>): Promise<Schedule[]> {
        throw new Error("Method not implemented.");
    }
    create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule> {
        throw new Error("Method not implemented.");
    }
    patch(id: string, schedule: PatchMany): Promise<Schedule> {
        throw new Error("Method not implemented.");
    }
    patchMany(schedules: PatchMany[]): Promise<Schedule[]> {
        throw new Error("Method not implemented.");
    }
    findById(schedule_id: string): Promise<Schedule | null> {
        return prisma.schedule.findUnique({
            where: {
                id: schedule_id
            }
        })
    }
    findFirst(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule | null> {
        return prisma.schedule.findFirst(scheduleArgs)
    }
    delete(id: string): Promise<Schedule> {
        throw new Error("Method not implemented.");
    }
}