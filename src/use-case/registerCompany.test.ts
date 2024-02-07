import { beforeEach, describe, expect, it } from "vitest";
import type { UserRepository } from "../repositories/user.repository";
import type { CompanyRepository } from "../repositories/company.repository";
import type { UserCompanyRepository } from "../repositories/user-company.repository";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import { InMemoryUserCompanyRepository } from "../repositories/in-memory/user-company.in-memory";
import { InMemoryCompanyRepository } from "../repositories/in-memory/company.in-memory";
import { RegisterCompany } from "./registerCompany";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";
import { CompanyNameAlreadyExists } from "./errors/CompanyNameAlreadyExists";

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

    it('shoud be possible to create company with different name', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        await sut.execute({
            name: 'Company name placehoulder',
            user_id: user.id
        })

        const { user_company } = await sut.execute({
            name: 'Company name placehoulder 2',
            user_id: user.id
        })

        expect(user_company.user_id).toEqual(user.id)
    })

    it('should not create company with existent name', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        await sut.execute({
            name: 'Company name placehoulder',
            user_id: user.id
        })

        await expect(sut.execute({
            name: 'Company name placehoulder',
            user_id: user.id
        })).rejects.toBeInstanceOf(CompanyNameAlreadyExists)
    })

    // 02/07/2024 - could not think a way to reproduce this error
    // it('should not create company if user_company already exists')

    it('Should not register company if user does not exists', async () => {
        await expect(sut.execute({
            name: 'Company name placehoulder',
            user_id: 'bumba meu boi'
        })).rejects.toBeInstanceOf(UserDoesNotExists)
    })
})