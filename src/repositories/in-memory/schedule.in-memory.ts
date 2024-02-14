import type { $Enums, Prisma, Schedule } from "@prisma/client";
import type { PatchMany, ScheduleRepository } from "../schedule.repository";
import { randomUUID } from "crypto";
import { customOrderBy } from '../utils/orderBy'
import { customWhere } from "../utils/where";

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
    async update(id: string, data: Partial<Schedule>): Promise<Schedule> {
        const scheduleRulesIndex = this.items.findIndex(item => item.id === id)
        const scheduleRules = this.items[scheduleRulesIndex]

        scheduleRules.recurrency_type

        const { created_at, id: ommited, ...newScheduleData } = data
        newScheduleData.recurrency_type

        newScheduleData.recurrency_type
        const newSchedule: Schedule = {
            ...scheduleRules,
            ...newScheduleData,
        }

        this.items[scheduleRulesIndex] = newSchedule

        return newSchedule
    }

    patchMany(schedules: PatchMany[]): Promise<Schedule[]> {
        throw new Error("Method not implemented.");
    }

    async findById(schedule_id: string): Promise<Schedule | null> {
        return this.items.find(item => item.id === schedule_id) ?? null
    }

    async findFirst(scheduleArgs: Prisma.ScheduleFindFirstArgs): Promise<Schedule | null> {
        const { orderBy: order, where } = scheduleArgs

        return customWhere<Schedule, Prisma.ScheduleWhereInput>(customOrderBy<Schedule, Prisma.ScheduleOrderByWithRelationInput>(this.items, order), where) ?? null
    }
}