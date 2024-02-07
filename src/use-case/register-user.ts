import type { User } from "@prisma/client"
import type { UserRepository } from "../repositories/user.repository"
import { PhoneNumberNotValid } from "./errors/PhoneNumberNotValid.error"
import { UserAlreadyExists } from "./errors/UserAlreadyExists.error"
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import bcryptjs from "bcryptjs";

export class RegisterUser {
    private userRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute({
        name,
        phone,
        email,
        password
    }: {
        name: string
        phone: string
        password: string
        email?: string | null
    }) {
        if (!isValidPhoneNumber(phone)) {
            throw new PhoneNumberNotValid()
        }

        const phoneNumber = parsePhoneNumber(phone)
        const parsedPhone = phoneNumber.formatInternational()

        const userWithSamePhone = await this.userRepository.findByPhone(parsedPhone)

        if (userWithSamePhone) {
            throw new UserAlreadyExists()
        }

        const password_hash = await bcryptjs.hash(password, 6)

        const user = await this.userRepository.create({
            name,
            email,
            password_hash,
            phone: parsedPhone,
        })

        return {
            user
        }
    }
}