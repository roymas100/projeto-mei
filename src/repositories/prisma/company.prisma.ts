import type { Company, Prisma } from "@prisma/client";
import type { CompanyRepository } from "../company.repository";
import { prisma } from "../../setups/prisma";

export class PrismaCompanyRepository implements CompanyRepository {
    async create(data: Prisma.CompanyCreateInput): Promise<Company> {
        return await prisma.company.create({
            data
        })
    }
    async findById(company_id: string): Promise<Company | null> {
        return await prisma.company.findUnique({
            where: {
                id: company_id
            }
        })
    }
    async findByName(name: string): Promise<Company | null> {
        return await prisma.company.findUnique({
            where: {
                name
            }
        })
    }
    async update(id: string, data: Prisma.CompanyUpdateInput): Promise<Company> {
        return await prisma.company.update({
            data,
            where: {
                id
            }
        })
    }
}
