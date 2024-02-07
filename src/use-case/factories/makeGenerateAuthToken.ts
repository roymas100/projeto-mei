import { PrismaUserRepository } from "../../repositories/prisma/user.prisma"
import { GenerateAuthToken } from "../generate-auth-token";

export function makeGenerateAuthToken() {
    const userRepository = new PrismaUserRepository()
    const sut = new GenerateAuthToken(userRepository)

    return sut;
}