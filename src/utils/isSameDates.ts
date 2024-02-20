import { isBefore, isSameDay, isSameHour, isSameMinute, isSameSecond } from "date-fns"

export function isSameDates(first: Date, second: Date) {
    const isSameDate = isSameDay(first, second) && isSameHour(first, second) && isSameMinute(first, second) && isSameSecond(first, second)

    return isSameDate
}

export function isSameOrBefore(first: Date, second: Date) {
    return isBefore(first, second) || isSameDates(first, second)
}