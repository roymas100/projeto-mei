import { PrismaUserRepository } from "../../repositories/prisma/user.prisma"
import { ValidateAuthToken } from "../validate-auth-token";

export function makeValidateAuthToken() {
    const userRepository = new PrismaUserRepository()
    const sut = new ValidateAuthToken(userRepository)

    return sut;
}