import { describe, expect, it, beforeEach } from 'vitest'
import { InMemoryUserRepository } from '../repositories/in-memory/users.in-memory'
import { RegisterUser, type IRegisterUser } from './register-user'
import { UserAlreadyExists } from './errors/UserAlreadyExists.error'
import { PhoneNumberNotValid } from './errors/PhoneNumberNotValid.error'

describe('Register User Use case', () => {
    let userRepository: InMemoryUserRepository
    let sut: IRegisterUser

    beforeEach(() => {
        userRepository = new InMemoryUserRepository()
        sut = new RegisterUser(userRepository)
    })

    it('should register a new user', async () => {
        const { user } = await sut.execute({
            name: 'John Doe',
            phone: '+12133734253',
        })

        expect(user.id).toEqual(expect.any(String))
    })

    it('should not register user with incompatible phone number', async () => {
        await expect(
            sut.execute({
                name: 'John Doe',
                phone: '2141241321412'
            })
        ).rejects.toBeInstanceOf(PhoneNumberNotValid)
    })

    it('should not register a user with same phone number', async () => {
        await sut.execute({
            name: 'John Doe',
            phone: '+12133734253',
        })

        await expect(sut.execute({
            name: 'Beautifull Joe',
            phone: '+12133734253'
        })).rejects.toBeInstanceOf(UserAlreadyExists)
    })
})