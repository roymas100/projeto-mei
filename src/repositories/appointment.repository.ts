import type { Appointment, Prisma } from "@prisma/client";

export interface AppointmentTransactionFind {
    where: Prisma.AppointmentWhereUniqueInput,
}

export interface AppointmentRepository {
    create(data: Prisma.AppointmentUncheckedCreateInput): Promise<Appointment>
    find(appointmentArgs: Prisma.AppointmentFindFirstArgs): Promise<Appointment[]>
    transactionFind(payload: AppointmentTransactionFind[]): Promise<Appointment[]>
}