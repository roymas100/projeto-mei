import type { Appointment, Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import type { AppointmentRepository, AppointmentTransactionFind } from "../appointment.repository";
import { prisma } from "../../setups/prisma";

export class PrismaAppointmentRepository implements AppointmentRepository {
    delete(appointment_id: string): Promise<Appointment> {
        return prisma.appointment.delete({
            where: {
                id: appointment_id
            }
        })
    }

    create(data: Prisma.AppointmentUncheckedCreateInput): Promise<Appointment> {
        return prisma.appointment.create({
            data
        })
    }
    find(appointmentArgs: Prisma.AppointmentFindFirstArgs<DefaultArgs>): Promise<Appointment[]> {
        return prisma.appointment.findMany(appointmentArgs)
    }

    findById(id: string): Promise<Appointment | null> {
        return prisma.appointment.findUnique({
            where: {
                id
            }
        })
    }
    transactionFind(payload: AppointmentTransactionFind[]): Promise<Appointment[]> {
        throw new Error("Method not implemented.");
    }
}