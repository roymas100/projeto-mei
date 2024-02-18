import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryScheduleRepository } from "../repositories/in-memory/schedule.in-memory";
import type { ScheduleRepository } from "../repositories/schedule.repository";
import type { UserRepository } from "../repositories/user.repository";
import type { UserCompanyRepository } from "../repositories/user-company.repository";
import type { CompanyRepository } from "../repositories/company.repository";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import { InMemoryCompanyRepository } from "../repositories/in-memory/company.in-memory";
import { InMemoryUserCompanyRepository } from "../repositories/in-memory/user-company.in-memory";
import { $Enums, type Company, type Schedule, type User, type User_company } from "@prisma/client";
import { GetAvailableTimes } from "./get-available-times";
import { addDays, format, parse } from "date-fns";
import { UserCompanyDoesNotExists } from "./errors/UserCompanyDoesNotExists.error";
import { ErrorFormattingField } from "./errors/ErrorFormattingField.error";
import { NoSchedulesConfigured } from "./errors/NoSchedulesConfigured.error";
import { AvailableTimeEmpty } from "./errors/AvailableTimeEmpty.error";

describe('Get available times', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository
    let sut: GetAvailableTimes

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()

        sut = new GetAvailableTimes({
            scheduleRepository,
            userCompanyRepository
        })
    })

    let user: User
    let company: Company
    let user_company: User_company

    beforeEach(async () => {
        user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253'
        })

        company = await companyRepository.create({
            name: 'Default Company'
        })

        user_company = await userCompanyRepository.create({
            company_id: company.id,
            user_id: user.id
        })
    })

    it('should not show list if user company connection does not exists', async () => {
        const company = await companyRepository.create({
            name: 'Prov Company'
        })

        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')

        await scheduleRepository.create({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals: JSON.stringify([]),
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 1
        })

        await expect(sut.execute({
            company_id: company.id,
            date: format(new Date(), 'MM/dd/yyyy'),
            user_id: user.id
        })).rejects.toBeInstanceOf(UserCompanyDoesNotExists)
    })

    it('should not show list if current date format is wrong', async () => {
        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
            format(addDays(new Date(), 2), 'MM/dd/yyyy'),
        ].join(';')


        await scheduleRepository.create({
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals: JSON.stringify([]),
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 1
        })

        await expect(sut.execute({
            company_id: company.id,
            date: '04/22',
            user_id: user.id
        })).rejects.toBeInstanceOf(ErrorFormattingField)
    })

    it('should not show list if does not have schedule configured', async () => {
        await expect(sut.execute({
            company_id: company.id,
            date: format(new Date(), 'MM/dd/yyyy'),
            user_id: user.id
        })).rejects.toBeInstanceOf(NoSchedulesConfigured)
    })

    describe('Given 1 schedule of DATE type', () => {
        it('should show correctly', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 1), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const { times } = await sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(new Date(), 'MM/dd/yyyy'),
            })

            expect(times.length).toEqual(9)
        })

        it('should show only one time correctly', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 1), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '09:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const { times } = await sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(new Date(), 'MM/dd/yyyy'),
            })

            expect(times.length).toEqual(1)
        })

        it('should not show if there is no schedule configured for specific day', async () => {
            const dates = [
                format(addDays(new Date(), 1), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '09:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            expect(sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(new Date(), 'MM/dd/yyyy'),
            })).rejects.toBeInstanceOf(NoSchedulesConfigured)
        })

        it('should not show if there are intervals all over shift period', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 1), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            const intervals: Interval[] = [
                {
                    start: '08:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '09:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            expect(sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(new Date(), 'MM/dd/yyyy'),
            })).rejects.toBeInstanceOf(AvailableTimeEmpty)
        })

        it('should show correctly if there is more intervals', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 1), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            const intervals: Interval[] = [
                {
                    start: '12:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                },
                {
                    start: '13:30:00',
                    duration: '00:30:00',
                    name: 'Break time',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const { times } = await sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(new Date(), 'MM/dd/yyyy'),
            })

            expect(times.length).toEqual(7)
        })

        it('should show correctly if there is more intervals collapsing', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 1), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            const intervals: Interval[] = [
                {
                    start: '12:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                },
                {
                    start: '12:30:00',
                    duration: '01:00:00',
                    name: 'Break time',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const { times } = await sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(new Date(), 'MM/dd/yyyy'),
            })

            expect(times.length).toEqual(7)
        })
    })

    describe('Given 1 schedule of INTERVAL_OF_DATES type', () => {
        it('should show times correctly', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const { times } = await sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            })

            expect(times.length).toEqual(9)
        })

        it('should not show if there are interval all over the shift', async () => {
            const dates = [
                format(new Date(), 'MM/dd/yyyy'),
                format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            ].join(';')

            const intervals: Interval[] = [
                {
                    start: '08:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '09:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            await expect(sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: format(addDays(new Date(), 2), 'MM/dd/yyyy'),
            })).rejects.toBeInstanceOf(AvailableTimeEmpty)
        })

        it('should show only if date is the same as day of week', async () => {
            const dates = [
                '02/17/2024',
                '02/26/2024',
                'Fri'
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const { times } = await sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: '02/23/2024',
            })

            expect(times.length).toEqual(9)
        })

        it('should not show if date is not the same as day of week', async () => {
            const dates = [
                '02/17/2024',
                '02/26/2024',
                'Sat'
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            expect(sut.execute({
                user_id: user.id,
                company_id: company.id,
                date: '02/23/2024',
            })).rejects.toBeInstanceOf(NoSchedulesConfigured)
        })
    })

    describe('Given first schedule INTERVAL_OF_DATES and second schedule DATE', () => {
        it('should show if priority 1 schedule has priority on rules than others schedules', async () => {
            const dates = [
                '02/18/2024',
                '02/22/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/20/2024',
                '02/26/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/20/2024',
            })

            expect(times.length).toEqual(9)
        })

        it('should show only the times of the day available', async () => {
            const dates = [
                '02/18/2024',
                '02/22/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/20/2024',
                '02/26/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/21/2024',
            })

            expect(times.length).toEqual(9)
        })

        it('should show correctly considering fisrt has intervals', async () => {
            const dates = [
                '02/18/2024',
                '02/22/2024',
            ].join(';')

            const intervals: Interval[] = [
                {
                    start: '12:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/20/2024',
                '02/26/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/20/2024',
            })

            expect(times.length).toEqual(8)
        })

        it('should show correctly considering second has intervals', async () => {
            const dates = [
                '02/18/2024',
                '02/22/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/20/2024',
                '02/26/2024',
            ].join(';')

            const intervals: Interval[] = [
                {
                    start: '12:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/20/2024',
            })

            expect(times.length).toEqual(8)
        })

        it('should show correctly considering both have intervals', async () => {
            const dates = [
                '02/18/2024',
                '02/22/2024',
            ].join(';')


            const intervals: Interval[] = [
                {
                    start: '12:00:00',
                    duration: '01:00:00',
                    name: 'Lunch',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify(intervals),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/20/2024',
                '02/26/2024',
            ].join(';')

            const intervals_2: Interval[] = [
                {
                    start: '13:00:00',
                    duration: '00:30:00',
                    name: 'Lunch',
                }
            ]

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify(intervals_2),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/20/2024',
            })

            expect(times.length).toEqual(7)
        })
    })

    describe('Given two schedule INTERVAL_OF_DATES', () => {
        it('should prevail the rules of the first priority', async () => {
            const dates = [
                '02/18/2024',
                '02/22/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/20/2024',
                '02/26/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/21/2024',
            })

            expect(times.length).toEqual(9)
        })

        it('should show only the one that has the current day of the week (the second permit the day of week)', async () => {
            const dates = [
                '02/18/2024',
                '02/26/2024',
                'Tue',
                'Thu'
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/18/2024',
                '02/26/2024',
                'Mon',
                'Wed',
                'Fri'
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/21/2024', // this is on wednesday
            })

            expect(times.length).toEqual(4)
        })

        it('should show only the one that has the current day of the week (the second permit all days)', async () => {
            const dates = [
                '02/18/2024',
                '02/26/2024',
                'Tue',
                'Thu'
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates,
                duration_per_appointment: '01:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 1
            })

            const dates_2 = [
                '02/18/2024',
                '02/26/2024',
            ].join(';')

            await scheduleRepository.create({
                recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
                dates: dates_2,
                duration_per_appointment: '02:00:00',
                start_of_shift: '08:00:00',
                end_of_shift: '17:00:00',
                intervals: JSON.stringify([]),
                name: 'Default schedule',
                user_company_company_id: company.id,
                user_company_user_id: user.id,
                priority: 2
            })

            const { times } = await sut.execute({
                company_id: company.id,
                user_id: user.id,
                date: '02/21/2024', // this is on wednesday
            })

            expect(times.length).toEqual(4)
        })
    })
})