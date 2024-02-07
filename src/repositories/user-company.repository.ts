import type { Prisma, User_company } from "@prisma/client"

export interface UserCompanyRepository {
    create(data: Prisma.User_companyUncheckedCreateInput): Promise<User_company>
    findByIds(payload: { user_id: string, company_id: string }): Promise<User_company | null>
}