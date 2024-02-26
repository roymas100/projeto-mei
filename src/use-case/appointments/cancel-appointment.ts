import { sub } from "date-fns"
import type { AppointmentRepository } from "../../repositories/appointment.repository"
import type { CompanyRepository } from "../../repositories/company.repository"
import { isSameOrAfter } from "../../utils/isSameDates"
import { Unauthorized } from "../errors/Unauthorized.error"
import { NotPossibleCancelAppointment } from "../errors/NotPossibleCancelAppointment.error"
import { ItemDoesNotExists } from "../errors/ItemDoesNotExists.error"
import { CompanyDoesNotExists } from "../errors/CompanyDoesNotExists.error"

export class CancelAppointment {
    private appointmentRepository: AppointmentRepository
    private companyRepository: CompanyRepository

    constructor({
        appointmentRepository,
        companyRepository
    }: {
        appointmentRepository: AppointmentRepository
        companyRepository: CompanyRepository
    }) {
        this.appointmentRepository = appointmentRepository
        this.companyRepository = companyRepository
    }

    async execute({
        appointment_id,
    }: {
        appointment_id: string
    }) {
        const appointment = await this.appointmentRepository.findById(appointment_id)

        if (!appointment) {
            throw new ItemDoesNotExists()
        }

        const company = await this.companyRepository.findById(appointment.user_company_company_id)

        if (!company) {
            throw new CompanyDoesNotExists()
        }

        const [hours, minutes, seconds] = company.cancellation_grace_time.split(':')

        if (isSameOrAfter(new Date(), sub(appointment.time, {
            hours: +hours,
            minutes: +minutes,
            seconds: +seconds
        }))) {
            throw new NotPossibleCancelAppointment()
        }

        await this.appointmentRepository.delete(appointment_id)

        return {
            appointment
        }
    }
}