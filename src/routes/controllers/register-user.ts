import type { User } from "@prisma/client"
import { makeRegisterUser } from "../../use-case/factories/makeRegisterUser"
import { t } from "elysia"

export const registerUserBodySchema = t.Object({
    name: t.String({
        examples: ['John Doe'],
        error: 'Must be a string'
    }),
    phone: t.String({
        examples: ['+5571999666333'],
        error: 'Must be a string'
    }),
    password: t.String({
        examples: ['123456'],
        error: 'Must have more than 6 of length size',
        minLength: 6
    }),
    email: t.Optional(t.String({
        format: 'email',
        examples: ['email@provedor.com'],
        error: 'Invalid email'
    }))
})

interface RegisterUserParams {
    request: Request,
    body: {
        name: string,
        phone: string,
        password: string,
        email?: string,
    }
}

export async function registerUser({ request, body: { name, password, phone, email } }: RegisterUserParams) {
    const registerUser = makeRegisterUser()

    const { user } = await registerUser.execute({
        name,
        phone,
        password,
        email
    })

    return { user }
}