import type { Prisma, User } from "@prisma/client";

export interface UserRepository {
    create(data: Prisma.UserCreateInput): Promise<User>
    update(id: string, data: Prisma.UserUncheckedUpdateInput): Promise<User>
    findById(user_id: string): Promise<User | null>
    findByPhone(phone: string): Promise<User | null>
}