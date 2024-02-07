import { beforeEach, describe, expect, it } from "vitest";
import type { UserRepository } from "../repositories/user.repository";
import type { CompanyRepository } from "../repositories/company.repository";
import type { UserCompanyRepository } from "../repositories/user-company.repository";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import { InMemoryUserCompanyRepository } from "../repositories/in-memory/user-company.in-memory";
import { InMemoryCompanyRepository } from "../repositories/in-memory/company.in-memory";
import { RegisterCompany } from "./registerCompany";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";

describe('Register company', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let sut: RegisterCompany

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        sut = new RegisterCompany({
            companyRepository,
            userCompanyRepository,
            userRepository
        })
    })

    it('Should register company correctly', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        const { company, user_company } = await sut.execute({
            name: 'Company name placehoulder',
            user_id: user.id
        })

        expect(company.id).toEqual(expect.any(String))
    })

    it('should create conection between tabels correctly', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        const { user_company } = await sut.execute({
            name: 'Company name placehoulder',
            user_id: user.id
        })

        expect(user_company.user_id).toEqual(user.id)
    })

    it('should be ADMIN who creates the company', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        const { user_company } = await sut.execute({
            name: 'Company name placehoulder',
            user_id: user.id
        })

        expect(user_company.role).toBe('ADMIN')
    })

    it('Should not register company if user does not exists', async () => {
        await expect(sut.execute({
            name: 'Company name placehoulder',
            user_id: 'bumba meu boi'
        })).rejects.toBeInstanceOf(UserDoesNotExists)
    })
})