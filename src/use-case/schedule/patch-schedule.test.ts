import { beforeEach, describe, expect, it } from "vitest";
import { PatchSchedule } from "./patch-schedule";
import type { UserRepository } from "../../repositories/user.repository";
import type { CompanyRepository } from "../../repositories/company.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import { $Enums, type Company, type Schedule, type User, type User_company } from "@prisma/client";
import { InMemoryUserRepository } from "../../repositories/in-memory/users.in-memory";
import { InMemoryCompanyRepository } from "../../repositories/in-memory/company.in-memory";
import { InMemoryUserCompanyRepository } from "../../repositories/in-memory/user-company.in-memory";
import { InMemoryScheduleRepository } from "../../repositories/in-memory/schedule.in-memory";
import { addDays, format } from "date-fns";
import { StartAfterEnd } from "../errors/StartAfterEnd.error";
import { ErrorFormattingField } from "../errors/ErrorFormattingField.error";
import { ScheduleTypeError } from "../errors/ScheduleTypeError.error";
import { IntervalBeforeStart } from "../errors/IntervalBeforeStart.error";

describe('Patch use case', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository

    let sut: PatchSchedule

    let user: User
    let company: Company
    let user_company: User_company
    let oldSchedule: Schedule

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()

        sut = new PatchSchedule({
            scheduleRepository,
            userCompanyRepository
        })
    })

    beforeEach(async () => {
        user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        company = await companyRepository.create({
            name: 'John Doe Company'
        })

        user_company = await userCompanyRepository.create({
            company_id: company.id,
            user_id: user.id,
            role: $Enums.COMPANY_ROLE.ADMIN,
        })

        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')

        const intervals = [
            {
                name: 'Lunch',
                start: '12:00:00',
                duration: '01:00:00'
            }
        ]

        oldSchedule = await scheduleRepository.create({
            priority: 1,
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals: JSON.stringify(intervals),
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

    })

    it('should patch schedule correctly', async () => {
        const { schedule } = await sut.execute({
            id: oldSchedule.id,
            name: 'Patched schedule',
        })

        expect(schedule.name).toEqual('Patched schedule')
    })

    it('should be possible patch a schedule sending different priority', async () => {
        const { schedule } = await sut.execute({
            id: oldSchedule.id,
            priority: 2
        })

        expect(schedule.priority).toEqual(2)
    })

    it('should patch all subsequents schedules if priority of one schedule elevate', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')

        const intervals = [
            {
                name: 'Lunch',
                start: '12:00:00',
                duration: '01:00:00'
            }
        ]

        const secondSchedule = await scheduleRepository.create({
            priority: 2,
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals: JSON.stringify(intervals),
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        const { schedule } = await sut.execute({
            id: oldSchedule.id,
            priority: 2
        })

        expect(schedule.priority).toEqual(2)

        const secondSchedulePatched = await scheduleRepository.findById(secondSchedule.id)

        expect(secondSchedulePatched?.priority).toEqual(3)
    })

    it('should not patch a schedule if start of shift is after end of shift', async () => {
        await expect(
            sut.execute({
                id: oldSchedule.id,
                start_of_shift: '22:00:00'
            })
        ).rejects.toBeInstanceOf(StartAfterEnd)
    })

    it('should not patch a schedule if start of shift format is wrong', async () => {
        await expect(
            sut.execute({
                id: oldSchedule.id,
                start_of_shift: '22:00'
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule if end of shift format is wrong', async () => {
        await expect(
            sut.execute({
                id: oldSchedule.id,
                end_of_shift: '22:00'
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule if duration per appointment format is wrong', async () => {
        await expect(
            sut.execute({
                id: oldSchedule.id,
                duration_per_appointment: '22/00'
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule if start of interval format is wrong', async () => {
        const intervals: Interval[] = [
            {
                name: 'Lunch',
                start: '12:00',
                duration: '01:00:00',
            }
        ]

        await expect(
            sut.execute({
                id: oldSchedule.id,
                intervals
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule if duration of interval format is wrong', async () => {
        const intervals: Interval[] = [
            {
                name: 'Lunch',
                start: '12:00:00',
                duration: '01:00',
            }
        ]

        await expect(
            sut.execute({
                id: oldSchedule.id,
                intervals
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule if start of interval is before start of shift', async () => {
        const intervals: Interval[] = [
            {
                name: 'Lunch',
                start: '06:00:00',
                duration: '01:00:00',
            }
        ]

        await expect(
            sut.execute({
                id: oldSchedule.id,
                intervals
            })
        ).rejects.toBeInstanceOf(IntervalBeforeStart)
    })

    it('should patch a schedule with day of the week', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            'Mon',
            'Tue',
            'Wed',
            'Sat',
            'Thu',
            'Fri',
            'Sun'
        ].join(';')

        const { schedule } = await sut.execute({
            id: oldSchedule.id,
            dates
        })

        expect(
            schedule.dates
        ).toEqual(dates)
    })

    it('should patch a DATE type schedule with more than two date', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            format(addDays(new Date(), 3), 'MM/dd/yyyy'),
            format(addDays(new Date(), 4), 'MM/dd/yyyy'),
        ].join(';')

        await scheduleRepository.patch(oldSchedule.id, {
            recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
        })

        const { schedule } = await sut.execute({
            id: oldSchedule.id,
            dates
        })

        expect(
            schedule.dates
        ).toEqual(dates)
    })

    it('should not patch a schedule if with day of the week with wrong formatting', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            'Mon',
            'Tue',
            'Wed',
            'Sat',
            'Thu',
            'Sex', // Sex intead of Fri
            'Sun'
        ].join(';')

        await expect(
            sut.execute({
                id: oldSchedule.id,
                dates
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule type without patch dates format too', async () => {
        await expect(
            sut.execute({
                id: oldSchedule.id,
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE
            })
        ).rejects.toBeInstanceOf(ScheduleTypeError)
    })

    it('should not patch a schedule to DATE type with day of the week format', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            'Mon',
            'Tue',
            'Wed',
            'Sat',
            'Thu',
            'Fri',
            'Sun'
        ].join(';')

        await expect(
            sut.execute({
                id: oldSchedule.id,
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not patch a schedule to INTERVAL_OF_DATES type with more than one date', async () => {
        await scheduleRepository.patch(oldSchedule.id, {
            recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
            dates: [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')
        })

        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            format(addDays(new Date(), 3), 'MM/dd/yyyy'),
            format(addDays(new Date(), 4), 'MM/dd/yyyy'),
        ].join(';')

        await expect(
            sut.execute({
                id: oldSchedule.id,
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates
            })
        ).rejects.toBeInstanceOf(ErrorFormattingField)
    })

})
