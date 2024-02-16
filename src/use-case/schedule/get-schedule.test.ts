import { $Enums, type Company, type Schedule, type User, type User_company } from "@prisma/client";
import { addDays, format } from "date-fns";
import { describe, beforeEach, expect, it } from "vitest";
import type { UserRepository } from "../../repositories/user.repository";
import type { CompanyRepository } from "../../repositories/company.repository";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import { InMemoryUserRepository } from "../../repositories/in-memory/users.in-memory";
import { InMemoryCompanyRepository } from "../../repositories/in-memory/company.in-memory";
import { InMemoryUserCompanyRepository } from "../../repositories/in-memory/user-company.in-memory";
import { InMemoryScheduleRepository } from "../../repositories/in-memory/schedule.in-memory";
import { GetSchedule } from "./get-schedule";
import { UserCompanyDoesNotExists } from "../errors/UserCompanyDoesNotExists.error";

describe('Get Schedule use case', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository

    let sut: GetSchedule

    let user: User
    let company: Company
    let user_company: User_company
    let oldSchedule: Schedule

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

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()

        sut = new GetSchedule({
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

    it('should get two schedules correctly', async () => {

        await scheduleRepository.create({
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

        const { schedules } = await sut.execute({
            user_company_company_id: company.id,
            user_company_user_id: user.id,
        })

        expect(schedules.length).toEqual(2)
    })

    it('should not get schedule of another company', async () => {
        const company2 = await companyRepository.create({
            name: 'Company 2',
        })

        await userCompanyRepository.create({
            company_id: company2.id,
            user_id: user.id,
        })

        await scheduleRepository.create({
            priority: 1,
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals: JSON.stringify(intervals),
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company2.id,
            user_company_user_id: user.id,
        })

        const { schedules } = await sut.execute({
            user_company_company_id: company.id,
            user_company_user_id: user.id
        })

        expect(schedules.length).toEqual(1)
    })

    it('should not get schedule of another user', async () => {
        const user2 = await userRepository.create({
            name: 'John lendo',
            phone: '+12133734254',
        })

        await userCompanyRepository.create({
            company_id: company.id,
            user_id: user2.id,
        })

        await scheduleRepository.create({
            priority: 1,
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals: JSON.stringify(intervals),
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user2.id,
        })


        const { schedules } = await sut.execute({
            user_company_company_id: company.id,
            user_company_user_id: user.id
        })

        expect(schedules.length).toEqual(1)
    })

    it('should not get schedule of another user company', async () => {
        const user2 = await userRepository.create({
            name: 'John lendo',
            phone: '+12133734254',
        })

        const company2 = await companyRepository.create({
            name: 'Company 2',
        })

        await userCompanyRepository.create({
            company_id: company2.id,
            user_id: user2.id,
        })

        await scheduleRepository.create({
            priority: 1,
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals: JSON.stringify(intervals),
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company2.id,
            user_company_user_id: user2.id,
        })


        const { schedules } = await sut.execute({
            user_company_company_id: company.id,
            user_company_user_id: user.id
        })

        expect(schedules.length).toEqual(1)
    })

    it('should not delete schedule that not exists', async () => {
        const user2 = await userRepository.create({
            name: 'John lendo',
            phone: '+12133734254',
        })

        const company2 = await companyRepository.create({
            name: 'Company 2',
        })

        await scheduleRepository.create({
            priority: 1,
            recurrency_type: $Enums.RECURRENCY_TYPE.INTERVAL_OF_DATES,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            intervals: JSON.stringify(intervals),
            end_of_shift: '17:00:00',
            name: 'Default schedule',
            user_company_company_id: company2.id,
            user_company_user_id: user2.id,
        })

        await expect(sut.execute({
            user_company_company_id: company2.id,
            user_company_user_id: user2.id,
        })).rejects.toBeInstanceOf(UserCompanyDoesNotExists)
    })
})