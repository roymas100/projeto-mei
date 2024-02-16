import type { ScheduleRepository } from "../../repositories/schedule.repository"
import type { UserCompanyRepository } from "../../repositories/user-company.repository"
import type { UserRepository } from "../../repositories/user.repository"
import { UserCompanyDoesNotExists } from "../errors/UserCompanyDoesNotExists.error"
import { UserDoesNotExists } from "../errors/UserDoesNotExists.error"

export class GetSchedule {
    private scheduleRepository: ScheduleRepository
    private userCompanyRepository: UserCompanyRepository

    constructor({
        scheduleRepository,
        userCompanyRepository,
    }: {
        scheduleRepository: ScheduleRepository,
        userCompanyRepository: UserCompanyRepository,
    }) {
        this.scheduleRepository = scheduleRepository
        this.userCompanyRepository = userCompanyRepository
    }

    async execute({
        user_company_company_id,
        user_company_user_id
    }: {
        user_company_user_id: string
        user_company_company_id: string
    }) {
        const user_company = await this.userCompanyRepository.findByIds({
            user_id: user_company_user_id,
            company_id: user_company_company_id
        })

        if (!user_company) {
            throw new UserCompanyDoesNotExists()
        }

        const schedules = await this.scheduleRepository.find({
            where: {
                user_company_company_id,
                user_company_user_id
            }
        })

        return { schedules }
    }
}