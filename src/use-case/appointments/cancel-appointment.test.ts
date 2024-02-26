import { $Enums, type Appointment, type Company, type Schedule, type User, type User_company } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { UserRepository } from "../../repositories/user.repository";
import type { CompanyRepository } from "../../repositories/company.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import type { ScheduleRepository } from "../../repositories/schedule.repository";
import type { AppointmentRepository } from "../../repositories/appointment.repository";
import { CancelAppointment } from "./cancel-appointment";
import { InMemoryUserRepository } from "../../repositories/in-memory/users.in-memory";
import { InMemoryCompanyRepository } from "../../repositories/in-memory/company.in-memory";
import { InMemoryUserCompanyRepository } from "../../repositories/in-memory/user-company.in-memory";
import { InMemoryScheduleRepository } from "../../repositories/in-memory/schedule.in-memory";
import { InMemoryAppointmentRepository } from "../../repositories/in-memory/appointment.in-memory";
import { format, set } from "date-fns";
import { NotPossibleCancelAppointment } from "../errors/NotPossibleCancelAppointment.error";
import Sinon from "sinon";
import { Unauthorized } from "../errors/Unauthorized.error";
import { ItemDoesNotExists } from "../errors/ItemDoesNotExists.error";
import { CompanyDoesNotExists } from "../errors/CompanyDoesNotExists.error";

describe('Cancel appointment', () => {
    let userRepository: UserRepository
    let companyRepository: CompanyRepository
    let userCompanyRepository: UserCompanyRepository
    let scheduleRepository: ScheduleRepository
    let appointmentRepository: AppointmentRepository

    let sut: CancelAppointment

    let user: User
    let company: Company
    let user_company: User_company
    let client: User
    let schedule: Schedule
    let appointment: Appointment

    let clock: sinon.SinonFakeTimers

    beforeEach(() => {
        clock = Sinon.useFakeTimers(set(new Date(), {
            date: 20,
            month: 1, // February
            year: 2024,
            milliseconds: 0,
            seconds: 0,
            minutes: 0,
            hours: 13
        }));
    })

    afterEach(() => {
        clock.restore()
    })


    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        companyRepository = new InMemoryCompanyRepository()
        userCompanyRepository = new InMemoryUserCompanyRepository()
        scheduleRepository = new InMemoryScheduleRepository()
        appointmentRepository = new InMemoryAppointmentRepository()

        sut = new CancelAppointment({
            appointmentRepository,
            companyRepository,
        })

    })

    beforeEach(async () => {
        user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253',
        })

        company = await companyRepository.create({
            name: 'John Doe Company',
            cancellation_grace_time: '00:30:00'
        })

        user_company = await userCompanyRepository.create({
            company_id: company.id,
            user_id: user.id,
            role: $Enums.COMPANY_ROLE.ADMIN,
        })

        const dates = [
            format(new Date(), 'MM/dd/yyyy'),
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

        appointment = await appointmentRepository.create({
            time: set(new Date(), {
                hours: 14,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            }),
            title: 'Doctor appointment',
            user_company_company_id: user_company.company_id,
            user_company_user_id: user_company.user_id,
            user_id: client.id
        })
    })

    it('should delete an appointment when cancel', async () => {
        const { appointment: canceledAppointment } = await sut.execute({
            appointment_id: appointment.id,
        })

        const appointments = await appointmentRepository.find({
            where: {
                user_company_company_id: user_company.company_id,
                user_company_user_id: user_company.user_id,
            }
        })

        expect(canceledAppointment.id).toEqual(expect.any(String))
        expect(appointments.length).toEqual(0)
    })

    it('should not cancel an appointment during and after cancellation grace time', async () => {
        await companyRepository.update(company.id, {
            cancellation_grace_time: '01:00:00'
        })

        await expect(sut.execute({
            appointment_id: appointment.id,
        })).rejects.toBeInstanceOf(NotPossibleCancelAppointment)
    })

    it('should not cancel an appointment if appointment not exists', async () => {
        await expect(sut.execute({
            appointment_id: 'Pumba meu boi',
        })).rejects.toBeInstanceOf(ItemDoesNotExists)
    })

    it('should not cancel an appointment if company not exist', async () => {
        appointment = await appointmentRepository.create({
            time: set(new Date(), {
                hours: 14,
                minutes: 0,
                seconds: 0,
                milliseconds: 0
            }),
            title: 'Doctor appointment',
            user_company_company_id: 'Pumba meu boi',
            user_company_user_id: user_company.user_id,
            user_id: client.id
        })

        await expect(sut.execute({
            appointment_id: appointment.id,
        })).rejects.toBeInstanceOf(CompanyDoesNotExists)
    })
})