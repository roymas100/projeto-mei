import type { User } from "@prisma/client"
import type { UserRepository } from "../repositories/user.repository"
import { PhoneNumberNotValid } from "./errors/PhoneNumberNotValid.error"
import { UserAlreadyExists } from "./errors/UserAlreadyExists.error"
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

export interface IRegisterUser {
    execute(payload: { name: string, email?: string | null, phone: string }): Promise<{ user: User }>
}

export class RegisterUser implements IRegisterUser {
    private userRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute({
        name,
        phone,
        email
    }: {
        name: string
        phone: string
        email?: string | null
    }) {
        if (!isValidPhoneNumber(phone)) {
            throw new PhoneNumberNotValid()
        }

        const phoneNumber = parsePhoneNumber(phone)
        const parsedPhone = phoneNumber.formatInternational()

        const userWithSamePhone = await this.userRepository.findUserByPhone(parsedPhone)

        if (userWithSamePhone) {
            throw new UserAlreadyExists()
        }

        const user = await this.userRepository.registerUser({
            name,
            email,
            phone: parsedPhone,
        })

        return {
            user
        }
    }
}