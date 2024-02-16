import type { Prisma, Schedule } from "@prisma/client";

export interface ScheduleTransactionUpdate {
    where: Prisma.ScheduleWhereUniqueInput,
    data: Partial<Schedule>
}

export interface ScheduleRepository {
    create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule>
    patch(id: string, schedule: Partial<Schedule>): Promise<Schedule>
    transactionUpdate(payload: ScheduleTransactionUpdate[]): Promise<Schedule[]>
    findById(schedule_id: string): Promise<Schedule | null>
    findFirst(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule | null>
    find(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule[]>
    delete(id: string): Promise<Schedule>
}