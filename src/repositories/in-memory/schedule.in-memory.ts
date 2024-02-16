import type { $Enums, Prisma, Schedule } from "@prisma/client";
import type { ScheduleRepository, ScheduleTransactionUpdate } from "../schedule.repository";
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

    async transactionUpdate(payload: ScheduleTransactionUpdate[]): Promise<Schedule[]> {
        const schedules: Schedule[] = []
        for (const transationData of payload) {
            const scheduleIndex = this.items.findIndex(item => {
                let pass = true

                const where = transationData.where as Partial<Schedule>
                for (const key in where) {
                    pass = pass && item[key as keyof Schedule] === where[key as keyof Schedule]
                }

                return pass
            })

            if (scheduleIndex >= 0) {
                const schedule: Schedule = {
                    ...this.items[scheduleIndex],
                    ...transationData.data,
                    id: this.items[scheduleIndex].id,
                    created_at: this.items[scheduleIndex].created_at,
                }

                this.items[scheduleIndex] = schedule
                schedules.push(schedule)
            }
        }
        return schedules
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

    async delete(id: string): Promise<Schedule> {
        const index = this.items.findIndex(item => item.id === id)

        const [schedule] = this.items.slice(index, 1)

        return schedule
    }
}
