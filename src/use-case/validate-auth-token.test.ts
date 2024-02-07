import { beforeEach, describe, expect, it } from "vitest";
import type { UserRepository } from "../repositories/user.repository";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import { ValidateAuthToken } from "./validate-auth-token";
import { addMinutes, subMilliseconds, subMinutes } from "date-fns";
import { TokenIsExpired } from "./errors/TokenIsExpired.error";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";
import { TokenWasNotGenerated } from "./errors/TokenWasNotGenerated.error";
import { TokenDoesNotMatch } from "./errors/TokenDoesNotMatch.error";

describe('Validate authentication token', () => {
    let userRepository: UserRepository
    let sut: ValidateAuthToken

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        sut = new ValidateAuthToken(userRepository)
    })

    it('should validate user correctly', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253'
        })

        expect(user.has_confirmed_phone).toBeFalsy()

        await userRepository.update(user.id, {
            token_expiration: addMinutes(new Date(), 7),
            confirmation_token: 123456
        })

        const { user: confirmedUser } = await sut.execute({
            token: 123456,
            user_id: user.id
        })

        expect(confirmedUser.has_confirmed_phone).toBeTruthy()
    })

    it('should validate for existent user', async () => {
        await expect(sut.execute({
            token: 123456,
            user_id: 'bumba meu boi'
        })).rejects.toBeInstanceOf(UserDoesNotExists)
    })

    it('should not validate if token is not generated', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253'
        })

        await expect(sut.execute({
            token: 123456,
            user_id: user.id
        })).rejects.toBeInstanceOf(TokenWasNotGenerated)
    })

    it('should not validate user if token is expired', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253'
        })

        await userRepository.update(user.id, {
            token_expiration: subMilliseconds(new Date(), 1),
            confirmation_token: 123456
        })

        await expect(sut.execute({
            token: 123456,
            user_id: user.id
        })).rejects.toBeInstanceOf(TokenIsExpired)
    })

    it('should not validate user if token does not match', async () => {
        const user = await userRepository.create({
            name: 'John Doe',
            phone: '+12133734253'
        })

        await userRepository.update(user.id, {
            token_expiration: addMinutes(new Date(), 7),
            confirmation_token: 123456
        })

        await expect(sut.execute({
            token: 654321,
            user_id: user.id
        })).rejects.toBeInstanceOf(TokenDoesNotMatch)
    })
})