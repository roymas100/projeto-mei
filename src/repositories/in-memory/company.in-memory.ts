import type { Company, Prisma } from "@prisma/client";
import type { CompanyRepository } from "../company.repository";
import { randomUUID } from "crypto";

export class InMemoryCompanyRepository implements CompanyRepository {

    items: Company[] = []

    async create(data: Prisma.CompanyCreateInput): Promise<Company> {
        const company: Company = {
            id: randomUUID(),
            name: data.name,
            service_rules: data.service_rules ?? null,
            cancellation_grace_time: data.cancellation_grace_time ?? '01:00:00',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
        }

        this.items.push(company)

        return company
    }
    async findById(company_id: string): Promise<Company | null> {
        return this.items.find(item => item.id === company_id) ?? null
    }
    async findByName(name: string): Promise<Company | null> {
        return this.items.find(item => item.name === name) ?? null
    }

    async update(id: string, data: Company): Promise<Company> {
        const companyIndex = this.items.findIndex(item => item.id === id)
        const company = this.items[companyIndex]

        const { created_at, id: ommited, ...newCompanyData } = data

        const newcompany: Company = {
            ...company,
            ...newCompanyData,
        }

        this.items[companyIndex] = newcompany

        return newcompany
    }
}