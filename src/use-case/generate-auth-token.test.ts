import { beforeEach, describe, expect, it } from "vitest";
import type { UserRepository } from "../repositories/user.repository";
import { GenerateAuthToken } from "./generate-auth-token";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import type { User } from "@prisma/client";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";

describe('Generate authentication token', () => {
    let userRepository: UserRepository
    let sut: GenerateAuthToken

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        sut = new GenerateAuthToken(userRepository)
    })

    it('should generate token to known user', async () => {
        const user = await userRepository.registerUser({
            name: 'John Doe',
            phone: '+55999666333',
        })

        const { user: {
            token_expiration
        } } = await sut.execute(user.id)

        expect(user.token_expiration).toBeNull()
        expect(user.confirmation_token).toBeNull()
        expect(token_expiration).toEqual(expect.any(Date))

        const { confirmation_token } = await userRepository.findUserById(user.id) as User
        expect(confirmation_token).toEqual(expect.any(Number))
    })

    it('should not generate token for an unexisted user', async () => {
        await expect(sut.execute('bumba meu boi')).rejects.toBeInstanceOf(UserDoesNotExists)
    })

    it('should not return token inside response', async () => {
        const { id } = await userRepository.registerUser({
            name: 'John Doe',
            phone: '+55999666333',
        })

        const { user } = await sut.execute(id) as { user: User }

        expect(user['confirmation_token']).toBeUndefined()
    })
})