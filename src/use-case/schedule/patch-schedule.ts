import type { $Enums, Schedule } from "@prisma/client";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import { checkDuration, checkFormatting, checkIntervals, checkRecurrencyType } from "./utils";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import { CompanyDoesNotExists } from "../errors/CompanyDoesNotExists.error";
import { ScheduleTypeError } from "../errors/ScheduleTypeError.error";

export class PatchSchedule {
    private scheduleRepository: ScheduleRepository
    private userCompanyRepository: UserCompanyRepository

    constructor({ scheduleRepository, userCompanyRepository }: { scheduleRepository: ScheduleRepository, userCompanyRepository: UserCompanyRepository }) {
        this.userCompanyRepository = userCompanyRepository
        this.scheduleRepository = scheduleRepository
    }

    private async rearrangePriority({
        priority,
        user_company_company_id,
        user_company_user_id
    }: {
        user_company_user_id: string
        user_company_company_id: string
        priority: number
    }) {
        const schedules = await this.scheduleRepository.find({
            where: {
                user_company_user_id,
                user_company_company_id,
                priority: {
                    gte: priority
                }
            },
            orderBy: {
                priority: 'asc'
            },
            select: {
                id: true,
                priority: true
            }
        })

        const rearrangedSchedule = schedules.map(schedule => {
            return {
                id: schedule.id,
                priority: schedule.priority + 1
            }
        })

        await this.scheduleRepository.patchMany(rearrangedSchedule)
    }

    async execute(scheduleData: {
        id: string
        start_of_shift?: string
        end_of_shift?: string
        duration_per_appointment?: string
        user_company_user_id?: string
        user_company_company_id?: string
        recurrency_type?: $Enums.Recurrency_type
        dates?: string
        priority?: number
        name?: string
        intervals?: Interval[]
    }): Promise<{ schedule: Schedule }> {
        const id = scheduleData.id

        const oldSchedule = await this.scheduleRepository.findById(id)

        if (!oldSchedule) {
            throw new Error('Id does not exists.')
        }

        const {
            dates,
            duration_per_appointment,
            recurrency_type,
            start_of_shift,
            end_of_shift,
            intervals,
            priority,
            user_company_company_id = oldSchedule.user_company_company_id,
            user_company_user_id = oldSchedule.user_company_user_id,
        } = scheduleData

        const user_company = await this.userCompanyRepository.findByIds({
            company_id: user_company_company_id,
            user_id: user_company_user_id
        })

        if (!user_company) {
            throw new CompanyDoesNotExists()
        }

        if (!!recurrency_type && !dates) {
            throw new ScheduleTypeError()
        } else if (dates) {
            checkRecurrencyType({
                dates,
                recurrency_type: recurrency_type || oldSchedule.recurrency_type
            })
        }

        checkFormatting({
            start_of_shift,
            end_of_shift,
            duration_per_appointment,
            intervals
        })

        if (start_of_shift || end_of_shift || duration_per_appointment) {
            checkDuration({
                start_of_shift: start_of_shift || oldSchedule.start_of_shift,
                end_of_shift: end_of_shift || oldSchedule.end_of_shift,
                duration_per_appointment: duration_per_appointment || oldSchedule.duration_per_appointment,
            })
        }

        if (start_of_shift || intervals) {
            checkIntervals({
                start_of_shift: start_of_shift || oldSchedule.start_of_shift,
                intervals: intervals || JSON.parse(oldSchedule.intervals)
            })
        }

        priority && await this.rearrangePriority({
            priority,
            user_company_company_id,
            user_company_user_id
        })

        const schedule = await this.scheduleRepository.patch(id, {
            ...scheduleData,
            intervals: intervals ? JSON.stringify(intervals) : undefined
        })

        return {
            schedule
        }
    }
}