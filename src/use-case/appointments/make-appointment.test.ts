import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MakeAppointment } from "./make-appointment";
import type { UserRepository } from "../../repositories/user.repository";
import type { CompanyRepository } from "../../repositories/company.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import { $Enums, type Company, type Schedule, type User, type User_company } from "@prisma/client";
import { InMemoryCompanyRepository } from "../../repositories/in-memory/company.in-memory";
import { InMemoryUserRepository } from "../../repositories/in-memory/users.in-memory";
import { InMemoryUserCompanyRepository } from "../../repositories/in-memory/user-company.in-memory";
import { InMemoryScheduleRepository } from "../../repositories/in-memory/schedule.in-memory";
import type { AppointmentRepository } from "../../repositories/appointment.repository";
import { InMemoryAppointmentRepository } from "../../repositories/in-memory/appointment.in-memory";
import { GetAvailableTimes } from "../get-available-times";
import { format, parse, set } from "date-fns";
import { UserCompanyDoesNotExists } from "../errors/UserCompanyDoesNotExists.error";
import { TimeIsNotAvailable } from "../errors/TimeIsNotAvailable.error";
import { AppointmentPastTime } from "../errors/AppointmentPastTime.error";
import { AppointmentTimeTaken } from "../errors/AppointmentTimeTaken.error";
import Sinon from "sinon";
import { env } from "bun";

describe('Create Appointment use case', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository
    let appointmentRepository: AppointmentRepository

    let getAvailableTimes: GetAvailableTimes
    let sut: MakeAppointment

    let user: User
    let company: Company
    let user_company: User_company
    let client: User
    let schedule: Schedule

    let clock: sinon.SinonFakeTimers

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()
        appointmentRepository = new InMemoryAppointmentRepository()
        getAvailableTimes = new GetAvailableTimes({
            scheduleRepository,
            userCompanyRepository,
            appointmentRepository
        })

        sut = new MakeAppointment({
            appointmentRepository,
            userCompanyRepository,
            userRepository,
            getAvailableTimes
        })

    })

    beforeEach(async () => {
        user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        company = await companyRepository.create({
            name: 'John Doe Company'
        })

        user_company = await userCompanyRepository.create({
            company_id: company.id,
            user_id: user.id,
            role: $Enums.COMPANY_ROLE.ADMIN,
        })

        const dates = [
            '02/20/2024',
        ].join(';')


        schedule = await scheduleRepository.create({
            recurrency_type: $Enums.RECURRENCY_TYPE.DATE,
            dates,
            duration_per_appointment: '01:00:00',
            start_of_shift: '08:00:00',
            end_of_shift: '17:00:00',
            intervals: JSON.stringify([]),
            name: 'Default schedule',
            user_company_company_id: company.id,
            user_company_user_id: user.id,
            priority: 1
        })

        client = await userRepository.create({
            name: 'John Client',
            phone: '+12133734254',
        })
    })

    describe('Test if now is 9 am', () => {
        beforeEach(() => {
            clock = Sinon.useFakeTimers(set(new Date(), {
                date: 20,
                month: 1, // February
                year: 2024,
                milliseconds: 0,
                seconds: 0,
                minutes: 0,
                hours: 9
            }));
        })

        afterEach(() => {
            clock.restore()
        })

        it(`should make appointment correctly`, async () => {
            const { appointment } = await sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            expect(appointment.id).toEqual(expect.any(String))
        })

        it(`should create client user if does not exists`, async () => {
            const new_user = {
                phone: '+12133734255',
                name: 'New John Doe'
            }

            const { appointment } = await sut.execute({
                phone: new_user.phone,
                name: new_user.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            expect(appointment.id).toEqual(expect.any(String))
        })

        it(`should not create appointment if user company not exists`, async () => {
            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('09:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: 'Pumba meu boi',
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(UserCompanyDoesNotExists)
        })

        it(`should not create appointment of time that is not in agenda`, async () => {
            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('17:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(TimeIsNotAvailable)
        })

        it('should not create appointment of a past hour', async () => {
            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('08:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(AppointmentPastTime)
        })

        it(`should not make an appointment at same hour as other appointment`, async () => {
            await sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(AppointmentTimeTaken)
        })

        it('should create appointment cancellation url', async () => {
            const { appointment } = await sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            expect(appointment.cancellation_url).toEqual(`${env.CANCELLATION_URL}/${appointment.id}`)
        })
    })

    describe('Test if now is 0 am', () => {
        beforeEach(() => {
            clock = Sinon.useFakeTimers(set(new Date(), {
                date: 20,
                month: 1, // February
                year: 2024,
                milliseconds: 0,
                seconds: 0,
                minutes: 0,
                hours: 0
            }));
        })

        afterEach(() => {
            clock.restore()
        })

        it(`should make appointment correctly`, async () => {
            const { appointment } = await sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            expect(appointment.id).toEqual(expect.any(String))
        })

        it(`should create client user if does not exists`, async () => {
            const new_user = {
                phone: '+12133734255',
                name: 'New John Doe'
            }

            const { appointment } = await sut.execute({
                phone: new_user.phone,
                name: new_user.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            expect(appointment.id).toEqual(expect.any(String))
        })

        it(`should not create appointment if user company not exists`, async () => {
            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('09:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: 'Pumba meu boi',
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(UserCompanyDoesNotExists)
        })

        it(`should not create appointment of time that is not in agenda`, async () => {
            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('17:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(TimeIsNotAvailable)
        })

        it(`should not make an appointment at same hour as other appointment`, async () => {
            await sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })

            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('10:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(AppointmentTimeTaken)
        })
    })

    describe('Test if now is 23 pm', () => {
        beforeEach(() => {
            clock = Sinon.useFakeTimers(set(new Date(), {
                date: 20,
                month: 1, // February
                year: 2024,
                milliseconds: 0,
                seconds: 0,
                minutes: 0,
                hours: 23
            }));
        })

        afterEach(() => {
            clock.restore()
        })

        it('should not create appointment of a past hour', async () => {
            await expect(sut.execute({
                phone: client.phone,
                name: client.name,
                title: 'Appointment title',
                time: parse('15:00:00', 'HH:mm:ss', new Date()),
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            })).rejects.toBeInstanceOf(AppointmentPastTime)
        })
    })
})
