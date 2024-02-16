import { beforeEach, describe, expect, it } from "vitest";
import type { CompanyRepository } from "../../repositories/company.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import type { UserRepository } from "../../repositories/user.repository";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import { AddSchedule } from "./add-schedule";
import { InMemoryCompanyRepository } from "../../repositories/in-memory/company.in-memory";
import { InMemoryUserCompanyRepository } from "../../repositories/in-memory/user-company.in-memory";
import { InMemoryUserRepository } from "../../repositories/in-memory/users.in-memory";
import { InMemoryScheduleRepository } from "../../repositories/in-memory/schedule.in-memory";
import { $Enums, type Company, type User, type User_company } from "@prisma/client";
import { addDays, format } from "date-fns";
import { StartAfterEnd } from "../errors/StartAfterEnd.error";
import { ScheduleDurationError } from "../errors/ScheduleDurationError.error";
import { ErrorFormattingField } from "../errors/ErrorFormattingField.error";
import { IntervalBeforeStart } from "../errors/IntervalBeforeStart.error";
import { PositionIsTaken } from "../errors/PositionIsTaken.error";

describe('Add Schedule', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository

    let sut: AddSchedule

    let user: User
    let company: Company
    let user_company: User_company

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()

        sut = new AddSchedule({
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
    })

    it('should create a schedule correctly', async () => {
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

        const { schedule } = await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals,
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        expect(schedule.id).toEqual(expect.any(String))
    })

    it('should create two schedules correctly', async () => {
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

        await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals,
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        const { schedule } = await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals,
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        expect(schedule.id).toEqual(expect.any(String))
    })

    it('should not create a schedule if start of shift is after end of shift', async () => {
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

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '17:00:00',
            end_of_shift: '15:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(StartAfterEnd)
    })

    it('should not create a schedule if duration of session takes more time than start of shift and end of shift', async () => {
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

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '05:00:00',
            start_of_shift: '14:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ScheduleDurationError)
    })

    it('should not create a schedule if start of shift format is wrong', async () => {
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

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01s:00:00',
            start_of_shift: '08/00/00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not create a schedule if end of shift format is wrong', async () => {
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

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17/00/00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not create a schedule if duration per appointment format is wrong', async () => {
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

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01/00/00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not create a schedule if start of interval format is wrong', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')

        const intervals = [
            {
                name: 'Lunch',
                start: '12/00/00',
                duration: '01:00:00'
            }
        ]

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not create a schedule if duration of interval format is wrong', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')

        const intervals = [
            {
                name: 'Lunch',
                start: '12:00:00',
                duration: '01/00/00'
            }
        ]

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should create a schedule with day of the week', async () => {
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

        const intervals = [
            {
                name: 'Lunch',
                start: '12:00:00',
                duration: '01:00:00'
            }
        ]

        const { schedule } = await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        expect(schedule.id).toEqual(expect.any(String))
    })

    it('should not create a schedule if with day of the week with wrong formatting', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            'Err',
            'Tue',
            'Wed',
            'Sar',
            'Thu',
            'Fri',
            'Sun'
        ].join(';')

        const intervals = [
            {
                name: 'Lunch',
                start: '12:00:00',
                duration: '01:00:00'
            }
        ]

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not create a schedule if priority is the same as other schedule', async () => {
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

        await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 1
        })).rejects.toBeInstanceOf(PositionIsTaken)
    })

    it('should be possible create a schedule sending different priority', async () => {
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

        await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 1
        })

        const { schedule } = await sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 2
        })

        expect(schedule.id).toEqual(expect.any(String))
    })

    it('should not create a schedule if start of interval is before start of shift', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')

        const intervals = [
            {
                name: 'Lunch',
                start: '10:00:00',
                duration: '01:00:00'
            }
        ]

        await expect(sut.execute({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '13:00:00',
            end_of_shift: '17:00:00',
            intervals,
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 1
        })).rejects.toBeInstanceOf(IntervalBeforeStart)
    })
})
