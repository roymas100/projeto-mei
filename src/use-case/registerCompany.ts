import type { Company, User_company } from "@prisma/client";
import type { CompanyRepository } from "../repositories/company.repository";
import type { UserCompanyRepository } from "../repositories/user-company.repository";
import type { UserRepository } from "../repositories/user.repository";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";

export class RegisterCompany {
    private companyRepository: CompanyRepository
    private userRepository: UserRepository
    private userCompanyRepository: UserCompanyRepository

    constructor({
        companyRepository,
        userCompanyRepository,
        userRepository
    }: {
        companyRepository: CompanyRepository
        userCompanyRepository: UserCompanyRepository
        userRepository: UserRepository
    }) {
        this.companyRepository = companyRepository
        this.userCompanyRepository = userCompanyRepository
        this.userRepository = userRepository
    }

    async execute({
        name,
        user_id
    }: {
        name: string,
        user_id: string
    }): Promise<{ company: Company, user_company: User_company }> {

        const user = await this.userRepository.findById(user_id)

        if (!user) {
            throw new UserDoesNotExists()
        }

        const company = await this.companyRepository.create({
            name,
        })

        const user_company = await this.userCompanyRepository.create({
            company_id: company.id,
            user_id,
            role: "ADMIN"
        })

        return {
            company,
            user_company
        }
    }
}
