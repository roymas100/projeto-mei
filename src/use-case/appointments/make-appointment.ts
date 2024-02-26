import type { Appointment } from "@prisma/client";
import type { AppointmentRepository } from "../../repositories/appointment.repository";
import type { UserRepository } from "../../repositories/user.repository";
import type { UserCompanyRepository } from "../../repositories/user-company.repository";
import type { GetAvailableTimes } from "../get-available-times";
import { format, isBefore } from "date-fns";
import { isSameDates } from "../../utils/isSameDates";
import { UserCompanyDoesNotExists } from "../errors/UserCompanyDoesNotExists.error";
import { TimeIsNotAvailable } from "../errors/TimeIsNotAvailable.error";
import { AppointmentPastTime } from "../errors/AppointmentPastTime.error";
import { AppointmentTimeTaken } from "../errors/AppointmentTimeTaken.error";
import { env } from "bun";
import { randomUUID } from "crypto";

export class MakeAppointment {
    private appointmentRepository: AppointmentRepository
    private userRepository: UserRepository
    private userCompanyRepository: UserCompanyRepository
    private getAvailableTimes: GetAvailableTimes

    constructor({
        appointmentRepository,
        userCompanyRepository,
        userRepository,
        getAvailableTimes
    }: {
        appointmentRepository: AppointmentRepository
        userRepository: UserRepository
        userCompanyRepository: UserCompanyRepository
        getAvailableTimes: GetAvailableTimes
    }) {
        this.userRepository = userRepository
        this.userCompanyRepository = userCompanyRepository
        this.appointmentRepository = appointmentRepository
        this.getAvailableTimes = getAvailableTimes
    }

    private async findAvailableId(): Promise<string> {
        const id = randomUUID()

        const appointmentExist = await this.appointmentRepository.findById(id)

        if (appointmentExist) {
            return this.findAvailableId()
        }

        return id
    }


    async execute({
        title,
        time,
        user_company_company_id,
        user_company_user_id,
        name,
        phone
    }: {
        user_company_user_id: string
        user_company_company_id: string
        title: string
        time: Date
        name: string
        phone: string
    }): Promise<{ appointment: Appointment }> {
        if (isBefore(time, new Date())) {
            throw new AppointmentPastTime()
        }

        const user_company = await this.userCompanyRepository.findByIds({
            company_id: user_company_company_id,
            user_id: user_company_user_id
        })

        if (!user_company) {
            throw new UserCompanyDoesNotExists()
        }

        let client_id: string

        const userExists = await this.userRepository.findByPhone(phone)

        if (userExists) {
            client_id = userExists.id
        } else {
            const user = await this.userRepository.create({
                name,
                phone
            })

            client_id = user.id
        }

        const isAppointmentExists = await this.appointmentRepository.find({
            where: {
                time,
            }
        })

        if (isAppointmentExists.length > 0) {
            throw new AppointmentTimeTaken()
        }

        const { times } = await this.getAvailableTimes.execute({
            company_id: user_company_company_id,
            user_id: user_company_user_id,
            date: format(time, 'MM/dd/yyyy')
        })

        if (!times.some(item => isSameDates((item.start), time))) {
            throw new TimeIsNotAvailable()
        }

        const id = await this.findAvailableId()

        const appointment = await this.appointmentRepository.create({
            id,
            title,
            time,
            user_company_company_id,
            user_company_user_id,
            user_id: client_id,
            cancellation_url: `${env.CANCELLATION_URL}/${id}`
        })

        return {
            appointment
        }
    }
}