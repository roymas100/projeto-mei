import type { Prisma, User_company } from "@prisma/client"

export interface UserCompanyRepository {
    create(data: Prisma.User_companyUncheckedCreateInput): Promise<User_company>
    findByCompanyId(company_id: string): Promise<User_company | null>
    findByUserId(user_id: string): Promise<User_company | null>
}