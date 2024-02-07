import { $Enums, Prisma, type User_company } from "@prisma/client";
import type { UserCompanyRepository } from "../user-company.repository";

export class InMemoryUserCompanyRepository implements UserCompanyRepository {
    items: User_company[] = []

    async create(data: Prisma.User_companyUncheckedCreateInput): Promise<User_company> {
        const user_company: User_company = {
            company_id: data.company_id,
            user_id: data.user_id,
            role: data.role ?? $Enums.COMPANY_ROLE.EMPLOYEE,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
        }

        this.items.push(user_company)

        return user_company
    }

    async findByCompanyId(company_id: string): Promise<User_company | null> {
        return this.items.find(item => item.company_id === company_id) ?? null
    }

    async findByUserId(user_id: string): Promise<User_company | null> {
        return this.items.find(item => item.user_id === user_id) ?? null
    }

}