import { $Enums, type Company, type Schedule, type User, type User_company } from "@prisma/client";
import { addDays, format } from "date-fns";
import { describe, beforeEach, expect, it } from "vitest";
import { DeleteSchedule } from "./delete-schedule";
import type { UserRepository } from "../../repositories/user.repository";
import type { CompanyRepository } from "../../repositories/company.repository";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import { InMemoryUserRepository } from "../../repositories/in-memory/users.in-memory";
import { InMemoryCompanyRepository } from "../../repositories/in-memory/company.in-memory";
import { InMemoryUserCompanyRepository } from "../../repositories/in-memory/user-company.in-memory";
import { InMemoryScheduleRepository } from "../../repositories/in-memory/schedule.in-memory";
import { ItemDoesNotExists } from "../errors/ItemDoesNotExists.error";

describe('Delete Schedule use case', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository

    let sut: DeleteSchedule

    let user: User
    let company: Company
    let user_company: User_company
    let oldSchedule: Schedule

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()

        sut = new DeleteSchedule({
            scheduleRepository,
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
            recurrency_type: $Enums.Recurrency_type.INTERVAL_OF_DATES,
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

    it('should delete schedule correctly', async () => {
        const { schedule } = await sut.execute(oldSchedule.id)

        expect(schedule.id).toEqual(expect.any(String))
    })

    it('should not delete schedule that not exists', async () => {
        await expect(sut.execute('Pumba meu boi')).rejects.toBeInstanceOf(ItemDoesNotExists)
    })
})