import type { Prisma, User } from "@prisma/client";

export interface UserRepository {
    create(data: Prisma.UserCreateInput): Promise<User>
    updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>
    findUserById(user_id: string): Promise<User | null>
    findUserByPhone(phone: string): Promise<User | null>
}