import type { ScheduleRepository } from "../repositories/schedule.repository";
import { getHours, getMinutes, isValid, parse, intervalToDuration, hoursToSeconds, minutesToSeconds, getSeconds, isAfter, interval } from "date-fns";
import type { UserCompanyRepository } from "../repositories/user-company.repository";
import { CompanyDoesNotExists } from "./errors/CompanyDoesNotExists.error";
import { $Enums } from "@prisma/client";
import { ErrorFormattingField } from "./errors/ErrorFormattingField.error";
import { StartAfterEnd } from "./errors/StartAfterEnd.error";
import { IntervalBeforeStart } from "./errors/IntervalBeforeStart.error";
import { DateFormatIncompatible } from "./errors/DateFormatIncompatible.error";
import { PositionIsTaken } from "./errors/PositionIstaken.error";
import { ScheduleDurationError } from "./errors/ScheduleDurationError.error";

interface Interval {
    name: string,
    duration: string
    start: string
}

export class AddSchedule {
    private scheduleRepository: ScheduleRepository
    private userCompanyRepository: UserCompanyRepository

    constructor({ scheduleRepository, userCompanyRepository }: { scheduleRepository: ScheduleRepository, userCompanyRepository: UserCompanyRepository }) {
        this.userCompanyRepository = userCompanyRepository
        this.scheduleRepository = scheduleRepository
    }

    private checkFormatting({
        duration_per_appointment,
        end_of_shift,
        start_of_shift,
        intervals
    }: {
        start_of_shift: string
        end_of_shift: string
        duration_per_appointment: string
        intervals: Interval[]
    }) {
        const startOfShift = parse(start_of_shift, 'HH:mm:ss', new Date())
        const endOfShift = parse(end_of_shift, 'HH:mm:ss', new Date())
        const durationPerAppointment = parse(duration_per_appointment, 'HH:mm:ss', new Date())

        if (
            !isValid(startOfShift) ||
            !isValid(endOfShift) ||
            !isValid(durationPerAppointment)
        ) {
            throw new ErrorFormattingField()
        }

        for (const interval of intervals) {
            const duration = parse(interval.duration, 'HH:mm:ss', new Date())
            const start = parse(interval.start, 'HH:mm:ss', new Date())

            if (!isValid(duration) || !isValid(start)) {
                throw new ErrorFormattingField()
            }
        }
    }

    private checkDuration({
        duration_per_appointment,
        end_of_shift,
        start_of_shift
    }: {
        start_of_shift: string
        end_of_shift: string
        duration_per_appointment: string
    }) {
        const startOfShift = parse(start_of_shift, 'HH:mm:ss', new Date())
        const endOfShift = parse(end_of_shift, 'HH:mm:ss', new Date())

        if (isAfter(startOfShift, endOfShift)) {
            throw new StartAfterEnd()
        }

        const durationPerAppointment = parse(duration_per_appointment, 'HH:mm:ss', new Date())

        const duration_per_appointment_hour = getHours(durationPerAppointment)
        const duration_per_appointment_minutes = getMinutes(durationPerAppointment)
        const duration_per_appointment_seconds = getSeconds(durationPerAppointment)

        const {
            hours = 0,
            minutes = 0,
            seconds = 0
        } = intervalToDuration({
            start: startOfShift,
            end: endOfShift
        })

        const durationOfShiftInSeconds = hoursToSeconds(hours) + minutesToSeconds(minutes) + seconds
        const durationPerAppointmentSeconds = hoursToSeconds(duration_per_appointment_hour) + minutesToSeconds(duration_per_appointment_minutes) + duration_per_appointment_seconds

        if (durationOfShiftInSeconds < durationPerAppointmentSeconds) {
            throw new ScheduleDurationError()
        }
    }

    private checkRecurrencyType({
        dates, recurrency_type
    }: { dates: string, recurrency_type: $Enums.Recurrency_type }) {
        function isDayOfTheWeek(type: $Enums.Recurrency_type, index: number) {
            return type === $Enums.Recurrency_type.INTERVAL_OF_DATES && (index !== 0 && index !== 1)
        }

        // 12/10/2024;10/08/2024 || 12/10/2024;10/08/2024;Sun;Tue;Wed; || 12/10/2024;10/08/2024;12/10/2024;10/08/2024
        const datesArr = dates.split(';')

        for (const [index, date] of datesArr.entries()) {
            const d = parse(date, isDayOfTheWeek(recurrency_type, index) ? 'eee' : 'MM/dd/yyyy', new Date())

            if (!isValid(d)) {
                throw new ErrorFormattingField()
            }
        }
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

    private checkIntervals({
        intervals,
        start_of_shift
    }: {
        intervals: Interval[]
        start_of_shift: string
    }) {
        const startOfShift = parse(start_of_shift, 'HH:mm:ss', new Date())

        for (const interval of intervals) {
            const start = parse(interval.start, 'HH:mm:ss', new Date())

            if (isAfter(startOfShift, start)) {
                throw new IntervalBeforeStart()
            }
        }

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

        this.checkRecurrencyType({
            dates,
            recurrency_type
        })

        this.checkFormatting({
            start_of_shift,
            end_of_shift,
            duration_per_appointment,
            intervals
        })

        this.checkDuration({
            start_of_shift,
            end_of_shift,
            duration_per_appointment,
        })

        this.checkIntervals({
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
