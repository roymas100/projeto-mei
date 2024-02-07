import type { Company } from "@prisma/client"
import type { CompanyRepository } from "../repositories/company.repository"
import { CancellationGraceTimeFormat } from "./errors/CancellationGraceTimeFormat.error"
import { CompanyDoesNotExists } from "./errors/CompanyDoesNotExists.error"

export class PatchServiceRules {
    private companyRepository: CompanyRepository

    constructor(companyRepository: CompanyRepository) {
        this.companyRepository = companyRepository
    }

    async execute({
        company_id,
        cancellation_grace_time,
        service_rules
    }: {
        company_id: string,
        cancellation_grace_time?: string,
        service_rules?: string | null
    }): Promise<{ company: Company }> {
        const companyExists = await this.companyRepository.findById(company_id)

        if (!companyExists) {
            throw new CompanyDoesNotExists()
        }

        const grace_time_regex = /^\d{2}:\d{2}:\d{2}$/
        if (cancellation_grace_time && !grace_time_regex.test(cancellation_grace_time)) {
            throw new CancellationGraceTimeFormat()
        }

        const company = await this.companyRepository.update(company_id, {
            cancellation_grace_time,
            service_rules
        })

        return {
            company
        }
    }
}