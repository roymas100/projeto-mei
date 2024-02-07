import type { Prisma, User } from "@prisma/client";
import type { UserRepository } from "../user.repository";
import { prisma } from "../../setups/prisma";

export class PrismaUserRepository implements UserRepository {
    async findById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                id
            }
        })
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data,
        })
    }

    async findByPhone(phone: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: {
                phone
            }
        })
    }

    async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
        return await prisma.user.update({
            data,
            where: {
                id
            }
        })
    }
}
