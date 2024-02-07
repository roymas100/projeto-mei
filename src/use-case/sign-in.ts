import type { User } from "@prisma/client"
import type { UserRepository } from "../repositories/user.repository"
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js"
import { PhoneNumberNotValid } from "./errors/PhoneNumberNotValid.error"
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error"
import bcryptjs from "bcryptjs";
import { InvalidCredentials } from "./errors/InvalidCredentials.error"

export class SignIn {
    private userRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute({
        phone,
        password,
    }: { phone: string, password: string }): Promise<{ token_data: {}, user: User }> {
        if (!isValidPhoneNumber(phone)) {
            throw new PhoneNumberNotValid()
        }

        const phoneNumber = parsePhoneNumber(phone)
        const parsedPhone = phoneNumber.formatInternational()

        const user = await this.userRepository.findByPhone(parsedPhone)

        if (!user) {
            throw new UserDoesNotExists()
        }

        if (!user.password_hash) {
            throw new Error('User was not registrated')
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password_hash)

        if (!isPasswordValid) {
            throw new InvalidCredentials()
        }

        return {
            token_data: {},
            user
        }
    }
}