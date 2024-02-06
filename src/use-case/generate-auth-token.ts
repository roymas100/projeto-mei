import type { UserRepository } from "../repositories/user.repository";
import { addMinutes } from 'date-fns'
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";

export class GenerateAuthToken {
    private userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute(user_id: string) {
        const userExists = await this.userRepository.findUserById(user_id)

        if (!userExists) {
            throw new UserDoesNotExists()
        }

        const token = +Math.random().toFixed(4) * 1000

        const { confirmation_token, password_hash, ...user } = await this.userRepository.updateUser(user_id, {
            updated_at: new Date(),
            confirmation_token: token,
            token_expiration: addMinutes(new Date(), 7) // VALID FOR 7 MINUTES
        })

        return { user }
    }
}