import type { Appointment, Prisma } from "@prisma/client";
import type { AppointmentRepository, AppointmentTransactionFind } from "../appointment.repository";
import { randomUUID } from "crypto";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import { ArrayTools } from "../utils/ArrayTools";

export class InMemoryAppointmentRepository implements AppointmentRepository {

    items: Appointment[] = []

    async create(data: Prisma.AppointmentUncheckedCreateInput): Promise<Appointment> {
        const appointment: Appointment = {
            id: data.id || randomUUID(),
            title: data.title,
            time: new Date(data.time),
            cancellation_url: data.cancellation_url || null,
            user_id: data.user_id,
            user_company_company_id: data.user_company_company_id,
            user_company_user_id: data.user_company_user_id,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
        }

        this.items.push(appointment)

        return appointment
    }

    async find(appointmentArgs: Prisma.AppointmentFindFirstArgs<DefaultArgs>): Promise<Appointment[]> {
        const { where, orderBy, select } = appointmentArgs

        const item = new ArrayTools<Appointment>(this.items)

        return item.findMany({
            where,
            orderBy,
            select
        })
    }

    async findById(id: string): Promise<Appointment | null> {
        return this.items.find(item => item.id === id) || null
    }

    async transactionFind(payload: AppointmentTransactionFind[]): Promise<Appointment[]> {
        const appointments_all: Appointment[] = []

        for (const transationData of payload) {
            const item = new ArrayTools<Appointment>(this.items)

            const appointments = item.findMany({
                where: transationData.where
            })

            appointments_all.concat(appointments)
        }

        return appointments_all
    }

    async delete(appointment_id: string): Promise<Appointment> {
        const index = this.items.findIndex(item => item.id === appointment_id)

        const [appointment] = this.items.splice(index, 1)

        return appointment
    }

}