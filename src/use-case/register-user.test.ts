import { describe, expect, it, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../repositories/in-memory/users.in-memory'
import { RegisterUser } from './register-user'
import { UserAlreadyExists } from './errors/UserAlreadyExists.error'
import { PhoneNumberNotValid } from './errors/PhoneNumberNotValid.error'
import type { UserRepository } from '../repositories/user.repository'

describe('Register User Use case', () => {
    let userRepository: UserRepository
    let sut: RegisterUser

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        sut = new RegisterUser(userRepository)
    })

    it('should register a new user', async () => {
        const { user } = await sut.execute({
            name: 'John Doe',
            phone: '+12133734253',
            password: '123456'
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('should not register user with incompatible phone number', async () => {
        await expect(
            sut.execute({
                name: 'John Doe',
                phone: '2141241321412',
                password: '123456'
            })
        ).rejects.toBeInstanceOf(PhoneNumberNotValid)
    })

    it('should not register a user with same phone number', async () => {
        await sut.execute({
            name: 'John Doe',
            phone: '+12133734253',
            password: '123456'

        })

        await expect(sut.execute({
            name: 'Beautifull Joe',
            phone: '+12133734253',
            password: '123456'
        })).rejects.toBeInstanceOf(UserAlreadyExists)
    })
})