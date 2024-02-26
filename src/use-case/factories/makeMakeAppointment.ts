import { PrismaAppointmentRepository } from "../../repositories/prisma/appointment.prisma";
import { PrismaScheduleRepository } from "../../repositories/prisma/schedule.prisma";
import { PrismaUserRepository } from "../../repositories/prisma/user.prisma"
import { PrismaUserCompanyRepository } from "../../repositories/prisma/user_company.prisma";
import { MakeAppointment } from "../appointments/make-appointment";
import { GetAvailableTimes } from "../get-available-times";

export function makeMakeAppointment() {
    const userRepository = new PrismaUserRepository()
    const appointmentRepository = new PrismaAppointmentRepository()
    const scheduleRepository = new PrismaScheduleRepository()
    const userCompanyRepository = new PrismaUserCompanyRepository()

    const getAvailableTimes = new GetAvailableTimes({
        appointmentRepository,
        scheduleRepository,
        userCompanyRepository
    })
    const sut = new MakeAppointment({
        appointmentRepository,
        getAvailableTimes,
        userCompanyRepository,
        userRepository
    })

    return sut;
}