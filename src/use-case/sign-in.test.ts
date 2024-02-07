import { beforeEach, describe, expect, it } from "vitest";
import type { UserRepository } from "../repositories/user.repository";
import { InMemoryUserRepository } from "../repositories/in-memory/users.in-memory";
import { SignIn } from "./sign-in";
import { hash } from "bcryptjs";
import { InvalidCredentials } from "./errors/InvalidCredentials.error";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";
import { parsePhoneNumber } from "libphonenumber-js";

describe('Sign in', () => {
    let userRepository: UserRepository
    let sut: SignIn

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        sut = new SignIn(userRepository)
    })

    async function createUser(userRepository: UserRepository) {
        const password_hash = await hash('123456', 6)

        const phoneNumber = parsePhoneNumber('+12133734253')
        const phone = phoneNumber.formatInternational()

        await userRepository.create({
            name: 'John Doe',
            phone,
            password_hash
        })
    }

    it('should login successfully', async () => {
        await createUser(userRepository)

        const { user } = await sut.execute({
            phone: '+12133734253',
            password: '123456',
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('should not login with wrong phone', async () => {
        await createUser(userRepository)

        await expect(sut.execute({
            phone: '+5571999666333',
            password: '123456',
        })).rejects.toBeInstanceOf(UserDoesNotExists)
    })

    it('should not login with wrong password', async () => {
        await createUser(userRepository)

        await expect(sut.execute({
            phone: '+12133734253',
            password: '654321',
        })).rejects.toBeInstanceOf(InvalidCredentials)
    })

    it('should retrieve a valid token', async () => {
        await createUser(userRepository)

        const { token_data } = await sut.execute({
            phone: '+12133734253',
            password: '123456',
        })
    })
}) 
