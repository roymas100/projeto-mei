import { PrismaUserRepository } from "../../repositories/prisma/user.prisma"
import { RegisterUser } from "../register-user"

export function makeRegisterUser() {
    const userRepository = new PrismaUserRepository()
    const sut = new RegisterUser(userRepository)

    return sut;
}