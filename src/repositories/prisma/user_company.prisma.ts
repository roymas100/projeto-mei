import type { Prisma, User_company } from "@prisma/client";
import type { UserCompanyRepository } from "../user-company.repository";
import { prisma } from "../../setups/prisma";

export class PrismaUserCompanyRepository implements UserCompanyRepository {
    async create(data: Prisma.User_companyUncheckedCreateInput): Promise<User_company> {
        return await prisma.user_company.create({
            data
        })
    }
    findByCompanyId(company_id: string): Promise<User_company | null> {
        throw new Error("Method not implemented.");
    }
    findByUserId(user_id: string): Promise<User_company | null> {
        throw new Error("Method not implemented.");
    }
}
