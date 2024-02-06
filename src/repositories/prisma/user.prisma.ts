import type { Prisma, User } from "@prisma/client";
import type { UserRepository } from "../user.repository";
import { prisma } from "../../setups/prisma";

export class PrismaUserRepository implements UserRepository {
    async findUserById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                id
            }
        })
    }

    async registerUser(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        })
    }

    async findUserByPhone(phone: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                phone
            }
        })
    }

    async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return await prisma.user.update({
            data,
            where: {
                id
            }
        })
    }
}
