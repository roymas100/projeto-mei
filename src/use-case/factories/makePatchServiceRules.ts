import { PrismaCompanyRepository } from "../../repositories/prisma/company.prisma";
import { PatchServiceRules } from "../patch-service-rules";

export function makePatchServiceRules() {
    const companyRepository = new PrismaCompanyRepository()
    const sut = new PatchServiceRules(companyRepository)

    return sut;
}