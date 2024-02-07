import { Prisma, type User } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { UserRepository } from "../user.repository";

export class InMemoryUserRepository implements UserRepository {
    items: User[] = []

    async findUserById(id: string): Promise<User | null> {
        return this.items.find(item => item.id === id) ?? null
    }

    async findUserByPhone(phone: string): Promise<User | null> {
        return this.items.find(item => item.phone === phone) ?? null
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        const user: User = {
            id: randomUUID(),
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            has_confirmed_phone: data.has_confirmed_phone || false,
            password_hash: data.password_hash || null,
            confirmation_token: data.confirmation_token || null,
            token_expiration: data.token_expiration ? new Date(data.token_expiration) : null,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
        }

        this.items.push(user)

        return user
    }

    async updateUser(id: string, data: User): Promise<User> {
        const userIndex = this.items.findIndex(item => item.id === id)
        const user = this.items[userIndex]

        const { created_at, id: ommited, password_hash, ...newUserData } = data

        const newUser = {
            ...user,
            ...newUserData,
        }

        this.items[userIndex] = newUser

        return newUser
    }
}