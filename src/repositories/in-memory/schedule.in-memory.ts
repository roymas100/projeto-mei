import type { Prisma, Schedule } from "@prisma/client";
import type { PatchMany, ScheduleRepository } from "../schedule.repository";
import { randomUUID } from "crypto";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { ArrayTools } from "../utils/ArrayTools";

export class InMemoryScheduleRepository implements ScheduleRepository {
    items: Schedule[] = []

    async create(data: Prisma.ScheduleUncheckedCreateInput): Promise<Schedule> {
        const schedule: Schedule = {
            id: randomUUID(),
            name: data.name,
            created_at: new Date(),
            recurrency_type: data.recurrency_type,
            dates: data.dates,
            updated_at: new Date(),
            deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
            duration_per_appointment: data.duration_per_appointment,
            start_of_shift: data.start_of_shift,
            end_of_shift: data.end_of_shift,
            priority: data.priority,
            intervals: data.intervals,
            user_company_company_id: data.user_company_company_id,
            user_company_user_id: data.user_company_user_id,
        }

        this.items.push(schedule)

        return schedule
    }

    async patch(id: string, scheduleData: Partial<Schedule>): Promise<Schedule> {
        const scheduleIndex = this.items.findIndex(item => item.id === id)

        const schedule: Schedule = {
            ...this.items[scheduleIndex],
            ...scheduleData,
            id,
            created_at: this.items[scheduleIndex].created_at,
        }

        this.items[scheduleIndex] = schedule

        return schedule
    }

    async patchMany(schedules: PatchMany[]): Promise<Schedule[]> {
        const newSchedules = []

        for (const scheduleData of schedules) {
            const id = scheduleData.id
            const scheduleIndex = this.items.findIndex(item => item.id === id)

            const schedule: Schedule = {
                ...this.items[scheduleIndex],
                ...scheduleData,
                id,
                created_at: this.items[scheduleIndex].created_at,
            }

            this.items[scheduleIndex] = schedule
            newSchedules.push(schedule)
        }

        return newSchedules
    }

    async find(scheduleArgs: Prisma.ScheduleFindFirstArgs<DefaultArgs>): Promise<Schedule[]> {
        const { orderBy, where, select } = scheduleArgs

        const item = new ArrayTools<Schedule>(this.items)

        return item.findMany({
            orderBy,
            select,
            where
        })
    }

    async findById(schedule_id: string): Promise<Schedule | null> {
        return this.items.find(item => item.id === schedule_id) ?? null
    }

    async findFirst(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule | null> {
        const { orderBy, where, select } = scheduleArgs

        const item = new ArrayTools<Schedule>(this.items)

        return item.findFirst({
            orderBy,
            select,
            where
        })
    }
}
