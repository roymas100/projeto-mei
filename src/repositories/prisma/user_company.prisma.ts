import type { $Enums, Prisma, User_company } from "@prisma/client";
import type { UserCompanyRepository } from "../user-company.repository";
import { prisma } from "../../setups/prisma";

export class PrismaUserCompanyRepository implements UserCompanyRepository {
    async create(data: Prisma.User_companyUncheckedCreateInput): Promise<User_company> {
        return await prisma.user_company.create({
            data
        })
    }

    async findByIds({ company_id, user_id }: { user_id: string; company_id: string; }): Promise<User_company | null> {
        return await prisma.user_company.findUnique({
            where: {
                user_id_company_id: { user_id, company_id }
            }
        })
    }
}
