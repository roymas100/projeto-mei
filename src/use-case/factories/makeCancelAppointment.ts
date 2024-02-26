import { PrismaAppointmentRepository } from "../../repositories/prisma/appointment.prisma";
import { PrismaCompanyRepository } from "../../repositories/prisma/company.prisma";
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { CancelAppointment } from "../appointments/cancel-appointment";

export function makeCancelAppointment() {
    const appointmentRepository = new PrismaAppointmentRepository()
    const companyRepository = new PrismaCompanyRepository()
    const userCompanyRepository = new PrismaUserCompanyRepository()

    const sut = new CancelAppointment({
        appointmentRepository,
        companyRepository,
        userCompanyRepository,
    })

    return sut;
}