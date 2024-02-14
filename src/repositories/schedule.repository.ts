import type { Prisma, Schedule } from "@prisma/client";

export interface PatchMany extends Partial<Schedule> {
    id: string
}

export interface ScheduleRepository {
    create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule>
    update(id: string, data: Partial<Schedule>): Promise<Schedule>
    patchMany(schedules: PatchMany[]): Promise<Schedule[]>
    findById(schedule_id: string): Promise<Schedule | null>
    findFirst(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule | null>
}