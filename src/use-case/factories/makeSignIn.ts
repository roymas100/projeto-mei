import { PrismaUserRepository } from "../../repositories/prisma/user.prisma"
import { SignIn } from "../sign-in";

export function makeSignIn() {
    const userRepository = new PrismaUserRepository()
    const sut = new SignIn(userRepository)

    return sut;
}