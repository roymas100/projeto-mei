import { beforeEach, describe, expect, it } from "vitest";
import { PatchServiceRules } from "./patch-service-rules";
import { InMemoryCompanyRepository } from "../repositories/in-memory/company.in-memory";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import type { UserRepository } from "../repositories/user.repository";
import type { CompanyRepository } from "../repositories/company.repository";
import { InMemoryUserCompanyRepository } from "../repositories/in-memory/user-company.in-memory";
import type { UserCompanyRepository } from "../repositories/user-company.repository";
import { CancellationGraceTimeFormat } from "./errors/CancellationGraceTimeFormat.error";
import { CompanyDoesNotExists } from "./errors/CompanyDoesNotExists.error";

describe('Patch service rules', async () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let sut: PatchServiceRules

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        sut = new PatchServiceRules(companyRepository)
    })

    it('should patch company cancellation grace time', async () => {
        const company = await companyRepository.create({
            name: 'Company name'
        })

        const { company: updatedCompany } = await sut.execute({
            company_id: company.id,
            cancellation_grace_time: '02:00:00',
        })

        expect(updatedCompany.cancellation_grace_time).toEqual('02:00:00')
    })

    it('should patch company service rules', async () => {
        const company = await companyRepository.create({
            name: 'Company name'
        })

        const { company: updatedCompany } = await sut.execute({
            company_id: company.id,
            service_rules: 'Pagamento antes da consulta!'
        })

        expect(updatedCompany.service_rules).toEqual('Pagamento antes da consulta!')
    })

    it('should not patch company service rules with unexistent company', async () => {
        await expect(sut.execute({
            company_id: '214125231532',
            service_rules: 'Pagamento antes da consulta!'
        })).rejects.toBeInstanceOf(CompanyDoesNotExists)
    })

    it('should not patch service rule if cancellation grace time was wrong formated', async () => {
        const company = await companyRepository.create({
            name: 'Company name'
        })

        await expect(sut.execute({
            company_id: company.id,
            cancellation_grace_time: '40:00'
        })).rejects.toBeInstanceOf(CancellationGraceTimeFormat)
    })

    it('should not patch if user admin is not logged in', async () => {
        expect(1).toBe(2)
    })
})