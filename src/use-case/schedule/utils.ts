import { getHours, getMinutes, getSeconds, hoursToSeconds, intervalToDuration, isAfter, isValid, minutesToSeconds, parse } from "date-fns"
import { ErrorFormattingField } from "../errors/ErrorFormattingField.error"
import { StartAfterEnd } from "../errors/StartAfterEnd.error"
import { ScheduleDurationError } from "../errors/ScheduleDurationError.error"
import { $Enums } from "@prisma/client"
import { IntervalBeforeStart } from "../errors/IntervalBeforeStart.error"

export function checkFormatting({
    duration_per_appointment,
    end_of_shift,
    start_of_shift,
    intervals
}: {
    start_of_shift?: string
    end_of_shift?: string
    duration_per_appointment?: string
    intervals?: Interval[]
}) {
    if (start_of_shift) {
        const startOfShift = parse(start_of_shift, 'HH:mm:ss', new Date())

        if (
            !isValid(startOfShift)
        ) {
            throw new ErrorFormattingField()
        }
    }

    if (end_of_shift) {
        const endOfShift = parse(end_of_shift, 'HH:mm:ss', new Date())

        if (
            !isValid(endOfShift)
        ) {
            throw new ErrorFormattingField()
        }
    }

    if (duration_per_appointment) {
        const durationPerAppointment = parse(duration_per_appointment, 'HH:mm:ss', new Date())

        if (
            !isValid(durationPerAppointment)
        ) {
            throw new ErrorFormattingField()
        }
    }

    if (intervals) {
        for (const interval of intervals) {
            const duration = parse(interval.duration, 'HH:mm:ss', new Date())
            const start = parse(interval.start, 'HH:mm:ss', new Date())

            if (!isValid(duration) || !isValid(start)) {
                throw new ErrorFormattingField()
            }
        }
    }
}

export function checkDuration({
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

export function checkRecurrencyType({
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

export function checkIntervals({
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