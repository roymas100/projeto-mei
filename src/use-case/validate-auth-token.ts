import type { User } from "@prisma/client";
import { isAfter } from 'date-fns'
import type { UserRepository } from "../repositories/user.repository";
import { UserDoesNotExists } from "./errors/UserDoesNotExists.error";
import { TokenIsExpired } from "./errors/TokenIsExpired.error";
import { TokenWasNotGenerated } from "./errors/TokenWasNotGenerated.error";
import { TokenDoesNotMatch } from "./errors/TokenDoesNotMatch.error";

export class ValidateAuthToken {
    private userRepository: UserRepository

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute({
        user_id, token
    }: { user_id: string, token: number }): Promise<{ user: User }> {
        const user = await this.userRepository.findById(user_id)

        if (!user) {
            throw new UserDoesNotExists()
        }

        if (!user.confirmation_token || !user.token_expiration) {
            throw new TokenWasNotGenerated()
        }

        if (isAfter(new Date(), user.token_expiration)) {
            throw new TokenIsExpired()
        }

        if (user.confirmation_token !== token) {
            throw new TokenDoesNotMatch()
        }

        const confirmedUser = await this.userRepository.update(user_id, {
            has_confirmed_phone: true
        })

        return {
            user: confirmedUser
        }
    }
}