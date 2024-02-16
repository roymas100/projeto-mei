import type { Prisma, $Enums, Schedule } from "@prisma/client";
import type { ScheduleRepository, ScheduleTransactionUpdate } from "../schedule.repository";
import { prisma } from "../../setups/prisma";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class PrismaScheduleRepository implements ScheduleRepository {
    transactionUpdate(payload: ScheduleTransactionUpdate[]): Promise<Schedule[]> {
        return prisma.$transaction(payload.map(item => prisma.schedule.update({
            where: item.where,
            data: item.data
        })))
    }

    find(scheduleArgs: Prisma.ScheduleFindFirstArgs<DefaultArgs>): Promise<Schedule[]> {
        return prisma.schedule.findMany(scheduleArgs)
    }

    create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule> {
        return prisma.schedule.create({ data })
    }

    patch(id: string, schedule: Partial<Schedule>): Promise<Schedule> {
        return prisma.schedule.update({
            where: {
                id
            },
            data: schedule
        })
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
        return prisma.schedule.delete({
            where: {
                id
            }
        })
    }
}