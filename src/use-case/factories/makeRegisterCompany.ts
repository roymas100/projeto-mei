import { PrismaCompanyRepository } from "../../repositories/prisma/company.prisma";
import { PrismaUserRepository } from "../../repositories/prisma/user.prisma"
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { RegisterCompany } from "../registerCompany";

export function makeRegisterCompany() {
    const userRepository = new PrismaUserRepository()
    const companyRepository = new PrismaCompanyRepository()
    const userCompanyRepository = new PrismaUserCompanyRepository()
    const sut = new RegisterCompany({
        companyRepository,
        userCompanyRepository,
        userRepository
    })

    return sut;
}