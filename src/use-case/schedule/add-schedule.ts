import type { ScheduleRepository } from "../../repositories/schedule.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import { CompanyDoesNotExists } from "../errors/CompanyDoesNotExists.error";
import { $Enums } from "@prisma/client";
import { PositionIsTaken } from "../errors/PositionIsTaken.error";
import { checkDuration, checkFormatting, checkIntervals, checkRecurrencyType } from "./utils";

export class AddSchedule {
    private scheduleRepository: ScheduleRepository
    private userCompanyRepository: UserCompanyRepository

    constructor({ scheduleRepository, userCompanyRepository }: { scheduleRepository: ScheduleRepository, userCompanyRepository: UserCompanyRepository }) {
        this.userCompanyRepository = userCompanyRepository
        this.scheduleRepository = scheduleRepository
    }

    private async dealWithPriority({
        priority,
        user_company_user_id,
        user_company_company_id
    }: {
        priority?: number,
        user_company_user_id: string,
        user_company_company_id: string
    }) {

        let priorityValue: number = 1
        if (priority) {
            const schedule = await this.scheduleRepository.findFirst({
                where: {
                    priority,
                    user_company_user_id,
                    user_company_company_id
                }
            })

            if (schedule) {
                throw new PositionIsTaken()
            }
        } else {
            const schedule = await this.scheduleRepository.findFirst({
                where: {
                    user_company_user_id,
                    user_company_company_id
                },
                orderBy: {
                    priority: 'desc'
                }
            })

            priorityValue = schedule ? schedule.priority + 1 : 1
        }

        return priority ?? priorityValue
    }

    async execute(scheduleData: {
        start_of_shift: string
        end_of_shift: string
        duration_per_appointment: string
        user_company_user_id: string
        user_company_company_id: string
        recurrency_type: $Enums.Recurrency_type
        dates: string
        priority?: number
        name: string
        intervals: Interval[]
    }) {
        const {
            priority,
            recurrency_type,
            dates,
            start_of_shift,
            end_of_shift,
            duration_per_appointment,
            user_company_user_id,
            user_company_company_id,
            intervals } = scheduleData

        const user_company = await this.userCompanyRepository.findByIds({
            company_id: user_company_company_id,
            user_id: user_company_user_id
        })

        if (!user_company) {
            throw new CompanyDoesNotExists()
        }

        checkRecurrencyType({
            dates,
            recurrency_type
        })

        checkFormatting({
            start_of_shift,
            end_of_shift,
            duration_per_appointment,
            intervals
        })

        checkDuration({
            start_of_shift,
            end_of_shift,
            duration_per_appointment,
        })

        checkIntervals({
            start_of_shift,
            intervals
        })

        const priorityValue = await this.dealWithPriority({
            user_company_company_id,
            user_company_user_id,
            priority
        })

        const schedule = await this.scheduleRepository.create({
            ...scheduleData,
            intervals: JSON.stringify(intervals),
            priority: priorityValue
        })

        return {
            schedule
        }
    }
}
