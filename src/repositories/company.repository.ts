import type { Prisma, Company } from "@prisma/client";

export interface CompanyRepository {
    create(data: Prisma.CompanyCreateInput): Promise<Company>
    update(id: string, data: Prisma.CompanyUpdateInput): Promise<Company>
    findById(company_id: string): Promise<Company | null>
    findByName(name: string): Promise<Company | null>
}