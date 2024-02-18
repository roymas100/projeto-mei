import { $Enums } from "@prisma/client"
import type { ScheduleRepository } from "../repositories/schedule.repository"
import type { UserCompanyRepository } from "../repositories/user-company.repository"
import { UserCompanyDoesNotExists } from "./errors/UserCompanyDoesNotExists.error"
import { endOfDay, isWithinInterval, parse, startOfDay, isValid, isSameDay, add, isBefore, areIntervalsOverlapping, isSameHour, isSameMinute, isSameSecond } from "date-fns"
import { ErrorFormattingField } from "./errors/ErrorFormattingField.error"
import { NoSchedulesConfigured } from "./errors/NoSchedulesConfigured.error"
import { AvailableTimeEmpty } from "./errors/AvailableTimeEmpty.error"

interface Time_Intervals {
    start: Date,
    end: Date
}

export class GetAvailableTimes {
    private userCompanyRepository: UserCompanyRepository
    private scheduleRepository: ScheduleRepository

    constructor({
        userCompanyRepository,
        scheduleRepository
    }: {
        userCompanyRepository: UserCompanyRepository
        scheduleRepository: ScheduleRepository
    }) {
        this.userCompanyRepository = userCompanyRepository
        this.scheduleRepository = scheduleRepository
    }

    private isSameOrBefore(first: Date, second: Date) {
        const isSameDate = isSameDay(first, second) && isSameHour(first, second) && isSameMinute(first, second) && isSameSecond(first, second)

        return isBefore(first, second) || isSameDate
    }

    async execute({
        user_id,
        company_id,
        date
    }: {
        user_id: string
        company_id: string
        date: string
    }): Promise<{ times: Time_Intervals[] }> {
        const user_company = await this.userCompanyRepository.findByIds({
            company_id,
            user_id
        })

        if (!user_company) {
            throw new UserCompanyDoesNotExists()
        }

        const parsedDate = startOfDay(parse(date, 'MM/dd/yyyy', new Date()))

        if (!isValid(parsedDate)) {
            throw new ErrorFormattingField()
        }

        const schedules = await this.scheduleRepository.find({
            where: {
                user_company_company_id: company_id,
                user_company_user_id: user_id
            },
            orderBy: {
                priority: 'asc'
            }
        })

        if (!schedules.length) {
            throw new NoSchedulesConfigured()
        }

        const filteredSchedules = schedules.filter(schedule => {
            const dates = schedule.dates.split(';')

            if (schedule.recurrency_type === $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES) {
                const [start, end, ...day_of_week] = dates
                const parsedStart = startOfDay(parse(start, 'MM/dd/yyyy', new Date()))
                const parsedEnd = endOfDay(parse(end, 'MM/dd/yyyy', new Date()))

                const isDayOfWeekPermited = day_of_week.some((day) => {
                    const parsedDay = startOfDay(parse(day, 'eee', parsedDate))

                    return isSameDay(parsedDay, parsedDate)
                })

                const isWithin = isWithinInterval(parsedDate, {
                    start: parsedStart,
                    end: parsedEnd
                })

                return day_of_week.length > 0 ? isWithin && isDayOfWeekPermited : isWithin
            } else {
                return dates.some(d => {
                    return isSameDay(parsedDate, startOfDay(parse(d, 'MM/dd/yyyy', new Date())))
                })
            }
        })

        if (!filteredSchedules.length) {
            throw new NoSchedulesConfigured()
        }

        const schedule = filteredSchedules.reduce((def_schedule, schedule) => {
            const def_intervals: Interval[] = JSON.parse(def_schedule.intervals)
            const intervals: Interval[] = JSON.parse(schedule.intervals)

            const new_intervals = def_intervals.concat(intervals)

            return {
                ...def_schedule,
                intervals: JSON.stringify(new_intervals)
            }
        })

        const { start_of_shift, end_of_shift, duration_per_appointment, intervals: stringIntervals } = schedule
        const intervals: Interval[] = JSON.parse(stringIntervals)
        const startOfShift = parse(start_of_shift, 'HH:mm:ss', parsedDate)
        const endOfShift = parse(end_of_shift, 'HH:mm:ss', parsedDate)

        const [duration_hour, duration_minutes, duration_seconds] = duration_per_appointment.split(':')

        const interval_intervals: Time_Intervals[] = intervals.map(item => {
            const start = parse(item.start, 'HH:mm:ss', parsedDate)
            const [hours, minutes, seconds] = item.duration.split(':')
            return {
                start,
                end: add(start, {
                    hours: +hours,
                    minutes: +minutes,
                    seconds: +seconds
                })
            }
        })

        const times: Time_Intervals[] = []
        let processing = true
        let startOfNextTime: Date = startOfShift
        while (processing) {
            const nextTime = {
                start: startOfNextTime,
                end: add(startOfNextTime, {
                    hours: +duration_hour,
                    minutes: +duration_minutes,
                    seconds: +duration_seconds
                })
            }

            const overlap_interval = interval_intervals.find(interval => {
                return areIntervalsOverlapping(nextTime, interval)
            })

            if (overlap_interval) {
                startOfNextTime = overlap_interval.end
            } else {
                const time = {
                    start: startOfNextTime,
                    end: add(startOfNextTime, {
                        hours: +duration_hour,
                        minutes: +duration_minutes,
                        seconds: +duration_seconds
                    })
                }

                if (this.isSameOrBefore(time.end, endOfShift)) {
                    startOfNextTime = time.end
                    times.push(time)
                } else {
                    processing = false
                }
            }
        }

        if (!times.length) {
            throw new AvailableTimeEmpty()
        }

        return { times }
    }
}